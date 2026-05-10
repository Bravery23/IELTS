"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import { QuestionType } from "@/types/exam";
import type { TestData } from "@/types/exam";

const MOCK_DATA: TestData = {
  testId: "demo-001",
  skill: "READING",
  title: "IELTS Academic Reading Test",
  audioUrl: null,
  sections: [
    {
      sectionId: "s1",
      title: "Passage 1: The History of Glass",
      content: {
        passage: `<p>Glass is one of the most versatile materials ever invented. It can be colored or colorless, opaque or transparent, and can be molded into any shape. <b>From the earliest times, glass has been used to create objects of great beauty.</b></p>
<p>The origins of glass are wrapped in mystery. According to one legend, Phoenician merchants transporting blocks of natron across the desert stopped near a river to cook food. Finding no stones to support their cooking pots, they used lumps of natron. The heat from the fire melted the natron and mixed it with the sand on the river bank to form an opaque liquid, which when cooled produced glass.</p>
<p><i>Archaeological evidence suggests that the first true glass was made in coastal north Syria, Mesopotamia or ancient Egypt.</i> The earliest known glass objects, of the mid-third millennium BC, were beads, perhaps initially created as accidental by-products of metal-working.</p>`,
      },
      questionGroups: [
        {
          groupId: "g1",
          instruction: "Do the following statements agree with the information given in the reading passage? Write TRUE, FALSE, or NOT GIVEN.",
          type: QuestionType.TRUE_FALSE_NOT_GIVEN,
          questions: [
            { id: "q1", number: 1, text: "Glass can only be transparent.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE" },
            { id: "q2", number: 2, text: "Phoenician merchants discovered glass accidentally.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "TRUE" },
            { id: "q3", number: 3, text: "The earliest glass objects were cups and bowls.", options: ["TRUE", "FALSE", "NOT GIVEN"], correctAnswer: "FALSE" },
          ],
        },
        {
          groupId: "g2",
          instruction: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage.",
          type: QuestionType.SENTENCE_COMPLETION,
          questions: [
            { id: "q4", number: 4, text: "The merchants used lumps of {blank} to support their cooking pots.", correctAnswer: "natron" },
            { id: "q5", number: 5, text: "The earliest glass objects were {blank}, created as accidental by-products.", correctAnswer: "beads" },
          ],
        },
      ],
    },
    {
      sectionId: "s2",
      title: "Passage 2: Urban Farming",
      content: {
        passage: `<p>Urban farming is the practice of cultivating, processing, and distributing food in or around urban areas. It has become increasingly important as cities continue to grow and expand.</p>
<p>One of the key benefits of urban farming is that it reduces the distance food needs to travel from farm to plate, thereby cutting carbon emissions and ensuring fresher produce for city dwellers.</p>
<p>Vertical farming, a subset of urban farming, involves growing crops in stacked layers, often in controlled environments. This approach uses significantly less water than traditional agriculture and can operate year-round regardless of weather conditions.</p>`,
      },
      questionGroups: [
        {
          groupId: "g3",
          instruction: "Choose the correct letter, A, B, C, or D.",
          type: QuestionType.MULTIPLE_CHOICE,
          questions: [
            {
              id: "q6", number: 6, text: "What is one key benefit of urban farming?",
              options: ["It is cheaper than traditional farming", "It reduces food transportation distance", "It produces more food per acre", "It requires no water"],
              correctAnswer: "B",
            },
            {
              id: "q7", number: 7, text: "What is vertical farming?",
              options: ["Farming on hillsides", "Growing crops in stacked layers", "Using vertical windmills", "Planting trees in rows"],
              correctAnswer: "B",
            },
          ],
        },
        {
          groupId: "g4",
          instruction: "Answer the questions below using NO MORE THAN THREE WORDS.",
          type: QuestionType.SHORT_ANSWER_QUESTIONS,
          questions: [
            { id: "q8", number: 8, text: "What does vertical farming use less of compared to traditional agriculture?", correctAnswer: "water" },
          ],
        },
      ],
    },
    {
      sectionId: "s3",
      title: "Passage 3: The Science of Sleep",
      content: {
        passage: `<p>Sleep is a fundamental biological process that affects every aspect of human health and performance. <b>Research has shown that adults need between seven and nine hours of sleep per night for optimal functioning.</b></p>
<p>During sleep, the brain goes through several cycles of different sleep stages. The most important of these are REM (Rapid Eye Movement) sleep and deep sleep. REM sleep is crucial for memory consolidation and emotional regulation.</p>
<p>Chronic sleep deprivation has been linked to numerous health problems, including obesity, cardiovascular disease, and weakened immune function. It also significantly impairs cognitive performance and decision-making abilities.</p>`,
      },
      questionGroups: [
        {
          groupId: "g5",
          instruction: "Which paragraph contains the following information? Write the correct letter, A-C.",
          type: QuestionType.MATCHING_INFORMATION,
          questions: [
            { id: "q9", number: 9, text: "The health consequences of insufficient sleep", options: ["A", "B", "C"], correctAnswer: "C" },
            { id: "q10", number: 10, text: "The recommended amount of sleep for adults", options: ["A", "B", "C"], correctAnswer: "A" },
          ],
        },
        {
          groupId: "g6",
          instruction: "Complete the summary below. Choose ONE WORD from the box for each answer.",
          type: QuestionType.SUMMARY_COMPLETION,
          questions: [
            { id: "q11", number: 11, text: "REM sleep is crucial for memory {blank} and emotional regulation.", options: ["consolidation", "formation", "loss", "storage"], correctAnswer: "consolidation" },
            { id: "q12", number: 12, text: "Sleep deprivation impairs cognitive performance and {blank} abilities.", options: ["physical", "decision-making", "social", "creative"], correctAnswer: "decision-making" },
          ],
        },
      ],
    },
  ],
};

export default function DemoPage() {
  const router = useRouter();
  const { setTestData } = useExamStore();

  useEffect(() => {
    setTestData(MOCK_DATA);
    router.replace("/exam");
  }, [setTestData, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-text-secondary">Loading demo test...</p>
      </div>
    </div>
  );
}
