"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  initialMinutes: number;
  onTimeUp?: () => void;
}

export default function Timer({ initialMinutes, onTimeUp }: Props) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (seconds <= 0 && onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onTimeUp]);

  const toggleTimer = useCallback(() => setIsRunning((prev) => !prev), []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds <= 300; // 5 minutes
  const isCritical = seconds <= 60; // 1 minute

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTimer}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        title={isRunning ? "Pause timer" : "Resume timer"}
      >
        {isRunning ? (
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      <div
        className={`font-mono text-lg font-bold tabular-nums tracking-wide px-3 py-1 rounded-lg transition-colors ${
          isCritical
            ? "text-white bg-error animate-pulse"
            : isLow
            ? "text-error bg-error-light"
            : "text-text-primary bg-slate-100"
        }`}
      >
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
    </div>
  );
}
