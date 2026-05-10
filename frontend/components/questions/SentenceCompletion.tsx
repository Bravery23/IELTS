"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";

interface Props {
  questions: Question[];
}

export default function SentenceCompletion({ questions }: Props) {
  const { userAnswers, setAnswer, isSubmitted } = useExamStore();

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const userVal = (userAnswers[q.number] as string) || "";
        const correct = typeof q.correctAnswer === "string" ? q.correctAnswer : "";
        const isCorrect = userVal.toLowerCase().trim() === correct.toLowerCase().trim();
        const parts = q.text.split("{blank}");

        return (
          <div key={q.id} className="animate-fade-in-up" id={`question-${q.number}`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0 mt-0.5">
                {q.number}
              </span>
              <p className="font-medium text-text-primary leading-relaxed flex-1 flex flex-wrap items-center gap-1">
                {parts.map((part, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1">
                    <span>{part}</span>
                    {idx < parts.length - 1 && (
                      <input
                        type="text"
                        value={userVal}
                        disabled={isSubmitted}
                        onChange={(e) => setAnswer(q.number, e.target.value)}
                        placeholder="________"
                        className={`ielts-input inline-block w-40 text-center mx-1 ${
                          isSubmitted ? (isCorrect ? "correct" : "incorrect") : ""
                        }`}
                      />
                    )}
                  </span>
                ))}
              </p>
            </div>
            {isSubmitted && !isCorrect && (
              <p className="ml-10 mt-1.5 text-sm text-success font-medium">
                Correct: {correct}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
