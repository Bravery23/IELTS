"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";

interface Props {
  questions: Question[];
}

export default function MatchingFeatures({ questions }: Props) {
  const { userAnswers, setAnswer, isSubmitted } = useExamStore();

  // Options are entity names (researchers, people, etc.)
  const entityOptions = questions[0]?.options || [];

  return (
    <div className="space-y-5">
      {questions.map((q) => {
        const userVal = (userAnswers[q.number] as string) || "";
        const correct = typeof q.correctAnswer === "string" ? q.correctAnswer : "";
        const isCorrect = userVal.toLowerCase().trim() === correct.toLowerCase().trim();

        return (
          <div key={q.id} className="animate-fade-in-up flex items-start gap-3" id={`question-${q.number}`}>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0 mt-1">
              {q.number}
            </span>
            <div className="flex-1">
              <p className="font-medium text-text-primary mb-2">{q.text}</p>
              <select
                value={userVal}
                disabled={isSubmitted}
                onChange={(e) => setAnswer(q.number, e.target.value)}
                className={`ielts-select ${
                  isSubmitted
                    ? isCorrect
                      ? "!border-success !bg-success-light/30"
                      : "!border-error !bg-error-light/30"
                    : ""
                }`}
              >
                <option value="">— Select —</option>
                {entityOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {isSubmitted && !isCorrect && (
                <p className="mt-1.5 text-sm text-success font-medium">
                  Correct: {correct}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
