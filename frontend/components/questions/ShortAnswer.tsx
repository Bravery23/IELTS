"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";

interface Props {
  questions: Question[];
}

export default function ShortAnswer({ questions }: Props) {
  const { userAnswers, setAnswer, isSubmitted } = useExamStore();

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const userVal = (userAnswers[q.number] as string) || "";
        const correct = typeof q.correctAnswer === "string" ? q.correctAnswer : "";
        const isCorrect = userVal.toLowerCase().trim() === correct.toLowerCase().trim();

        return (
          <div key={q.id} className="animate-fade-in-up" id={`question-${q.number}`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0 mt-0.5">
                {q.number}
              </span>
              <div className="flex-1">
                <p className="font-medium text-text-primary mb-2">{q.text}</p>
                <input
                  type="text"
                  value={userVal}
                  disabled={isSubmitted}
                  onChange={(e) => setAnswer(q.number, e.target.value)}
                  placeholder="Type your answer..."
                  className={`ielts-input w-full max-w-sm ${
                    isSubmitted ? (isCorrect ? "correct" : "incorrect") : ""
                  }`}
                />
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
