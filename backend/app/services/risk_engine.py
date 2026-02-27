"""
Risk scoring engine for Cognitive Echo Sentinel.

Performs:
  1. Vocal Twin baseline comparison (mock)
  2. Acoustic Risk Score computation (ML-driven with heuristic fallback)
  3. LLM-based lexical analysis (Featherless AI) with safe fallback
  4. Cognitive Risk Score from lexical metrics
  5. Final Neuro Risk Score (acoustic + cognitive fusion)
"""

from __future__ import annotations

import logging
import math
import random
from pathlib import Path
from typing import Any

import numpy as np

from app.services.lexical_analyzer import analyze_lexical_cognition

logger = logging.getLogger("cognitive-echo.risk")

# ─── ML Model Loading (once at import time) ──────────────────────────────────

_MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

_ml_model = None
_ml_scaler = None
_ml_label_encoder = None
_ml_feature_names: list[str] = []
_ml_ready = False

try:
    import joblib

    _model_path = _MODEL_DIR / "neuro_risk_model.pkl"
    _scaler_path = _MODEL_DIR / "scaler.pkl"
    _encoder_path = _MODEL_DIR / "label_encoder.pkl"
    _features_path = _MODEL_DIR / "feature_names.pkl"

    if _model_path.exists() and _scaler_path.exists():
        _ml_model = joblib.load(_model_path)
        _ml_scaler = joblib.load(_scaler_path)
        if _encoder_path.exists():
            _ml_label_encoder = joblib.load(_encoder_path)
        if _features_path.exists():
            _ml_feature_names = joblib.load(_features_path)
        _ml_ready = True
        logger.info(
            "ML model loaded successfully (%d features, classes=%s)",
            len(_ml_feature_names),
            list(_ml_label_encoder.classes_) if _ml_label_encoder else "unknown",
        )
    else:
        logger.warning(
            "ML model files not found in %s – using heuristic scoring.", _MODEL_DIR
        )
except Exception as exc:
    logger.warning("Failed to load ML model – falling back to heuristic: %s", exc)


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


# ─── ML-Based Acoustic Risk ──────────────────────────────────────────────────

def build_model_feature_vector(features: dict) -> np.ndarray:
    """
    Map live-extracted acoustic features to the model's expected 28-feature input.

    The trained Parkinson model expects features derived from standard voice
    analysis.  Non-extractable features (subject ID, UPDRS) are set to the
    global training-set mean so the model relies on real acoustic signals.

    Feature mapping (from Parkinson Multiple Sound Recording dataset):
        f0:  Subject ID          →  global mean (20.5)
        f1–f5:  Jitter variants
        f6–f11: Shimmer variants
        f12: Autocorrelation     →  pitch stability
        f13: Noise-to-harmonics  →  1/HNR
        f14: Harmonics-to-noise  →  HNR
        f15–f19: Pitch statistics
        f20–f21: Pulse / period counts
        f22–f23: Period mean / std
        f24: Fraction unvoiced   →  pause ratio (%)
        f25–f26: Voice breaks
        f27: UPDRS motor score   →  global mean (13.0)
    """
    jitter = features.get("jitter_percent", 1.5)
    shimmer = features.get("shimmer_percent", 4.0)
    pitch_mean = features.get("mean_pitch_hz", 150.0)
    pitch_std = features.get("pitch_std_hz", 10.0)
    stability = features.get("pitch_stability", 0.8)
    pause = features.get("pause_ratio", 0.15)
    hnr = features.get("harmonics_to_noise", 20.0)
    speech_rate = features.get("speech_rate", 3.5)

    # Derived values
    jitter_abs = jitter / 100.0 * (1.0 / max(pitch_mean, 1.0))
    period_mean = 1.0 / max(pitch_mean, 1.0)
    period_std = pitch_std / max(pitch_mean ** 2, 1.0)
    n_pulses = max(10, int(speech_rate * 30))
    pitch_min = max(50.0, pitch_mean - 2 * pitch_std)
    pitch_max = pitch_mean + 2 * pitch_std

    # Shimmer in this dataset is much larger scale (~13 mean)
    shimmer_scaled = shimmer * 3.0

    vec = np.array([
        20.5,                                    # f0:  Subject ID (global mean)
        jitter,                                  # f1:  Jitter(%)
        jitter_abs,                              # f2:  Jitter(Abs)
        jitter * 0.5,                            # f3:  Jitter:RAP
        jitter * 0.5,                            # f4:  Jitter:PPQ5
        jitter * 1.4,                            # f5:  Jitter:DDP
        shimmer_scaled,                          # f6:  Shimmer
        shimmer * 0.30,                          # f7:  Shimmer(dB)
        shimmer_scaled * 0.44,                   # f8:  Shimmer:APQ3
        shimmer_scaled * 0.62,                   # f9:  Shimmer:APQ5
        shimmer_scaled * 0.95,                   # f10: Shimmer:APQ11
        shimmer_scaled * 1.32,                   # f11: Shimmer:DDA
        stability,                               # f12: AC (autocorrelation)
        max(0.01, 1.0 / (hnr + 0.01)),          # f13: NTH
        hnr,                                     # f14: HTN (harmonics-to-noise)
        pitch_mean,                              # f15: Median pitch
        pitch_mean,                              # f16: Mean pitch
        pitch_std,                               # f17: StdDev pitch
        pitch_min,                               # f18: Min pitch
        pitch_max,                               # f19: Max pitch
        float(n_pulses),                         # f20: Number of pulses
        float(max(1, n_pulses - 4)),             # f21: Number of periods
        period_mean,                             # f22: Mean period
        period_std,                              # f23: StdDev period
        pause * 100.0,                           # f24: Fraction unvoiced (%)
        max(0.0, (pause - 0.1) * 10),           # f25: Number of voice breaks
        max(0.0, (pause - 0.1) * 80),           # f26: Degree of voice breaks
        13.0,                                    # f27: UPDRS (global mean)
    ], dtype=np.float64)

    # Safety: replace NaN / Inf with 0
    vec = np.nan_to_num(vec, nan=0.0, posinf=0.0, neginf=0.0)
    return vec


def predict_acoustic_risk(feature_vector: list[float] | np.ndarray) -> tuple[str, float]:
    """
    Run ML inference on an acoustic feature vector.

    Returns:
        (predicted_label, confidence) where confidence is the max
        class probability from predict_proba.

    Raises RuntimeError if the model is not loaded.
    """
    if not _ml_ready or _ml_model is None:
        raise RuntimeError("ML model not loaded.")

    X = np.asarray(feature_vector, dtype=np.float64).reshape(1, -1)

    expected = len(_ml_feature_names) if _ml_feature_names else X.shape[1]
    if X.shape[1] != expected:
        raise ValueError(
            f"Feature length mismatch: got {X.shape[1]}, expected {expected}"
        )

    # Safety: replace NaN / Inf
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

    # Predict
    pred_encoded = _ml_model.predict(X)[0]
    proba = _ml_model.predict_proba(X)[0]
    confidence = float(np.max(proba))

    # Decode label
    if _ml_label_encoder is not None:
        label = str(_ml_label_encoder.inverse_transform([pred_encoded])[0])
    else:
        label = str(pred_encoded)

    logger.info(
        "ML prediction: label=%s, confidence=%.3f, vector_len=%d",
        label, confidence, X.shape[1],
    )
    return label, confidence


def _probability_to_risk(proba_at_risk: float) -> float:
    """
    Convert the model's at-risk class probability to a 0–100 risk score.

    Maps probability through a sigmoid-like curve for clinical sensitivity:
      prob < 0.3  → low risk  (0–20)
      prob ~ 0.5  → moderate  (35–50)
      prob > 0.7  → high risk (60–95)
    """
    # Sigmoid stretch centred at 0.5
    x = (proba_at_risk - 0.5) * 6.0
    score = 100.0 / (1.0 + math.exp(-x))
    return round(_clamp(score), 1)


# ─── Acoustic Risk Score ─────────────────────────────────────────────────────

def compute_acoustic_risk(features: dict, baseline: dict) -> float:
    """
    Compute acoustic risk score (0–100).

    Strategy:
      1. Always compute the feature-driven heuristic score.
      2. If ML model is available, compute ML risk probability.
      3. Final score = weighted blend (40% ML + 60% heuristic).
      4. On ML failure, use heuristic only.
    """
    heuristic_score = _heuristic_acoustic_risk(features, baseline)

    # ── Attempt ML blend ──────────────────────────────────────────────
    if _ml_ready:
        try:
            vec = build_model_feature_vector(features)
            X = np.asarray(vec, dtype=np.float64).reshape(1, -1)
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

            proba = _ml_model.predict_proba(X)[0]
            pred_encoded = _ml_model.predict(X)[0]

            # Decode label for logging
            if _ml_label_encoder is not None:
                label = str(_ml_label_encoder.inverse_transform([pred_encoded])[0])
            else:
                label = str(pred_encoded)

            # At-risk class probability (class "1" / "parkinson")
            at_risk_idx = 1 if len(proba) > 1 else 0
            prob_at_risk = float(proba[at_risk_idx])
            ml_score = _probability_to_risk(prob_at_risk)

            # Blend: 40% ML + 60% heuristic
            blended = round(_clamp(ml_score * 0.40 + heuristic_score * 0.60), 1)

            logger.info(
                "Acoustic risk: ML=%.1f (label=%s, prob=%.3f) | "
                "Heuristic=%.1f | Blended=%.1f",
                ml_score, label, prob_at_risk, heuristic_score, blended,
            )
            return blended

        except Exception as exc:
            logger.warning(
                "ML inference failed – using heuristic only: %s", exc
            )

    # ── Heuristic fallback ────────────────────────────────────────────
    logger.info("Acoustic risk (heuristic only): %.1f", heuristic_score)
    return heuristic_score


def _heuristic_acoustic_risk(features: dict, baseline: dict) -> float:
    """
    Original weighted heuristic scoring (used as fallback).

    Returns 0-100 where higher = higher risk.
    """
    jitter_score = _sigmoid_risk(features.get("jitter_percent", 1.5), center=2.0, steepness=3.0)
    shimmer_score = _sigmoid_risk(features.get("shimmer_percent", 4.0), center=5.0, steepness=2.0)
    stability_risk = (1.0 - features.get("pitch_stability", 0.8)) * 100
    hnr_risk = max(0, 100 - features.get("harmonics_to_noise", 20) * 4)
    baseline_risk = baseline.get("deviation_score", 25)

    risk = (
        jitter_score * 0.20
        + shimmer_score * 0.15
        + stability_risk * 0.20
        + hnr_risk * 0.15
        + baseline_risk * 0.30
    )
    logger.info("Acoustic risk (heuristic fallback): %.1f", risk)
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
