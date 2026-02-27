"""
Cognitive Echo Sentinel – FastAPI Backend

Main application entry point.
"""

from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()  # Load .env before any service imports

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    AnalysisResponse,
    AcousticFeatures,
    BaselineComparison,
    LexicalAnalysis,
    LexicalMetrics,
    RiskScores,
)
from app.services.audio_features import extract_features
from app.services.risk_engine import (
    compare_to_baseline,
    compute_acoustic_risk,
    compute_cognitive_risk,
    compute_cognitive_score,
    compute_final_neuro_risk,
    generate_explanation,
    lexical_analysis_placeholder,
    run_lexical_analysis,
)

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("cognitive-echo")

# ─── App Lifecycle ────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🧠 Cognitive Echo Sentinel backend starting…")
    yield
    logger.info("Shutting down…")


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Cognitive Echo Sentinel",
    description="AI-powered cognitive health assessment through voice biomarker analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow the Next.js dev server and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "cognitive-echo-sentinel"}


# ─── Main Analysis Endpoint ──────────────────────────────────────────────────

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_audio(file: UploadFile = File(...)):
    """
    Accept an audio file, run the full analysis pipeline, and return
    structured risk assessment data.
    """
    logger.info("Received audio file: %s (%s)", file.filename, file.content_type)

    # 1. Read audio bytes
    try:
        audio_bytes = await file.read()
        if len(audio_bytes) < 100:
            raise HTTPException(status_code=400, detail="Audio file is too small or empty.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to read uploaded file: %s", e)
        raise HTTPException(status_code=400, detail="Invalid audio file.")

    logger.info("Audio size: %d bytes", len(audio_bytes))

    # 2. Extract acoustic features
    features = extract_features(audio_bytes)
    duration = features.pop("_duration", 5.0)
    logger.info("Extracted features – pitch=%.1f Hz, jitter=%.2f%%", features["mean_pitch_hz"], features["jitter_percent"])

    # 3. Baseline comparison (Vocal Twin)
    baseline = compare_to_baseline(features)
    logger.info("Baseline comparison – deviation=%.1f, status=%s", baseline["deviation_score"], baseline["status"])

    # 4. Acoustic Risk Score
    acoustic_risk = compute_acoustic_risk(features, baseline)
    logger.info("Acoustic risk score: %.1f", acoustic_risk)

    # 5. Lexical Analysis (placeholder for dashboard compatibility)
    lexical = lexical_analysis_placeholder()

    # 5b. Featherless AI lexical analysis (async, with retry)
    # NOTE: In production, transcript comes from Whisper. Using placeholder here.
    transcript_placeholder = "This is a placeholder transcript for demonstration purposes."
    lexical_result = await run_lexical_analysis(transcript_placeholder)

    # 6. Determine lexical availability
    lexical_status = lexical_result.get("status", "unavailable")
    cognitive_available = lexical_status == "success"

    if cognitive_available:
        logger.info("Lexical metrics: %s", lexical_result)
        cognitive_score = compute_cognitive_score(lexical_result)
        logger.info("Cognitive score (lexical): %.1f", cognitive_score)
        lexical_metrics_obj = LexicalMetrics(
            vocabulary_richness=lexical_result["vocabulary_richness"],
            sentence_coherence=lexical_result["sentence_coherence"],
            word_finding_difficulty=lexical_result["word_finding_difficulty"],
            repetition_tendency=lexical_result["repetition_tendency"],
            cognitive_concern=lexical_result["cognitive_concern"],
        )
        cognitive_concern = lexical_result.get("cognitive_concern")
        lexical_error = None
    else:
        logger.warning(
            "Lexical analysis unavailable (%s): %s",
            lexical_result.get("error_type", "unknown"),
            lexical_result.get("message", "No details"),
        )
        cognitive_score = None
        lexical_metrics_obj = None
        cognitive_concern = None
        lexical_error = lexical_result.get("message")

    # 7. Final Neuro Risk (acoustic + cognitive fusion, or acoustic-only)
    risk = compute_final_neuro_risk(acoustic_risk, cognitive_score)
    logger.info(
        "Final neuro risk: level=%s, cognitive_available=%s",
        risk["neuro_risk_level"], cognitive_available,
    )

    # 8. Explanation
    explanation, recommendations = generate_explanation(features, baseline, risk, lexical)

    if not cognitive_available:
        explanation += (
            " Note: Lexical analysis was unavailable for this session. "
            "Risk assessment is based on acoustic data only."
        )
        recommendations.append(
            "Re-record and retry when the lexical analysis service is available "
            "for a more comprehensive assessment."
        )

    # 9. Build response
    session_id = str(uuid.uuid4())

    return AnalysisResponse(
        session_id=session_id,
        duration_seconds=duration,
        acoustic_features=AcousticFeatures(**features),
        baseline_comparison=BaselineComparison(**baseline),
        lexical_analysis=LexicalAnalysis(**lexical),
        lexical_metrics=lexical_metrics_obj,
        risk_scores=RiskScores(**risk),
        cognitive_available=cognitive_available,
        lexical_status=lexical_status,
        lexical_error_message=lexical_error,
        cognitive_concern=cognitive_concern,
        explanation=explanation,
        recommendations=recommendations,
    )
