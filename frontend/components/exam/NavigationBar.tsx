"use client";

import { useExamStore } from "@/store/examStore";
import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const { testData, userAnswers, isSubmitted, submitTest, score, resetExam, activeSection, setActiveSection } = useExamStore();
  const router = useRouter();

  if (!testData) return null;

  // Get questions for the active section
  const currentSection = testData.sections[activeSection];
  const sectionQuestions = currentSection
    ? currentSection.questionGroups.flatMap((g) => g.questions.map((q) => q.number))
    : [];

  // All questions across all sections
  const allQuestions = testData.sections.flatMap((s) =>
    s.questionGroups.flatMap((g) => g.questions.map((q) => q.number))
  );

  const handleScrollTo = (qNum: number) => {
    // Find which section this question belongs to
    for (let i = 0; i < testData.sections.length; i++) {
      const sec = testData.sections[i];
      const found = sec.questionGroups.some((g) =>
        g.questions.some((q) => q.number === qNum)
      );
      if (found && i !== activeSection) {
        setActiveSection(i);
        // Delay scroll to let the section render
        setTimeout(() => {
          const el = document.getElementById(`question-${qNum}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }
    }
    const el = document.getElementById(`question-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const getQuestionStatus = (qNum: number) => {
    const isAnswered = userAnswers[qNum] !== undefined && userAnswers[qNum] !== "";
    if (!isSubmitted) {
      return isAnswered ? "answered" : "unanswered";
    }
    // After submission, check correctness
    const question = testData.sections
      .flatMap((s) => s.questionGroups)
      .flatMap((g) => g.questions)
      .find((q) => q.number === qNum);
    if (!question) return "unanswered";

    const userAns = userAnswers[qNum];
    const correctAns = question.correctAnswer;
    let isCorrect = false;
    if (Array.isArray(correctAns)) {
      if (Array.isArray(userAns)) {
        isCorrect =
          userAns.map((a) => a.toLowerCase().trim()).sort().join(",") ===
          correctAns.map((a) => a.toLowerCase().trim()).sort().join(",");
      }
    } else {
      const uStr = Array.isArray(userAns) ? userAns[0] : userAns;
      isCorrect = (uStr || "").toLowerCase().trim() === (correctAns || "").toLowerCase().trim();
    }
    return isCorrect ? "correct" : "incorrect";
  };

  const statusClasses: Record<string, string> = {
    unanswered: "bg-slate-100 text-text-secondary hover:bg-slate-200",
    answered: "bg-primary/15 text-primary border-primary/30",
    correct: "bg-success/15 text-success border-success/30",
    incorrect: "bg-error/15 text-error border-error/30",
  };

  return (
    <div className="bg-white border-t border-border shadow-lg z-50 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Question Pills — show current section's questions */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-hide">
          {sectionQuestions.map((qNum) => {
            const status = getQuestionStatus(qNum);
            return (
              <button
                key={qNum}
                onClick={() => handleScrollTo(qNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all duration-150 flex-shrink-0 cursor-pointer ${statusClasses[status]}`}
              >
                {qNum}
              </button>
            );
          })}
        </div>

        {/* Answered count (all sections) */}
        <div className="text-sm text-text-secondary flex-shrink-0">
          <span className="font-bold text-text-primary">
            {allQuestions.filter((qNum) => {
              const v = userAnswers[qNum];
              return v !== undefined && v !== "";
            }).length}
          </span>
          /{allQuestions.length}
        </div>

        {/* Submit Button or Score Summary */}
        {!isSubmitted ? (
          <button
            onClick={submitTest}
            id="submit-test-btn"
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-95 flex-shrink-0"
          >
            Submit Test
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            {score && (
              <span className="text-sm font-bold text-success bg-success-light px-3 py-1.5 rounded-lg">
                {score.correct}/{score.total} correct
              </span>
            )}
            <button
              onClick={() => { resetExam(); router.push("/"); }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-all active:scale-95 flex-shrink-0"
            >
              New Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
