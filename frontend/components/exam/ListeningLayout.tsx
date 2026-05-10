"use client";

import { useRef, useState } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { useExamStore } from "@/store/examStore";
import type { TestData } from "@/types/exam";

interface Props {
  testData: TestData;
}

export default function ListeningLayout({ testData }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { activeSection, setActiveSection } = useExamStore();

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const section = testData.sections[activeSection];
  if (!section) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky Audio Player */}
      <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">{testData.title}</h2>

          {testData.audioUrl ? (
            <div className="flex items-center gap-4">
              <audio
                ref={audioRef}
                src={testData.audioUrl}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
              />

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Number(e.target.value);
                      setCurrentTime(Number(e.target.value));
                    }
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-warning-light rounded-lg text-warning text-sm">
              No audio URL provided. Answer the questions below.
            </div>
          )}
        </div>

        {/* Section Tabs */}
        {testData.sections.length > 1 && (
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-border">
            {testData.sections.map((sec, idx) => (
              <button
                key={sec.sectionId}
                onClick={() => setActiveSection(idx)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  idx === activeSection
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {sec.title || `Section ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Questions — NO transcript */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <QuestionRenderer groups={section.questionGroups} />
        </div>
      </div>
    </div>
  );
}
