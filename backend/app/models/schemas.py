"""
Pydantic models for Cognitive Echo Sentinel API.
"""

from pydantic import BaseModel, Field
from typing import Any, Optional


class AcousticFeatures(BaseModel):
    """Raw acoustic feature values extracted from voice sample."""

    mfcc_mean: list[float] = Field(description="Mean MFCC coefficients (13 values)")
    mfcc_std: list[float] = Field(description="Std deviation of MFCC coefficients")
    jitter_percent: float = Field(description="Jitter (%) – cycle-to-cycle pitch variation")
    shimmer_percent: float = Field(description="Shimmer (%) – cycle-to-cycle amplitude variation")
    mean_pitch_hz: float = Field(description="Mean fundamental frequency in Hz")
    pitch_std_hz: float = Field(description="Pitch standard deviation in Hz")
    pitch_stability: float = Field(description="Pitch stability score (0-1, 1 = very stable)")
    pause_ratio: float = Field(description="Ratio of silence to total duration")
    speech_rate: float = Field(description="Estimated syllables per second")
    harmonics_to_noise: float = Field(description="Harmonics-to-noise ratio (dB)")


class BaselineComparison(BaseModel):
    """Vocal Twin baseline comparison results."""

    deviation_score: float = Field(description="Overall deviation from baseline (0-100)")
    mfcc_drift: float = Field(description="MFCC vector drift from baseline")
    pitch_deviation: float = Field(description="Pitch deviation from baseline (%)")
    rhythm_deviation: float = Field(description="Rhythm/timing deviation (%)")
    status: str = Field(description="normal | mild_drift | significant_drift | critical_drift")


class LexicalAnalysis(BaseModel):
    """Placeholder LLM-based lexical analysis."""

    coherence_score: float = Field(description="Semantic coherence (0-100)")
    vocabulary_richness: float = Field(description="Lexical diversity score (0-100)")
    repetition_index: float = Field(description="Repetition frequency (0-100, lower = less repetition)")
    summary: str = Field(description="Brief AI-generated narrative")


class LexicalMetrics(BaseModel):
    """Featherless AI cognitive-linguistic analysis metrics."""

    vocabulary_richness: float = Field(description="Lexical diversity (0-1)")
    sentence_coherence: float = Field(description="Semantic coherence (0-1)")
    word_finding_difficulty: float = Field(description="Word retrieval difficulty (0-1)")
    repetition_tendency: float = Field(description="Repetition frequency (0-1)")
    cognitive_concern: str = Field(description="Low | Medium | High")


class RiskScores(BaseModel):
    """Computed risk indicators."""

    acoustic_risk_score: float = Field(description="Acoustic risk (0-100)")
    cognitive_risk_score: Optional[float] = Field(default=None, description="Cognitive risk (0-100), None if unavailable")
    neuro_risk_level: str = Field(description="Low | Medium | High")
    confidence: float = Field(description="Model confidence (0-1)")
    cognitive_available: bool = Field(default=True, description="Whether cognitive scoring was available")


class AnalysisResponse(BaseModel):
    """Full response returned by POST /api/analyze."""

    session_id: str
    duration_seconds: float
    acoustic_features: AcousticFeatures
    baseline_comparison: BaselineComparison
    lexical_analysis: Optional[LexicalAnalysis] = Field(default=None, description="Lexical analysis results")
    lexical_metrics: Optional[LexicalMetrics] = Field(default=None, description="Featherless AI lexical analysis (None if unavailable)")
    risk_scores: RiskScores
    cognitive_available: bool = Field(default=True, description="Whether cognitive/lexical analysis was completed")
    lexical_status: str = Field(default="success", description="success | unavailable")
    lexical_error_message: Optional[str] = Field(default=None, description="Error details if lexical analysis failed")
    cognitive_concern: Optional[str] = Field(default=None, description="LLM cognitive concern level")
    explanation: str = Field(description="Human-readable AI summary of findings")
    recommendations: list[str] = Field(description="Actionable follow-up suggestions")
