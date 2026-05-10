"""
Pydantic models mirroring the Universal Data Contract for IELTS test data.
Supports multiple sections (passages) for Reading tests.
"""
from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    TRUE_FALSE_NOT_GIVEN = "TRUE_FALSE_NOT_GIVEN"
    YES_NO_NOT_GIVEN = "YES_NO_NOT_GIVEN"
    MATCHING_HEADINGS = "MATCHING_HEADINGS"
    MATCHING_INFORMATION = "MATCHING_INFORMATION"
    MATCHING_FEATURES = "MATCHING_FEATURES"
    MATCHING_SENTENCE_ENDINGS = "MATCHING_SENTENCE_ENDINGS"
    SENTENCE_COMPLETION = "SENTENCE_COMPLETION"
    SUMMARY_COMPLETION = "SUMMARY_COMPLETION"
    SHORT_ANSWER_QUESTIONS = "SHORT_ANSWER_QUESTIONS"


class Skill(str, Enum):
    READING = "READING"
    LISTENING = "LISTENING"


class Question(BaseModel):
    id: str
    number: int
    text: str
    options: Optional[List[str]] = None
    correctAnswer: Union[str, List[str]]


class QuestionGroup(BaseModel):
    groupId: str
    instruction: str
    type: QuestionType
    questions: List[Question]


class TestContent(BaseModel):
    passage: str


class Section(BaseModel):
    """One section = one passage + its question groups.
    Reading has 3 sections (Passage 1, 2, 3).
    Listening has 4 sections (Section 1, 2, 3, 4) with no passage text."""
    sectionId: str
    title: str
    content: TestContent
    questionGroups: List[QuestionGroup]


class TestData(BaseModel):
    testId: str
    skill: Skill
    title: str
    audioUrl: Optional[str] = None
    sections: List[Section]


class UploadResponse(BaseModel):
    success: bool
    data: Optional[TestData] = None
    error: Optional[str] = None
