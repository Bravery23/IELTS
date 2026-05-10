"""
FastAPI application for IELTS Mock Test Platform.
Handles file uploads, text extraction, and LLM parsing.
"""
import logging
import time
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import UploadResponse, TestData
from services.extractor import extract_text
from services.llm_parser import parse_test_with_llm

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ielts.api")

app = FastAPI(
    title="IELTS Mock Test API",
    description="Backend API for the Computer-Delivered IELTS Mock Test Platform",
    version="1.0.0",
)

# CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ielts-mock-test-api"}


@app.post("/api/upload", response_model=UploadResponse)
async def upload_test_files(
    test_file: UploadFile = File(..., description="The IELTS test paper (PDF or DOCX)"),
    answer_key_file: UploadFile = File(
        ..., description="The answer key file (PDF or DOCX)"
    ),
):
    """
    Upload an IELTS test paper and its answer key.
    Extracts text from both files, sends them to DeepSeek LLM for parsing,
    and returns a structured JSON matching the Universal Data Contract.
    """
    total_start = time.time()
    logger.info("=" * 60)
    logger.info(f"📥 Upload received: test={test_file.filename}, answer_key={answer_key_file.filename}")

    # Validate file types
    allowed_extensions = {".pdf", ".docx"}
    for f in [test_file, answer_key_file]:
        filename = f.filename or ""
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format: {filename}. Only .pdf and .docx are accepted.",
            )

    try:
        # Phase 1: Extract text from both files
        logger.info("📄 Phase 1: Extracting text...")
        t0 = time.time()
        test_text = await extract_text(test_file)
        logger.info(f"   Test file extracted: {len(test_text)} chars in {(time.time() - t0)*1000:.0f}ms")

        t0 = time.time()
        answer_key_text = await extract_text(answer_key_file)
        logger.info(f"   Answer key extracted: {len(answer_key_text)} chars in {(time.time() - t0)*1000:.0f}ms")

        if not test_text.strip():
            raise ValueError("Could not extract any text from the test file.")
        if not answer_key_text.strip():
            raise ValueError("Could not extract any text from the answer key file.")

        # Phase 2: Send to DeepSeek LLM for parsing
        logger.info("🤖 Phase 2: Sending to DeepSeek LLM...")
        t0 = time.time()
        parsed_data = await parse_test_with_llm(test_text, answer_key_text)
        logger.info(f"   LLM parsing complete in {time.time() - t0:.1f}s")

        # Phase 3: Validate with Pydantic
        logger.info("✅ Phase 3: Validating with Pydantic...")
        t0 = time.time()
        test_data = TestData(**parsed_data)
        logger.info(f"   Validation complete in {(time.time() - t0)*1000:.0f}ms")

        total_elapsed = time.time() - total_start
        logger.info(f"🏁 Total pipeline: {total_elapsed:.1f}s")
        logger.info("=" * 60)

        return UploadResponse(success=True, data=test_data)

    except ValueError as e:
        logger.error(f"❌ ValueError: {str(e)}")
        return UploadResponse(success=False, error=str(e))
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        return UploadResponse(success=False, error=f"An unexpected error occurred: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
