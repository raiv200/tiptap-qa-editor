import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  PageOrientation,
  Footer,
  PageNumber,
  Header,
  convertMillimetersToTwip,
} from "docx";
import {
  PageSettings,
  getEffectiveDimensions,
  mmToDxa,
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

interface GenerateDOCXOptions {
  sections: Section[];
  getAnswer: (id: string) => string;
  getStatus: (id: string) => string;
  pageSettings: PageSettings;
  documentTitle?: string;
}

// Convert HTML to plain text - robust version that works in browser
const htmlToPlainText = (html: string): string => {
  if (!html || html === "<p></p>") return "";
  
  // Create a temporary element to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;
  
  // Get text content
  let text = temp.textContent || temp.innerText || "";
  
  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  return text;
};

// Parse HTML and convert to TextRun array with formatting
const parseHTMLToTextRuns = (html: string): TextRun[] => {
  if (!html || html === "<p></p>") {
    return [new TextRun({ text: "", size: 22 })];
  }

  const runs: TextRun[] = [];
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const processNode = (
    node: Node,
    formatting: { bold?: boolean; italic?: boolean; underline?: boolean } = {}
  ) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold: formatting.bold,
            italics: formatting.italic,
            underline: formatting.underline ? {} : undefined,
            size: 22,
            color: "374151", // gray-700
          })
        );
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      const newFormatting = { ...formatting };

      switch (tagName) {
        case "strong":
        case "b":
          newFormatting.bold = true;
          break;
        case "em":
        case "i":
          newFormatting.italic = true;
          break;
        case "u":
          newFormatting.underline = true;
          break;
        case "br":
          runs.push(new TextRun({ break: 1 }));
          return;
      }

      element.childNodes.forEach((child) => processNode(child, newFormatting));
    }
  };

  temp.childNodes.forEach((child) => processNode(child));

  return runs.length > 0 ? runs : [new TextRun({ text: "", size: 22 })];
};

// Convert HTML to paragraphs for complex content
const parseHTMLToParagraphs = (html: string): Paragraph[] => {
  if (!html || html === "<p></p>") {
    return [];
  }

  const paragraphs: Paragraph[] = [];
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const processElement = (element: Element | ChildNode) => {
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent?.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text, size: 22, color: "374151" })],
            spacing: { before: 80, after: 80 },
            indent: { left: convertMillimetersToTwip(5) },
          })
        );
      }
      return;
    }

    if (element.nodeType !== Node.ELEMENT_NODE) return;

    const el = element as Element;
    const tagName = el.tagName.toLowerCase();

    if (tagName === "ul" || tagName === "ol") {
      const listItems = el.querySelectorAll(":scope > li");
      listItems.forEach((li, index) => {
        const textContent = li.textContent || "";
        const isOrdered = tagName === "ol";

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: isOrdered ? `${index + 1}. ${textContent}` : `• ${textContent}`,
                size: 22,
                color: "374151",
              }),
            ],
            indent: { left: convertMillimetersToTwip(10) },
            spacing: { before: 60, after: 60 },
          })
        );
      });
    } else if (tagName === "p" || tagName === "div") {
      const runs = parseHTMLToTextRuns(el.innerHTML);
      if (runs.length > 0 && runs.some(r => r)) {
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: { before: 80, after: 80 },
            indent: { left: convertMillimetersToTwip(5) },
          })
        );
      }
    } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
      const level = parseInt(tagName[1]);
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: el.textContent || "",
              bold: true,
              size: 28 - level * 2,
              color: "1F2937",
            }),
          ],
          spacing: { before: 200, after: 100 },
          indent: { left: convertMillimetersToTwip(5) },
        })
      );
    } else {
      // For other elements, try to get text content
      const text = el.textContent?.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text, size: 22, color: "374151" })],
            spacing: { before: 80, after: 80 },
            indent: { left: convertMillimetersToTwip(5) },
          })
        );
      }
    }
  };

  // Process children
  if (temp.children.length > 0) {
    Array.from(temp.children).forEach(processElement);
  } else {
    // No block elements - treat as single text
    Array.from(temp.childNodes).forEach(processElement);
  }

  // If still empty, try plain text
  if (paragraphs.length === 0) {
    const plainText = htmlToPlainText(html);
    if (plainText) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: plainText, size: 22, color: "374151" })],
          spacing: { before: 80, after: 80 },
          indent: { left: convertMillimetersToTwip(5) },
        })
      );
    }
  }

  return paragraphs;
};

export const generateDOCX = async ({
  sections,
  getAnswer,
  getStatus,
  pageSettings,
  documentTitle = "Enterprise Cloud Solutions RFP",
}: GenerateDOCXOptions): Promise<Blob> => {
  const dimensions = getEffectiveDimensions(
    pageSettings.pageSize,
    pageSettings.orientation
  );

  const { margins } = pageSettings;

  // Build document content
  const children: Paragraph[] = [];

  // Document Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: documentTitle,
          bold: true,
          size: 36,
          color: "1F2937",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Response Document",
          size: 22,
          color: "6B7280",
        }),
      ],
      spacing: { after: 400 },
      border: {
        bottom: {
          color: "E5E7EB",
          style: BorderStyle.SINGLE,
          size: 8,
          space: 8,
        },
      },
    })
  );

  // Sections
  for (const section of sections) {
    // Section Header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Section ${section.id}: ${section.title}`,
            bold: true,
            size: 28,
            color: "1F2937",
          }),
        ],
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: "E5E7EB",
            style: BorderStyle.SINGLE,
            size: 4,
            space: 4,
          },
        },
      })
    );

    if (section.questions.length === 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "No questions in this section",
              italics: true,
              size: 22,
              color: "9CA3AF",
            }),
          ],
          spacing: { before: 100, after: 200 },
        })
      );
      continue;
    }

    // Questions
    for (const question of section.questions) {
      const answer = getAnswer(question.id);
      const hasAnswer = answer && answer !== "<p></p>" && answer.trim() !== "";

      // Question title (NO checkmark)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: question.title,
              bold: true,
              size: 24,
              color: "1F2937",
            }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      // Full question
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: question.fullQuestion,
              size: 22,
              color: "4B5563",
            }),
          ],
          spacing: { before: 60, after: 200 },
          indent: { left: convertMillimetersToTwip(5) },
        })
      );

      // Answer (NO gray background)
      if (hasAnswer) {
        // Try to parse HTML content
        const answerParagraphs = parseHTMLToParagraphs(answer);

        if (answerParagraphs.length > 0) {
          answerParagraphs.forEach((para) => {
            children.push(para);
          });
        } else {
          // Fallback: use plain text
          const plainText = htmlToPlainText(answer);
          if (plainText) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: plainText,
                    size: 22,
                    color: "374151",
                  }),
                ],
                spacing: { before: 80, after: 80 },
                indent: { left: convertMillimetersToTwip(5) },
              })
            );
          }
        }
      } else {
        // No answer placeholder
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "No answer provided yet",
                italics: true,
                size: 22,
                color: "9CA3AF",
              }),
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: convertMillimetersToTwip(5) },
          })
        );
      }

      // Add spacing after each question
      children.push(
        new Paragraph({
          children: [],
          spacing: { after: 100 },
        })
      );
    }
  }

  // Create document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: mmToDxa(dimensions.width),
              height: mmToDxa(dimensions.height),
              orientation:
                pageSettings.orientation === "landscape"
                  ? PageOrientation.LANDSCAPE
                  : PageOrientation.PORTRAIT,
            },
            margin: {
              top: mmToDxa(margins.top),
              bottom: mmToDxa(margins.bottom),
              left: mmToDxa(margins.left),
              right: mmToDxa(margins.right),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: documentTitle,
                    size: 18,
                    color: "9CA3AF",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 18,
                    color: "9CA3AF",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: "9CA3AF",
                  }),
                  new TextRun({
                    text: " of ",
                    size: 18,
                    color: "9CA3AF",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "9CA3AF",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  // Generate blob
  const buffer = await Packer.toBlob(doc);
  return buffer;
};
