"""
DeepSeek LLM integration for parsing IELTS test papers and answer keys
into a structured JSON format matching the Universal Data Contract.

Uses AsyncOpenAI to avoid blocking the FastAPI event loop.
"""
import json
import logging
import os
import time
import uuid
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ielts.llm_parser")

# Initialize DeepSeek async client using OpenAI SDK
client = AsyncOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY", ""),
    base_url="https://api.deepseek.com",
)

SYSTEM_PROMPT = """You are an expert IELTS test parser. Your job is to analyze raw text extracted from an IELTS test paper and its corresponding answer key, then produce a strictly valid JSON object.

## OUTPUT JSON SCHEMA
You MUST return a JSON object with this EXACT structure:
{
  "testId": "string (generate a unique ID)",
  "skill": "READING" or "LISTENING",
  "title": "string (e.g. 'Cambridge IELTS 18 Academic Reading Test 1')",
  "audioUrl": null,
  "sections": [
    {
      "sectionId": "string (unique ID for this section)",
      "title": "string (e.g. 'Reading Passage 1: Urban Farming' or 'Section 1')",
      "content": {
        "passage": "string (the reading passage with HTML: <p>, <b>, <i> tags. For LISTENING, set to empty string '')"
      },
      "questionGroups": [
        {
          "groupId": "string (unique ID for this group)",
          "instruction": "string (e.g. 'Choose NO MORE THAN TWO WORDS...')",
          "type": "ENUM (one of the types listed below)",
          "questions": [
            {
              "id": "string (unique ID)",
              "number": number (the question number, e.g. 1, 2, 3),
              "text": "string (question text. For fill-in-blank, use {blank} placeholder)",
              "options": ["string"] or null,
              "correctAnswer": "string" or ["string"] (from the answer key)
            }
          ]
        }
      ]
    }
  ]
}

## CRITICAL RULES FOR SECTIONS:
- For READING tests: Split into SEPARATE sections for each passage. A typical IELTS Reading test has 3 passages. Each passage = one section with its own title, passage text, and question groups.
- For LISTENING tests: Split into sections (Section 1, 2, 3, 4). Set content.passage to empty string "" for each section (do NOT include a transcript).

## SUPPORTED QUESTION TYPES (use these EXACT enum values):
- "MULTIPLE_CHOICE" — Questions with lettered options (A, B, C, D). Set options array with the full text of each option.
- "TRUE_FALSE_NOT_GIVEN" — Statements to judge as True, False, or Not Given. Set options to ["TRUE", "FALSE", "NOT GIVEN"].
- "YES_NO_NOT_GIVEN" — Statements to judge as Yes, No, or Not Given. Set options to ["YES", "NO", "NOT GIVEN"].
- "MATCHING_HEADINGS" — Match paragraphs to headings. Each question represents a paragraph. Options = list of heading choices.
- "MATCHING_INFORMATION" — Match statements to paragraphs. Options = paragraph letters (e.g., ["A", "B", "C", "D"]).
- "MATCHING_FEATURES" — Match statements to people/entities. Options = list of entities.
- "MATCHING_SENTENCE_ENDINGS" — Match sentence beginnings with endings. Options = list of possible endings.
- "SENTENCE_COMPLETION" — Complete sentences with words from the passage. Use {blank} in text. No options needed.
- "SUMMARY_COMPLETION" — A summary paragraph with blanks. Use {blank} for each blank. If a word bank is provided, include it in options.
- "SHORT_ANSWER_QUESTIONS" — Answer with words from the passage. No options needed.

## RULES:
1. Determine if the test is READING or LISTENING from the context.
2. For READING: Identify each separate passage and create a section for each one. Extract the passage text with HTML paragraph tags.
3. For LISTENING: Create sections but set passage to empty string.
4. Group questions by their instruction block. Each distinct instruction = one questionGroup.
5. Assign question groups to the correct section based on which passage they belong to.
6. Classify each group into EXACTLY ONE of the supported types above.
7. For EVERY question, find and fill in the correctAnswer from the provided answer key text.
8. Match answers by question number.
9. Ensure all question numbers are integers and sequential.
10. Generate unique IDs for testId, sectionId, groupId, and question id fields.
11. If a question type uses options, ALWAYS provide the options array.
12. For TRUE_FALSE_NOT_GIVEN and YES_NO_NOT_GIVEN, normalize answers to uppercase.
13. Return ONLY the JSON object, no markdown, no explanations, no code fences."""


async def parse_test_with_llm(test_text: str, answer_key_text: str) -> dict:
    """
    Send the raw test text and answer key text to DeepSeek for parsing
    into a structured JSON format matching the Universal Data Contract.

    Uses AsyncOpenAI so this does NOT block the FastAPI event loop.
    """
    user_message = f"""## RAW TEST PAPER TEXT:
---
{test_text}
---

## RAW ANSWER KEY TEXT:
---
{answer_key_text}
---

Parse the above test paper and answer key into the required JSON format. Separate each reading passage into its own section. Map every answer from the answer key to its corresponding question. Return ONLY valid JSON."""

    try:
        logger.info("📡 Sending request to DeepSeek API (model=deepseek-v4-flash)...")
        logger.info(f"   Test text length: {len(test_text)} chars")
        logger.info(f"   Answer key length: {len(answer_key_text)} chars")

        t0 = time.time()

        response = await client.chat.completions.create(
            model="deepseek-v4-flash",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_object"},
            extra_body={"thinking": {"type": "disabled"}},
            max_tokens=16384,
            temperature=0.1,
        )

        elapsed = time.time() - t0
        logger.info(f"✅ DeepSeek responded in {elapsed:.1f}s")

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from DeepSeek API")

        logger.info(f"   Response length: {len(content)} chars")
        logger.info(f"   Usage: {response.usage.prompt_tokens} prompt + {response.usage.completion_tokens} completion tokens")

        t1 = time.time()
        parsed = json.loads(content)
        logger.info(f"✅ JSON parsed in {(time.time() - t1) * 1000:.0f}ms")

        # Ensure testId exists
        if not parsed.get("testId"):
            parsed["testId"] = str(uuid.uuid4())

        # Ensure all section/group/question IDs exist
        total_questions = 0
        total_sections = len(parsed.get("sections", []))
        for si, section in enumerate(parsed.get("sections", [])):
            if not section.get("sectionId"):
                section["sectionId"] = f"section-{si + 1}"
            for gi, group in enumerate(section.get("questionGroups", [])):
                if not group.get("groupId"):
                    group["groupId"] = f"group-{si + 1}-{gi + 1}"
                for qi, question in enumerate(group.get("questions", [])):
                    if not question.get("id"):
                        question["id"] = f"q-{question.get('number', qi + 1)}"
                    total_questions += 1

        logger.info(f"📊 Parsed: {total_sections} sections, {total_questions} questions total")

        return parsed

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parse error: {str(e)}")
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
    except Exception as e:
        logger.error(f"❌ LLM error: {str(e)}")
        raise ValueError(f"LLM parsing error: {str(e)}")
