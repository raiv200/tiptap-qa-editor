"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { RFP_SECTIONS, RFPSection } from "@/data/rfpQuestions";

type QuestionStatus = "empty" | "editing" | "saved";

type QuestionsContextType = {
  sections: RFPSection[];
  answers: Record<string, string>;
  questionStatus: Record<string, QuestionStatus>;
  saveAnswer: (questionId: string, answer: string) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  getAnswer: (questionId: string) => string;
  getStatus: (questionId: string) => QuestionStatus;
};

const QuestionsContext = createContext<QuestionsContextType | null>(null);

export const QuestionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});

  const saveAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setQuestionStatus((prev) => ({ ...prev, [questionId]: "saved" }));
  }, []);

  const updateAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    
    // Only change to "editing" if not already saved or if content changed
    setQuestionStatus((prev) => {
      const currentStatus = prev[questionId];
      if (!answer.trim() || answer === "<p></p>") {
        return { ...prev, [questionId]: "empty" };
      }
      if (currentStatus === "saved") {
        return prev; // Keep saved status
      }
      return { ...prev, [questionId]: "editing" };
    });
  }, []);

  const getAnswer = useCallback(
    (questionId: string) => answers[questionId] || "",
    [answers]
  );

  const getStatus = useCallback(
    (questionId: string): QuestionStatus => questionStatus[questionId] || "empty",
    [questionStatus]
  );

  return (
    <QuestionsContext.Provider
      value={{
        sections: RFP_SECTIONS,
        answers,
        questionStatus,
        saveAnswer,
        updateAnswer,
        getAnswer,
        getStatus,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error("useQuestions must be used within QuestionsProvider");
  }
  return context;
};