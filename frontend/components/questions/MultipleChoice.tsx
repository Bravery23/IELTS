"use client";

import { useExamStore } from "@/store/examStore";
import type { Question } from "@/types/exam";

interface Props {
  questions: Question[];
}

export default function MultipleChoice({ questions }: Props) {
  const { userAnswers, setAnswer, isSubmitted } = useExamStore();

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const userVal = userAnswers[q.number] as string | undefined;
        const isMultiSelect = Array.isArray(q.correctAnswer);

        return (
          <div key={q.id} className="animate-fade-in-up" id={`question-${q.number}`}>
            <p className="font-medium text-text-primary mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold mr-2">
                {q.number}
              </span>
              {q.text}
            </p>
            <div className="ielts-radio-group ml-9">
              {(q.options || []).map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = isMultiSelect
                  ? (userAnswers[q.number] as string[] || []).includes(letter)
                  : userVal === letter;
                const correctVal = q.correctAnswer;
                const isCorrectOption = Array.isArray(correctVal)
                  ? correctVal.includes(letter)
                  : correctVal === letter;

                let statusClass = "";
                if (isSubmitted) {
                  if (isCorrectOption) statusClass = "correct";
                  else if (isSelected && !isCorrectOption) statusClass = "incorrect";
                }

                return (
                  <label
                    key={idx}
                    className={`ielts-radio-label ${isSelected && !isSubmitted ? "selected" : ""} ${statusClass}`}
                  >
                    <input
                      type={isMultiSelect ? "checkbox" : "radio"}
                      name={`q-${q.number}`}
                      checked={isSelected}
                      disabled={isSubmitted}
                      onChange={() => {
                        if (isMultiSelect) {
                          const current = (userAnswers[q.number] as string[]) || [];
                          const updated = current.includes(letter)
                            ? current.filter((v) => v !== letter)
                            : [...current, letter];
                          setAnswer(q.number, updated);
                        } else {
                          setAnswer(q.number, letter);
                        }
                      }}
                      className="accent-primary w-4 h-4 flex-shrink-0"
                    />
                    <span>
                      <span className="font-semibold mr-1.5">{letter}.</span>
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
            {isSubmitted && (
              <p className="ml-9 mt-2 text-sm text-success font-medium">
                Correct answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
