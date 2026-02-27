"""
Risk scoring engine for Cognitive Echo Sentinel.

Performs:
  1. Vocal Twin baseline comparison (mock)
  2. Acoustic Risk Score computation
  3. LLM-based lexical analysis (Featherless AI) with safe fallback
  4. Cognitive Risk Score from lexical metrics
  5. Final Neuro Risk Score (acoustic + cognitive fusion)
"""

from __future__ import annotations

import logging
import math
import random
from typing import Any

from app.services.lexical_analyzer import analyze_lexical_cognition

logger = logging.getLogger("cognitive-echo.risk")


# ─── Baseline Comparison (Vocal Twin) ────────────────────────────────────────

def compare_to_baseline(features: dict) -> dict:
    """
    Compare current voice features against a stored baseline profile.

    In production this would load a per-user baseline vector and compute
    cosine distance.  For the demo we simulate realistic drift values.
    """
    jitter = features.get("jitter_percent", 1.5)
    shimmer = features.get("shimmer_percent", 4.0)
    stability = features.get("pitch_stability", 0.8)
    pause = features.get("pause_ratio", 0.15)

    # Simulate MFCC vector drift (Euclidean dist normalised to 0-100)
    mfcc_drift = _clamp(abs(jitter - 1.2) * 15 + abs(shimmer - 3.5) * 5 + random.uniform(-5, 5))

    pitch_deviation = _clamp(abs(features.get("pitch_std_hz", 10) - 12) * 3 + random.uniform(-3, 3))
    rhythm_deviation = _clamp(abs(pause - 0.12) * 120 + random.uniform(-4, 4))

    deviation = round((mfcc_drift * 0.4 + pitch_deviation * 0.3 + rhythm_deviation * 0.3), 2)
    deviation = _clamp(deviation)

    status = (
        "normal" if deviation < 20
        else "mild_drift" if deviation < 45
        else "significant_drift" if deviation < 70
        else "critical_drift"
    )

    return {
        "deviation_score": round(deviation, 2),
        "mfcc_drift": round(mfcc_drift, 2),
        "pitch_deviation": round(pitch_deviation, 2),
        "rhythm_deviation": round(rhythm_deviation, 2),
        "status": status,
    }


# ─── Acoustic Risk Score ─────────────────────────────────────────────────────

def compute_acoustic_risk(features: dict, baseline: dict) -> float:
    """
    Weighted score combining voice quality metrics.

    Returns 0-100 where higher = higher risk.
    """
    jitter_score = _sigmoid_risk(features.get("jitter_percent", 1.5), center=2.0, steepness=3.0)
    shimmer_score = _sigmoid_risk(features.get("shimmer_percent", 4.0), center=5.0, steepness=2.0)
    stability_risk = (1.0 - features.get("pitch_stability", 0.8)) * 100
    hnr_risk = max(0, 100 - features.get("harmonics_to_noise", 20) * 4)
    baseline_risk = baseline.get("deviation_score", 25)

    # Weighted combination
    risk = (
        jitter_score * 0.20
        + shimmer_score * 0.15
        + stability_risk * 0.20
        + hnr_risk * 0.15
        + baseline_risk * 0.30
    )
    return round(_clamp(risk), 1)


# ─── Placeholder Lexical Analysis ────────────────────────────────────────────

def lexical_analysis_placeholder() -> dict:
    """
    Placeholder for LLM-based lexical analysis (Featherless / Whisper).

    In production:
      1. Transcribe audio with Whisper
      2. Send transcript to LLM for coherence / vocabulary analysis
    """
    coherence = round(random.uniform(55, 95), 1)
    vocabulary = round(random.uniform(50, 90), 1)
    repetition = round(random.uniform(5, 40), 1)

    summaries = [
        "Speech patterns show generally coherent sentence structure with occasional hesitation markers. "
        "Vocabulary usage is within normal range. No significant lexical anomalies detected.",
        "Mild increase in filler words and self-corrections observed. Semantic content remains "
        "largely coherent. Vocabulary diversity is adequate for conversational speech.",
        "Speech demonstrates good narrative flow with clear topic maintenance. Minor word-finding "
        "pauses noted but within age-appropriate norms.",
        "Analysis reveals consistent use of complex sentence structures. Slight increase in "
        "repetitive phrasing detected, possibly due to emphasis rather than pathology.",
    ]

    return {
        "coherence_score": coherence,
        "vocabulary_richness": vocabulary,
        "repetition_index": repetition,
        "summary": random.choice(summaries),
    }


# ─── Final Cognitive Risk Score ──────────────────────────────────────────────

def compute_cognitive_risk(
    acoustic_risk: float,
    lexical: dict,
    baseline: dict,
) -> dict:
    """
    Aggregate all signals into a final Cognitive Risk Score + level.
    """
    lex_risk = (
        (100 - lexical.get("coherence_score", 75)) * 0.4
        + (100 - lexical.get("vocabulary_richness", 70)) * 0.3
        + lexical.get("repetition_index", 20) * 0.3
    )

    cognitive_score = round(
        acoustic_risk * 0.55 + lex_risk * 0.30 + baseline.get("deviation_score", 25) * 0.15,
        1,
    )
    cognitive_score = _clamp(cognitive_score)

    level = (
        "Low" if cognitive_score < 30
        else "Medium" if cognitive_score < 60
        else "High"
    )

    confidence = round(max(0.4, min(0.95, 0.85 - abs(cognitive_score - 50) * 0.005 + random.uniform(-0.05, 0.05))), 2)

    return {
        "acoustic_risk_score": acoustic_risk,
        "cognitive_risk_score": cognitive_score,
        "neuro_risk_level": level,
        "confidence": confidence,
    }


# ─── Explanation Generator ───────────────────────────────────────────────────

def generate_explanation(
    features: dict,
    baseline: dict,
    risk: dict,
    lexical: dict,
) -> tuple[str, list[str]]:
    """Generate a human-readable explanation and recommendations."""

    level = risk["neuro_risk_level"]
    acoustic = risk["acoustic_risk_score"]
    cognitive = risk["cognitive_risk_score"]

    parts: list[str] = []
    recs: list[str] = []

    # Opening
    if level == "Low":
        parts.append(
            f"Overall cognitive risk assessment is **Low** (score: {cognitive}/100). "
            "Voice biomarkers are within healthy parameters."
        )
    elif level == "Medium":
        parts.append(
            f"Cognitive risk assessment is **Medium** (score: {cognitive}/100). "
            "Some acoustic markers show mild deviation from expected baseline patterns."
        )
    else:
        parts.append(
            f"Cognitive risk assessment is **High** (score: {cognitive}/100). "
            "Multiple voice biomarkers show significant deviation from baseline. "
            "Professional evaluation is recommended."
        )

    # Feature details
    jitter = features.get("jitter_percent", 1.5)
    if jitter > 2.0:
        parts.append(f"Elevated vocal jitter ({jitter}%) suggests increased laryngeal instability.")
        recs.append("Consider an ENT evaluation to rule out vocal cord pathology.")

    stability = features.get("pitch_stability", 0.8)
    if stability < 0.6:
        parts.append(f"Pitch stability is below normal ({stability:.2f}), indicating potential motor speech changes.")

    if baseline.get("status") in ("significant_drift", "critical_drift"):
        parts.append(f"Vocal Twin comparison shows {baseline['status'].replace('_', ' ')} from your stored baseline.")
        recs.append("Schedule a follow-up recording in 2 weeks to track progression.")

    # Lexical
    if lexical.get("coherence_score", 80) < 65:
        parts.append("Lexical analysis indicates reduced semantic coherence in speech content.")
        recs.append("Consider a brief cognitive screening (e.g., MoCA) with your primary care provider.")

    if not recs:
        recs.append("Continue regular monitoring with bi-weekly voice recordings.")
        recs.append("Maintain a healthy lifestyle with adequate sleep and hydration.")

    return " ".join(parts), recs


# ─── Featherless Lexical Analysis (async, reliability-aware) ─────────────────


async def run_lexical_analysis(transcript: str) -> dict[str, Any]:
    """
    Call Featherless AI for lexical cognition analysis.

    Returns a dict that ALWAYS includes a 'status' key:
      - status='success': real LLM metrics are present
      - status='unavailable': analysis could not be completed;
        includes error_type and message instead of fake values

    The API will never crash and will never fabricate medical data.
    """
    if not transcript or not transcript.strip():
        logger.warning("Empty transcript – lexical analysis unavailable.")
        return {
            "status": "unavailable",
            "error_type": "empty_transcript",
            "message": "No transcript available for lexical analysis.",
        }

    try:
        metrics = await analyze_lexical_cognition(transcript)
        logger.info(
            "Featherless lexical analysis succeeded – concern: %s",
            metrics.get("cognitive_concern", "unknown"),
        )
        metrics["status"] = "success"
        return metrics
    except ValueError as exc:
        logger.warning("Lexical analysis input error: %s", exc)
        return {
            "status": "unavailable",
            "error_type": "input_validation",
            "message": str(exc),
        }
    except RuntimeError as exc:
        logger.warning("Featherless lexical analysis failed: %s", exc)
        return {
            "status": "unavailable",
            "error_type": "api_failure",
            "message": f"Lexical analysis could not be completed: {exc}",
        }
    except Exception as exc:
        logger.error("Unexpected error in lexical analysis: %s", exc, exc_info=True)
        return {
            "status": "unavailable",
            "error_type": "unexpected_error",
            "message": "An unexpected error occurred during lexical analysis.",
        }


# ─── Cognitive Score from Lexical Metrics ─────────────────────────────────────

def compute_cognitive_score(metrics: dict[str, Any]) -> float:
    """
    Compute a 0–100 cognitive score from Featherless lexical metrics.

    Formula (each weight = 0.25):
      - vocabulary_richness (higher is better          → lower risk)
      - sentence_coherence  (higher is better          → lower risk)
      - word_finding_difficulty (higher is worse        → inverted)
      - repetition_tendency    (higher is worse         → inverted)

    Score represents *health* (100 = best), then inverted to *risk*.
    """
    vocab = metrics.get("vocabulary_richness", 0.5)
    coherence = metrics.get("sentence_coherence", 0.5)
    word_diff = metrics.get("word_finding_difficulty", 0.5)
    repetition = metrics.get("repetition_tendency", 0.5)

    # Health score (0-1, 1 = healthy)
    health = (
        vocab * 0.25
        + coherence * 0.25
        + (1.0 - word_diff) * 0.25
        + (1.0 - repetition) * 0.25
    )

    # Invert to risk (0-100, 100 = highest risk)
    risk = (1.0 - health) * 100.0
    return round(_clamp(risk), 1)


# ─── Final Neuro Risk (Acoustic + Cognitive Fusion) ──────────────────────────

def compute_final_neuro_risk(
    acoustic_risk: float,
    cognitive_score: float | None = None,
) -> dict[str, Any]:
    """
    Fuse acoustic and cognitive scores into a single Neuro Risk indicator.

    When cognitive_score is available:
      final = acoustic * 0.6 + cognitive * 0.4

    When cognitive_score is unavailable (None):
      final = acoustic score only (no fabricated cognitive data)
      cognitive_available = False
    """
    cognitive_available = cognitive_score is not None

    if cognitive_available:
        final_score = round(
            acoustic_risk * 0.6 + cognitive_score * 0.4,
            1,
        )
    else:
        # Acoustic-only mode – do not fabricate cognitive values
        final_score = round(acoustic_risk, 1)
        logger.warning(
            "Cognitive score unavailable – neuro risk based on acoustic data only."
        )

    final_score = _clamp(final_score)

    level = (
        "Low" if final_score < 30
        else "Medium" if final_score < 60
        else "High"
    )

    # Confidence is lower when cognitive data is missing
    base_confidence = 0.85 if cognitive_available else 0.65
    confidence = round(
        max(0.3, min(0.95, base_confidence - abs(final_score - 50) * 0.005 + random.uniform(-0.05, 0.05))),
        2,
    )

    result: dict[str, Any] = {
        "acoustic_risk_score": acoustic_risk,
        "cognitive_risk_score": round(cognitive_score, 1) if cognitive_available else None,
        "neuro_risk_level": level,
        "confidence": confidence,
        "cognitive_available": cognitive_available,
    }

    return result


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


def _sigmoid_risk(value: float, center: float, steepness: float) -> float:
    """Sigmoid mapping: values above center → higher risk (0-100)."""
    x = (value - center) * steepness
    return 100.0 / (1.0 + math.exp(-x))
