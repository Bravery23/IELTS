/**
 * Zustand store for managing exam state.
 * Handles test data, user answers, submission, and scoring.
 * Updated to work with sections-based data model.
 */
import { create } from "zustand";
import type { TestData, ScoreResult } from "@/types/exam";

interface ExamState {
  // Data
  testData: TestData | null;
  userAnswers: Record<number, string | string[]>;
  isSubmitted: boolean;
  score: ScoreResult | null;
  isLoading: boolean;
  error: string | null;
  activeSection: number; // index of currently visible section

  // Actions
  setTestData: (data: TestData) => void;
  setAnswer: (questionNumber: number, answer: string | string[]) => void;
  setActiveSection: (index: number) => void;
  submitTest: () => void;
  resetExam: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  testData: null,
  userAnswers: {},
  isSubmitted: false,
  score: null,
  isLoading: false,
  error: null,
  activeSection: 0,

  setTestData: (data: TestData) => {
    set({ testData: data, userAnswers: {}, isSubmitted: false, score: null, error: null, activeSection: 0 });
  },

  setAnswer: (questionNumber: number, answer: string | string[]) => {
    set((state) => ({
      userAnswers: { ...state.userAnswers, [questionNumber]: answer },
    }));
  },

  setActiveSection: (index: number) => {
    set({ activeSection: index });
  },

  submitTest: () => {
    const { testData, userAnswers } = get();
    if (!testData) return;

    const details: ScoreResult["details"] = [];
    let correct = 0;
    let total = 0;

    for (const section of testData.sections) {
      for (const group of section.questionGroups) {
        for (const question of group.questions) {
          total++;
          const userAnswer = userAnswers[question.number];
          const correctAnswer = question.correctAnswer;

          let isCorrect = false;

          if (Array.isArray(correctAnswer)) {
            if (Array.isArray(userAnswer)) {
              const normalizedUser = userAnswer.map((a) => a.trim().toLowerCase()).sort();
              const normalizedCorrect = correctAnswer.map((a) => a.trim().toLowerCase()).sort();
              isCorrect =
                normalizedUser.length === normalizedCorrect.length &&
                normalizedUser.every((val, idx) => val === normalizedCorrect[idx]);
            }
          } else {
            const userStr = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
            isCorrect =
              (userStr || "").trim().toLowerCase() ===
              (correctAnswer || "").trim().toLowerCase();
          }

          if (isCorrect) correct++;

          details.push({
            questionNumber: question.number,
            userAnswer: userAnswer || "",
            correctAnswer,
            isCorrect,
          });
        }
      }
    }

    set({
      isSubmitted: true,
      score: {
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
        details,
      },
    });
  },

  resetExam: () => {
    set({
      testData: null,
      userAnswers: {},
      isSubmitted: false,
      score: null,
      isLoading: false,
      error: null,
      activeSection: 0,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
}));
