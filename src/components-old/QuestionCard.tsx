'use client';

import TiptapEditor from './TiptapEditor';
import { MessageCircleQuestion } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export default function QuestionCard({
  questionNumber,
  question,
  answer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">{questionNumber}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircleQuestion size={16} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-medium uppercase tracking-wider">
                Question
              </span>
            </div>
            <h3 className="text-white text-lg font-semibold leading-relaxed">
              {question}
            </h3>
          </div>
        </div>
      </div>

      {/* Answer Editor */}
      <div className="p-5 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
          <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Your Answer
          </span>
        </div>
        <TiptapEditor
          content={answer}
          onChange={onAnswerChange}
          placeholder="Type your thoughtful answer here..."
        />
      </div>
    </div>
  );
}
