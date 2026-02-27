/**
 * API client for Cognitive Echo Sentinel backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AcousticFeatures {
    mfcc_mean: number[];
    mfcc_std: number[];
    jitter_percent: number;
    shimmer_percent: number;
    mean_pitch_hz: number;
    pitch_std_hz: number;
    pitch_stability: number;
    pause_ratio: number;
    speech_rate: number;
    harmonics_to_noise: number;
}

export interface BaselineComparison {
    deviation_score: number;
    mfcc_drift: number;
    pitch_deviation: number;
    rhythm_deviation: number;
    status: "normal" | "mild_drift" | "significant_drift" | "critical_drift";
}

export interface LexicalAnalysis {
    coherence_score: number;
    vocabulary_richness: number;
    repetition_index: number;
    summary: string;
}

export interface RiskScores {
    acoustic_risk_score: number;
    cognitive_risk_score?: number | null;
    neuro_risk_level: "Low" | "Medium" | "High";
    confidence?: number | null;
}

export interface AnalysisResponse {
    session_id: string;
    duration_seconds: number;
    acoustic_features: AcousticFeatures;
    baseline_comparison: BaselineComparison;
    lexical_analysis?: LexicalAnalysis | null;
    risk_scores: RiskScores;
    explanation: string;
    recommendations: string[];
    // Reliability fields added by medical-grade-failure-handling
    cognitive_available?: boolean;
    lexical_status?: string;
    lexical_error_message?: string | null;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function analyzeAudio(audioBlob: Blob): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    console.log("POST →", `${API_BASE}/api/analyze`);

    const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis failed (${response.status}): ${errorText}`);
    }

    return response.json();
}

export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
