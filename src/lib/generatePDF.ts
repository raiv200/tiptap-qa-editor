import { jsPDF } from "jspdf";
import {
  PageSettings,
  getEffectiveDimensions,
} from "@/types/export";

interface Section {
  id: number;
  title: string;
  questions: {
    id: string;
    title: string;
    fullQuestion: string;
  }[];
}

interface GeneratePDFOptions {
  sections: Section[];
  getAnswer: (id: string) => string;
  getStatus: (id: string) => string;
  pageSettings: PageSettings;
  documentTitle?: string;
}

// Convert HTML to plain text while preserving some formatting
const htmlToText = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

export const generatePDF = async ({
  sections,
  getAnswer,
  getStatus,
  pageSettings,
  documentTitle = "Enterprise Cloud Solutions RFP",
}: GeneratePDFOptions): Promise<Blob> => {
  const dimensions = getEffectiveDimensions(
    pageSettings.pageSize,
    pageSettings.orientation
  );

  // Create PDF with correct orientation
  const pdf = new jsPDF({
    orientation: pageSettings.orientation === "landscape" ? "l" : "p",
    unit: "mm",
    format: [dimensions.width, dimensions.height],
  });

  const { margins } = pageSettings;
  const contentWidth = dimensions.width - margins.left - margins.right;

  let currentY = margins.top;

  const addNewPage = () => {
    pdf.addPage();
    currentY = margins.top;
  };

  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > dimensions.height - margins.bottom) {
      addNewPage();
    }
  };

  // Document Title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(31, 41, 55); // gray-800
  pdf.text(documentTitle, margins.left, currentY);
  currentY += 8;

  // Subtitle
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(107, 114, 128); // gray-500
  pdf.text("Response Document", margins.left, currentY);
  currentY += 8;

  // Horizontal line
  pdf.setDrawColor(229, 231, 235); // gray-200
  pdf.setLineWidth(0.5);
  pdf.line(margins.left, currentY, dimensions.width - margins.right, currentY);
  currentY += 10;

  // Sections
  for (const section of sections) {
    // Section Header
    checkPageBreak(20);

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(31, 41, 55);
    pdf.text(`Section ${section.id}: ${section.title}`, margins.left, currentY);
    currentY += 6;

    // Section underline
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(margins.left, currentY, dimensions.width - margins.right, currentY);
    currentY += 8;

    if (section.questions.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(156, 163, 175); // gray-400
      pdf.text("No questions in this section", margins.left, currentY);
      currentY += 10;
      continue;
    }

    // Questions
    for (const question of section.questions) {
      const answer = getAnswer(question.id);
      const hasAnswer =
        answer && answer !== "<p></p>" && answer.trim() !== "";

      // Estimate required height
      const answerText = hasAnswer ? htmlToText(answer) : "No answer provided yet";
      const estimatedLines = Math.ceil(answerText.length / 80) + 4;
      const estimatedHeight = estimatedLines * 5;

      checkPageBreak(Math.min(estimatedHeight, 60));

      // Question title (NO checkmark/status indicator)
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(31, 41, 55);
      const titleLines = pdf.splitTextToSize(question.title, contentWidth);
      titleLines.forEach((line: string, index: number) => {
        pdf.text(line, margins.left, currentY + index * 4);
      });
      currentY += titleLines.length * 4 + 2;

      // Full question
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(75, 85, 99); // gray-600
      const questionLines = pdf.splitTextToSize(
        question.fullQuestion,
        contentWidth
      );
      questionLines.forEach((line: string, index: number) => {
        if (currentY + index * 4 > dimensions.height - margins.bottom) {
          addNewPage();
          currentY = margins.top;
        }
        pdf.text(line, margins.left, currentY + index * 4);
      });
      currentY += questionLines.length * 4 + 4;

      // Answer (NO gray background)
      checkPageBreak(15);

      if (hasAnswer) {
        const answerTextClean = htmlToText(answer);
        const answerLines = pdf.splitTextToSize(answerTextClean, contentWidth);

        // Answer text - clean, no background
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81); // gray-700

        for (const line of answerLines) {
          if (currentY > dimensions.height - margins.bottom - 4) {
            addNewPage();
          }
          pdf.text(line, margins.left, currentY);
          currentY += 4;
        }
        currentY += 4;
      } else {
        // No answer placeholder
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(156, 163, 175);
        pdf.text("No answer provided yet", margins.left, currentY);
        currentY += 8;
      }

      currentY += 6;
    }

    currentY += 6;
  }

  // Add page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      dimensions.width / 2,
      dimensions.height - margins.bottom / 2,
      { align: "center" }
    );
  }

  return pdf.output("blob");
};
