"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import {
  Eye,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Edit3,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useQuestions } from "@/context/QuestionsContext";

export default function Home() {
  const router = useRouter();
  const { sections, getAnswer, getStatus, updateAnswer, saveAnswer } =
    useQuestions();

  const [activeQuestionId, setActiveQuestionId] = useState("q1-1");
  const [expandedSections, setExpandedSections] = useState<number[]>([
    1, 2, 3, 4,
  ]);

  const rfpId = "rfp-2024-001";
  const rfpTitle = "Enterprise Cloud Solutions RFP";
  const company = "TechCorp Inc.";
  const dueDate = "Due Oct 28";

  const allQuestions = useMemo(
    () => sections.flatMap((s) => s.questions),
    [sections],
  );

  const activeQuestion = allQuestions.find((q) => q.id === activeQuestionId);

  const toggleSection = (id: number) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getStatusIcon = (status: "empty" | "editing" | "saved") => {
    if (status === "saved")
      return (
        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
      );
    if (status === "editing")
      return <Edit3 size={18} className="text-blue-500 flex-shrink-0" />;
    return <Circle size={18} className="text-gray-300 flex-shrink-0" />;
  };

  const getSectionProgress = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return { saved: 0, total: 0 };

    const saved = section.questions.filter(
      (q) => getStatus(q.id) === "saved",
    ).length;

    return { saved, total: section.questions.length };
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      {/* Top Header */}
      <header className="h-[70px] bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {rfpTitle}
              </h1>
              <p className="text-xs text-gray-500">
                {company} • {dueDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Users size={14} />
              <span>3 users online</span>
            </div>

            <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Save Draft
            </button>

            <button
              onClick={() => router.push(`/preview/${rfpId}`)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Eye size={14} />
              Request Review
            </button>
          </div>
        </div>
      </header>
      <div className="flex ">
        <aside className="h-[calc(100vh-70px)] w-[320px] bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Document Outline
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto py-2">
            {sections.map((section) => {
              const isExpanded = expandedSections.includes(section.id);
              const progress = getSectionProgress(section.id);

              return (
                <div key={section.id} className="mb-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {section.id}. {section.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {progress.saved}/{progress.total}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-1">
                      {section.questions.map((q) => {
                        const status = getStatus(q.id);
                        const isActive = activeQuestionId === q.id;

                        return (
                          <button
                            key={q.id}
                            onClick={() => setActiveQuestionId(q.id)}
                            className={`w-full flex items-center gap-2 pl-9 pr-4 py-2 text-left transition-colors ${
                              isActive
                                ? "bg-blue-50 border-l-2 border-blue-600"
                                : "hover:bg-gray-50 border-l-2 border-transparent"
                            }`}
                          >
                            {getStatusIcon(status)}
                            <span
                              className={`text-sm flex-1 min-w-0 truncate ${
                                isActive
                                  ? "text-blue-700 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {q.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        

 
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-6">
            {activeQuestion && (
              <QuestionCard
                questionId={activeQuestion.id}
                question={activeQuestion.fullQuestion}
                title={activeQuestion.title}
                answer={getAnswer(activeQuestion.id)}
                onAnswerChange={(ans) => updateAnswer(activeQuestion.id, ans)}
                onSave={() => saveAnswer(activeQuestion.id, getAnswer(activeQuestion.id))}
                status={getStatus(activeQuestion.id)}
              />
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
