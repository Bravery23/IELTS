"use client";

import { useState } from "react";
import { useExamStore } from "@/store/examStore";
import { useRouter } from "next/navigation";

export default function ScoreModal() {
  const { score, testData, resetExam, isSubmitted } = useExamStore();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (!score || !testData || !isSubmitted || dismissed) return null;

  const handleNewTest = () => {
    resetExam();
    router.push("/");
  };

  const handleReviewAnswers = () => {
    setDismissed(true);
  };

  // Band score approximation (simplified)
  const getBandScore = (percentage: number): string => {
    if (percentage >= 90) return "9.0";
    if (percentage >= 85) return "8.5";
    if (percentage >= 78) return "8.0";
    if (percentage >= 70) return "7.5";
    if (percentage >= 63) return "7.0";
    if (percentage >= 55) return "6.5";
    if (percentage >= 48) return "6.0";
    if (percentage >= 40) return "5.5";
    if (percentage >= 33) return "5.0";
    if (percentage >= 25) return "4.5";
    if (percentage >= 18) return "4.0";
    return "3.5";
  };

  const band = getBandScore(score.percentage);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-1">Test Complete!</h2>
          <p className="text-blue-100 text-sm">{testData.title}</p>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center -mt-8">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-primary">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{band}</div>
              <div className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">Band</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-surface rounded-xl">
              <div className="text-2xl font-bold text-success">{score.correct}</div>
              <div className="text-xs text-text-muted mt-0.5">Correct</div>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <div className="text-2xl font-bold text-error">{score.total - score.correct}</div>
              <div className="text-xs text-text-muted mt-0.5">Incorrect</div>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <div className="text-2xl font-bold text-primary">{score.percentage}%</div>
              <div className="text-xs text-text-muted mt-0.5">Accuracy</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-text-muted mb-1.5">
              <span>Score</span>
              <span>{score.correct}/{score.total}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-1000 ease-out"
                style={{ width: `${score.percentage}%` }}
              />
            </div>
          </div>

          {/* Per-section breakdown */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {testData.sections.map((section) => {
              const sectionQuestions = section.questionGroups.flatMap((g) => g.questions);
              const sectionDetails = score.details.filter((d) =>
                sectionQuestions.some((q) => q.number === d.questionNumber)
              );
              const sectionCorrect = sectionDetails.filter((d) => d.isCorrect).length;

              return (
                <div
                  key={section.sectionId}
                  className="flex items-center justify-between p-2.5 bg-surface rounded-lg text-sm"
                >
                  <span className="text-text-secondary truncate flex-1 mr-2">
                    {section.title}
                  </span>
                  <span className="font-bold text-text-primary flex-shrink-0">
                    {sectionCorrect}/{sectionDetails.length}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReviewAnswers}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-text-primary font-semibold rounded-xl transition-all active:scale-95"
              id="review-answers-btn"
            >
              Review Answers
            </button>
            <button
              onClick={handleNewTest}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95"
              id="new-test-btn"
            >
              New Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
