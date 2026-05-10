/**
 * TypeScript interfaces for the Universal Data Contract.
 * Supports multiple sections per test (e.g. 3 Reading passages).
 */

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE_NOT_GIVEN = "TRUE_FALSE_NOT_GIVEN",
  YES_NO_NOT_GIVEN = "YES_NO_NOT_GIVEN",
  MATCHING_HEADINGS = "MATCHING_HEADINGS",
  MATCHING_INFORMATION = "MATCHING_INFORMATION",
  MATCHING_FEATURES = "MATCHING_FEATURES",
  MATCHING_SENTENCE_ENDINGS = "MATCHING_SENTENCE_ENDINGS",
  SENTENCE_COMPLETION = "SENTENCE_COMPLETION",
  SUMMARY_COMPLETION = "SUMMARY_COMPLETION",
  SHORT_ANSWER_QUESTIONS = "SHORT_ANSWER_QUESTIONS",
}

export interface Question {
  id: string;
  number: number;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
}

export interface QuestionGroup {
  groupId: string;
  instruction: string;
  type: QuestionType;
  questions: Question[];
}

export interface TestContent {
  passage: string;
}

export interface Section {
  sectionId: string;
  title: string;
  content: TestContent;
  questionGroups: QuestionGroup[];
}

export interface TestData {
  testId: string;
  skill: "READING" | "LISTENING";
  title: string;
  audioUrl: string | null;
  sections: Section[];
}

export interface UploadResponse {
  success: boolean;
  data?: TestData;
  error?: string;
}

export interface ScoreResult {
  correct: number;
  total: number;
  percentage: number;
  details: {
    questionNumber: number;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
  }[];
}
