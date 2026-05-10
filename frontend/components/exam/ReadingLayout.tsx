"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { useExamStore } from "@/store/examStore";
import type { TestData } from "@/types/exam";

interface Props {
  testData: TestData;
}

export default function ReadingLayout({ testData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const { activeSection, setActiveSection } = useExamStore();

  const section = testData.sections[activeSection];

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeft = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(newLeft, 25), 75));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!section) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Section Tabs — only show if more than 1 section */}
      {testData.sections.length > 1 && (
        <div className="bg-white border-b border-border px-4 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
          {testData.sections.map((sec, idx) => (
            <button
              key={sec.sectionId}
              onClick={() => setActiveSection(idx)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                idx === activeSection
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-slate-50"
              }`}
            >
              {sec.title || `Passage ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Split Pane */}
      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden"
        style={{ userSelect: isDragging ? "none" : "auto" }}
      >
        {/* Left Panel: Passage */}
        <div
          className="overflow-y-auto"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-bold text-text-primary mb-1">
              {section.title || testData.title}
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-6" />
            {section.content.passage ? (
              <div
                className="passage-content text-[15px] text-text-primary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content.passage }}
              />
            ) : (
              <p className="text-text-muted italic">No passage text available.</p>
            )}
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={`split-pane-divider ${isDragging ? "active" : ""}`}
        />

        {/* Right Panel: Questions */}
        <div
          className="overflow-y-auto"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="p-6 lg:p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6">Questions</h3>
            <QuestionRenderer groups={section.questionGroups} />
          </div>
        </div>
      </div>
    </div>
  );
}
