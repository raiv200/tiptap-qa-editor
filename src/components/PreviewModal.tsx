'use client';

import { X, FileText, FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

// Sections for organizing preview
const SECTIONS = [
  { id: 1, title: 'Company Information' },
  { id: 2, title: 'Technical Requirements' },
  { id: 3, title: 'Security & Compliance' },
  { id: 4, title: 'Pricing & Commercial' },
];

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  answers: string[];
  questionTitles?: string[];
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
  questionTitles = [],
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
      pdf.text('RFP Response Document', margin, yPosition);
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

        // Question title (e.g., "Q 2.3 - API Integration")
        if (questionTitles[index]) {
          pdf.setFontSize(11);
          pdf.setTextColor(79, 70, 229);
          pdf.text(questionTitles[index], margin, yPosition);
          yPosition += 8;
        }

        // Question text
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

      pdf.save('rfp-response.pdf');
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
          text: 'RFP Response Document',
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
        // Question title
        if (questionTitles[index]) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: questionTitles[index],
                  bold: true,
                  size: 24,
                  color: '4f46e5',
                }),
              ],
              spacing: { before: 300, after: 100 },
            })
          );
        }

        // Question text
        children.push(
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
      saveAs(blob, 'rfp-response.docx');
    } catch (error) {
      console.error('DOCX export error:', error);
    }
    setExporting(null);
  };

  const exportToCSV = () => {
    setExporting('csv');
    try {
      const csvContent = [
        ['Question ID', 'Question', 'Answer'],
        ...questions.map((q, i) => [
          questionTitles[i] || `Question ${i + 1}`,
          `"${q.replace(/"/g, '""')}"`,
          `"${stripHtml(answers[i]).replace(/"/g, '""')}"`,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, 'rfp-response.csv');
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
      <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Preview Responses</h2>
            <p className="text-gray-500 text-sm mt-1">
              Review your answers before exporting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Group questions by section */}
            {SECTIONS.map((section, sectionIndex) => {
              const sectionQuestions = questions
                .map((q, idx) => ({ question: q, answer: answers[idx], title: questionTitles?.[idx], index: idx }))
                .filter((_, idx) => {
                  const questionTitle = questionTitles?.[idx] || '';
                  return questionTitle.startsWith(`Q ${section.id}.`);
                });

              if (sectionQuestions.length === 0) return null;

              return (
                <div key={sectionIndex} className="space-y-4">
                  {/* Section Header */}
                  <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                    Section {section.id}: {section.title}
                  </h3>

                  {/* Questions in this section */}
                  {sectionQuestions.map(({ question, answer, title, index }) => {
                    const hasAnswer = answer && answer !== '<p></p>' && answer.trim() !== '';
                    
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg border border-gray-200 p-6"
                      >
                        {/* Question Title */}
                        <div className="mb-3">
                          <h4 className="text-base font-semibold text-gray-900 mb-2">
                            {title || `Question ${index + 1}`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {question}
                          </p>
                        </div>

                        {/* Answer */}
                        <div className="mt-4">
                          {hasAnswer ? (
                            <div
                              className="prose prose-sm max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{
                                __html: answer,
                              }}
                            />
                          ) : (
                            <p className="text-sm text-gray-400 italic">No answer provided yet</p>
                          )}
                        </div>

                        {/* Metadata footer */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>John Doe</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Last edited Oct 24</span>
                          </div>
                          {hasAnswer && (
                            <div className="flex items-center gap-1 ml-auto">
                              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-green-600 font-medium">AI Rating: 9/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Export Buttons */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={exportToPDF}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'pdf' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileDown size={18} />
              )}
              Export as PDF
            </button>

            <button
              onClick={exportToDocx}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'docx' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileText size={18} />
              )}
              Export as DOCX
            </button>

            <button
              onClick={exportToCSV}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'csv' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={18} />
              )}
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}