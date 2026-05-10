"use client";

import { QuestionType } from "@/types/exam";
import type { QuestionGroup } from "@/types/exam";
import MultipleChoice from "@/components/questions/MultipleChoice";
import TrueFalseNotGiven from "@/components/questions/TrueFalseNotGiven";
import YesNoNotGiven from "@/components/questions/YesNoNotGiven";
import MatchingHeadings from "@/components/questions/MatchingHeadings";
import MatchingInformation from "@/components/questions/MatchingInformation";
import MatchingFeatures from "@/components/questions/MatchingFeatures";
import MatchingSentenceEndings from "@/components/questions/MatchingSentenceEndings";
import SentenceCompletion from "@/components/questions/SentenceCompletion";
import SummaryCompletion from "@/components/questions/SummaryCompletion";
import ShortAnswer from "@/components/questions/ShortAnswer";

interface Props {
  groups: QuestionGroup[];
}

const COMPONENT_MAP: Record<QuestionType, React.ComponentType<{ questions: QuestionGroup["questions"] }>> = {
  [QuestionType.MULTIPLE_CHOICE]: MultipleChoice,
  [QuestionType.TRUE_FALSE_NOT_GIVEN]: TrueFalseNotGiven,
  [QuestionType.YES_NO_NOT_GIVEN]: YesNoNotGiven,
  [QuestionType.MATCHING_HEADINGS]: MatchingHeadings,
  [QuestionType.MATCHING_INFORMATION]: MatchingInformation,
  [QuestionType.MATCHING_FEATURES]: MatchingFeatures,
  [QuestionType.MATCHING_SENTENCE_ENDINGS]: MatchingSentenceEndings,
  [QuestionType.SENTENCE_COMPLETION]: SentenceCompletion,
  [QuestionType.SUMMARY_COMPLETION]: SummaryCompletion,
  [QuestionType.SHORT_ANSWER_QUESTIONS]: ShortAnswer,
};

function getTypeLabel(type: QuestionType): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function QuestionRenderer({ groups }: Props) {
  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const Component = COMPONENT_MAP[group.type];
        if (!Component) {
          return (
            <div key={group.groupId} className="p-4 bg-warning-light rounded-lg text-warning text-sm">
              Unsupported question type: {group.type}
            </div>
          );
        }

        const firstQ = group.questions[0]?.number ?? 0;
        const lastQ = group.questions[group.questions.length - 1]?.number ?? 0;

        return (
          <div
            key={group.groupId}
            id={`group-${group.groupId}`}
            className="animate-fade-in-up"
          >
            {/* Group Header */}
            <div className="mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {getTypeLabel(group.type)}
                </span>
                <span className="text-xs text-text-muted">
                  Questions {firstQ}–{lastQ}
                </span>
              </div>
              <p className="text-sm text-text-secondary font-medium mt-1.5">
                {group.instruction}
              </p>
            </div>

            {/* Questions */}
            <Component questions={group.questions} />
          </div>
        );
      })}
    </div>
  );
}
