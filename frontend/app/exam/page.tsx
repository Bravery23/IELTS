"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import ReadingLayout from "@/components/exam/ReadingLayout";
import ListeningLayout from "@/components/exam/ListeningLayout";
import NavigationBar from "@/components/exam/NavigationBar";
import Timer from "@/components/exam/Timer";
import ScoreModal from "@/components/exam/ScoreModal";

export default function ExamPage() {
  const router = useRouter();
  const { testData, isSubmitted, submitTest } = useExamStore();

  // Redirect to upload if no test data
  useEffect(() => {
    if (!testData) {
      router.replace("/");
    }
  }, [testData, router]);

  if (!testData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isReading = testData.skill === "READING";
  const timerMinutes = isReading ? 60 : 30;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary leading-tight">
                IELTS {testData.skill}
              </h1>
              <p className="text-xs text-text-muted truncate max-w-[200px] lg:max-w-none">
                {testData.title}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              isReading
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {testData.skill}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {!isSubmitted && (
            <Timer initialMinutes={timerMinutes} onTimeUp={submitTest} />
          )}
          {isSubmitted && (
            <span className="px-3 py-1.5 bg-success-light text-success text-sm font-bold rounded-lg">
              ✓ Submitted
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {isReading ? (
          <ReadingLayout testData={testData} />
        ) : (
          <ListeningLayout testData={testData} />
        )}
      </main>

      {/* Bottom Navigation */}
      <NavigationBar />

      {/* Score Modal (shown after submission) */}
      {isSubmitted && <ScoreModal />}
    </div>
  );
}
