"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";

interface Props {
  questions: Question[];
}

const OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"];

export default function TrueFalseNotGiven({ questions }: Props) {
  const { userAnswers, setAnswer, isSubmitted } = useExamStore();

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const userVal = (userAnswers[q.number] as string) || "";
        const correct = (typeof q.correctAnswer === "string" ? q.correctAnswer : "").toUpperCase();

        return (
          <div key={q.id} className="animate-fade-in-up" id={`question-${q.number}`}>
            <p className="font-medium text-text-primary mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold mr-2">
                {q.number}
              </span>
              {q.text}
            </p>
            <div className="ielts-radio-group ml-9">
              {OPTIONS.map((opt) => {
                const isSelected = userVal.toUpperCase() === opt;
                const isCorrectOption = correct === opt;
                let statusClass = "";
                if (isSubmitted) {
                  if (isCorrectOption) statusClass = "correct";
                  else if (isSelected && !isCorrectOption) statusClass = "incorrect";
                }

                return (
                  <label
                    key={opt}
                    className={`ielts-radio-label ${isSelected && !isSubmitted ? "selected" : ""} ${statusClass}`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.number}`}
                      checked={isSelected}
                      disabled={isSubmitted}
                      onChange={() => setAnswer(q.number, opt)}
                      className="accent-primary w-4 h-4 flex-shrink-0"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
            {isSubmitted && userVal.toUpperCase() !== correct && (
              <p className="ml-9 mt-2 text-sm text-success font-medium">
                Correct answer: {correct}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
