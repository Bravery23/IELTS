"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import type { UploadResponse } from "@/types/exam";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function UploadPage() {
  const router = useRouter();
  const { setTestData, setLoading, setError, isLoading, error } = useExamStore();

  const [testFile, setTestFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [dragOverTest, setDragOverTest] = useState(false);
  const [dragOverAnswer, setDragOverAnswer] = useState(false);

  const handleDrop = useCallback(
    (setter: (f: File) => void, setDrag: (v: boolean) => void) =>
      (e: React.DragEvent) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".docx"))) {
          setter(file);
        }
      },
    []
  );

  const handleUpload = async () => {
    if (!testFile || !answerFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("test_file", testFile);
      formData.append("answer_key_file", answerFile);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await res.json();

      if (data.success && data.data) {
        setTestData(data.data);
        router.push("/exam");
      } else {
        setError(data.error || "Failed to parse test files. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Computer-Delivered Practice
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-3">
            IELTS Mock Test
          </h1>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            Upload your test paper and answer key to start a realistic practice session with auto-scoring.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-border p-8">
          <div className="grid gap-6">
            {/* Test File */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Test Paper
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverTest(true); }}
                onDragLeave={() => setDragOverTest(false)}
                onDrop={handleDrop(setTestFile, setDragOverTest)}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragOverTest
                    ? "border-primary bg-primary-light/50 scale-[1.01]"
                    : testFile
                      ? "border-success bg-success-light/30"
                      : "border-border hover:border-primary/50 hover:bg-surface"
                  }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files?.[0] && setTestFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="test-file-input"
                />
                {testFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-text-primary">{testFile.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTestFile(null); }}
                      className="text-text-muted hover:text-error transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="text-sm text-text-secondary">
                      Drag & drop or <span className="text-primary font-medium">browse</span>
                    </p>
                    <p className="text-xs text-text-muted mt-1">PDF or DOCX</p>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Key File */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Answer Key
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverAnswer(true); }}
                onDragLeave={() => setDragOverAnswer(false)}
                onDrop={handleDrop(setAnswerFile, setDragOverAnswer)}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragOverAnswer
                    ? "border-primary bg-primary-light/50 scale-[1.01]"
                    : answerFile
                      ? "border-success bg-success-light/30"
                      : "border-border hover:border-primary/50 hover:bg-surface"
                  }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files?.[0] && setAnswerFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="answer-file-input"
                />
                {answerFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-text-primary">{answerFile.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAnswerFile(null); }}
                      className="text-text-muted hover:text-error transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                    <p className="text-sm text-text-secondary">
                      Drag & drop or <span className="text-primary font-medium">browse</span>
                    </p>
                    <p className="text-xs text-text-muted mt-1">PDF or DOCX</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-error-light text-error text-sm flex items-start gap-2 animate-fade-in-up">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleUpload}
            disabled={!testFile || !answerFile || isLoading}
            id="upload-submit-btn"
            className={`mt-6 w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base transition-all duration-200 ${!testFile || !answerFile || isLoading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
              }`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing with AI...
              </span>
            ) : (
              "Generate Mock Test"
            )}
          </button>

          {isLoading && (
            <p className="text-center text-sm text-text-muted mt-3 animate-fade-in-up">
              Extracting text and parsing with DeepSeek AI. This may take 15–30 seconds...
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-text-muted">
          Supports Reading &amp; Listening • All 9 question types • Instant auto-scoring
        </div>
      </div>
    </div>
  );
}
