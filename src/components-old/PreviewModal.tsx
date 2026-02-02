'use client';

import { X, FileText, FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  answers: string[];
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function PreviewModal({
  isOpen,
  onClose,
  questions,
  answers,
}: PreviewModalProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(79, 70, 229); // Indigo
      pdf.text('Questions & Answers', margin, yPosition);
      yPosition += 15;

      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // Slate
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 20;

      questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        // Question number and text
        pdf.setFontSize(12);
        pdf.setTextColor(79, 70, 229);
        pdf.text(`Question ${index + 1}`, margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);
        const questionLines = pdf.splitTextToSize(question, maxWidth);
        pdf.text(questionLines, margin, yPosition);
        yPosition += questionLines.length * 6 + 8;

        // Answer
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Answer:', margin, yPosition);
        yPosition += 6;

        pdf.setFontSize(11);
        pdf.setTextColor(51, 65, 85);
        const answerText = stripHtml(answers[index]) || 'No answer provided';
        const answerLines = pdf.splitTextToSize(answerText, maxWidth);
        
        // Check if answer fits on page
        if (yPosition + answerLines.length * 6 > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(answerLines, margin, yPosition);
        yPosition += answerLines.length * 6 + 20;
      });

      pdf.save('qa-responses.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
    }
    setExporting(null);
  };

  const exportToDocx = async () => {
    setExporting('docx');
    try {
      const children: (Paragraph)[] = [
        new Paragraph({
          text: 'Questions & Answers',
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on ${new Date().toLocaleDateString()}`,
              size: 20,
              color: '64748b',
            }),
          ],
          spacing: { after: 400 },
        }),
      ];

      questions.forEach((question, index) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Question ${index + 1}`,
                bold: true,
                size: 24,
                color: '4f46e5',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: question,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Answer:',
                bold: true,
                size: 20,
                color: '64748b',
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: stripHtml(answers[index]) || 'No answer provided',
                size: 22,
              }),
            ],
            spacing: { after: 400 },
          })
        );
      });

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'qa-responses.docx');
    } catch (error) {
      console.error('DOCX export error:', error);
    }
    setExporting(null);
  };

  const exportToCSV = () => {
    setExporting('csv');
    try {
      const csvContent = [
        ['Question Number', 'Question', 'Answer'],
        ...questions.map((q, i) => [
          String(i + 1),
          `"${q.replace(/"/g, '""')}"`,
          `"${stripHtml(answers[i]).replace(/"/g, '""')}"`,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, 'qa-responses.csv');
    } catch (error) {
      console.error('CSV export error:', error);
    }
    setExporting(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Preview Responses</h2>
            <p className="text-slate-500 text-sm mt-1">
              Review your answers before exporting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-white font-medium">{question}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div
                    className="prose prose-slate max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: answers[index] || '<em class="text-slate-400">No answer provided</em>',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Export Buttons */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={exportToPDF}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'pdf' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileDown size={20} />
              )}
              Export as PDF
            </button>

            <button
              onClick={exportToDocx}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'docx' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileText size={20} />
              )}
              Export as DOCX
            </button>

            <button
              onClick={exportToCSV}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'csv' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={20} />
              )}
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
