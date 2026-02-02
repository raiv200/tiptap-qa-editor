"use client";

import TiptapEditor from "./TiptapEditor";
import { Save } from "lucide-react";

interface QuestionCardProps {
  questionId: string;
  question: string;
  title: string;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onSave: () => void;
  status: "empty" | "editing" | "saved";
}

export default function QuestionCard({
  questionId,
  question,
  title,
  answer,
  onAnswerChange,
  onSave,
  status,
}: QuestionCardProps) {
  const hasContent = answer && answer !== "<p></p>" && answer.trim() !== "";
  const canSave = hasContent && status !== "saved";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Question Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {title}
              </span>
            </div>
            <h2 className="text-base font-semibold text-gray-900 leading-relaxed">
              {question}
            </h2>
          </div>
        </div>

        {/* Instruction text */}
        <p className="text-xs text-gray-500 leading-relaxed">
          Please provide details about your API architecture, supported protocols (REST, GraphQL,
          SOAP), authentication methods, rate limiting, and documentation standards. Include
          information about webhook support and real-time data synchronization.
        </p>
      </div>

      {/* Editor Area */}
      <div className="px-6 py-6">
        <TiptapEditor
          content={answer}
          onChange={onAnswerChange}
          placeholder="Start typing your answer…"
        />
      </div>

      {/* Footer with character count and save button */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {hasContent ? (
            <span>{answer.replace(/<[^>]*>/g, "").length} / 3000 characters</span>
          ) : (
            <span>0 / 3000 characters</span>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
            status === "saved"
              ? "bg-gray-100 text-gray-500 cursor-default"
              : canSave
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Save size={16} />
          {status === "saved" ? "Saved" : "Save Answer"}
        </button>
      </div>
    </div>
  );
}