"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";

interface Props {
  questions: Question[];
}

export default function SummaryCompletion({ questions }: Props) {
  const { userAnswers, setAnswer, isSubmitted } = useExamStore();

  // Check if word bank is available (options on first question)
  const hasWordBank = questions[0]?.options && questions[0].options.length > 0;
  const wordBank = questions[0]?.options || [];

  return (
    <div className="space-y-6">
      {/* Word bank if available */}
      {hasWordBank && (
        <div className="p-4 bg-surface rounded-xl border border-border">
          <p className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">Word Bank</p>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white border border-border-strong rounded-full text-sm text-text-primary font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

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
              <div className="flex-1">
                <p className="font-medium text-text-primary leading-relaxed flex flex-wrap items-center gap-1">
                  {parts.map((part, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1">
                      <span>{part}</span>
                      {idx < parts.length - 1 && (
                        hasWordBank ? (
                          <select
                            value={userVal}
                            disabled={isSubmitted}
                            onChange={(e) => setAnswer(q.number, e.target.value)}
                            className={`ielts-select inline-block mx-1 ${
                              isSubmitted
                                ? isCorrect
                                  ? "!border-success !bg-success-light/30"
                                  : "!border-error !bg-error-light/30"
                                : ""
                            }`}
                          >
                            <option value="">— choose —</option>
                            {wordBank.map((word, wIdx) => (
                              <option key={wIdx} value={word}>
                                {word}
                              </option>
                            ))}
                          </select>
                        ) : (
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
                        )
                      )}
                    </span>
                  ))}
                </p>
                {isSubmitted && !isCorrect && (
                  <p className="mt-1.5 text-sm text-success font-medium">
                    Correct: {correct}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
