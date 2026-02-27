import { mockApiCall } from "./api";
import { AnalysisResponse } from "@/lib/api";

// We'll export the types from the new service so we can eventually remove lib/api.ts
export * from "@/lib/api";

export interface AssessmentHistoryItem {
    id: string;
    date: string;
    durationSeconds: number;
    riskScore: number;
    riskLevel: "Low" | "Medium" | "High";
    status: string;
}

export async function submitAudioSimulation(blob: Blob | File): Promise<AnalysisResponse> {
    // Generating mock realistic clinical data
    const mockData: AnalysisResponse = {
        session_id: "SESSION-" + Math.floor(Math.random() * 1000000),
        duration_seconds: 42.5,
        acoustic_features: {
            mfcc_mean: [0.1, 0.2, 0.3],
            mfcc_std: [0.05, 0.05, 0.05],
            jitter_percent: 1.2 + Math.random() * 0.5,
            shimmer_percent: 4.5 + Math.random() * 1.5,
            mean_pitch_hz: 185.4,
            pitch_std_hz: 12.2,
            pitch_stability: 0.88,
            pause_ratio: 0.28,
            speech_rate: 145.2,
            harmonics_to_noise: 24.5,
        },
        baseline_comparison: {
            deviation_score: 4.2,
            mfcc_drift: 2.1,
            pitch_deviation: 3.5,
            rhythm_deviation: 5.1,
            status: "normal",
        },
        lexical_analysis: {
            coherence_score: 92.5,
            vocabulary_richness: 88.0,
            repetition_index: 8.5,
            summary: "Lexical density and structural coherence remain tightly clustered within established healthy baselines. No significant semantic degradation or repetitive looping detected in current sample.",
        },
        risk_scores: {
            acoustic_risk_score: 12.5,
            cognitive_risk_score: 8.2,
            neuro_risk_level: "Low",
            confidence: 0.94,
        },
        explanation: "Analysis indicates highly stable acoustic micro-rhythms and phonetic formulation consistent with the patient's vocal twin baseline. Pause-time distributions are firmly within normal ranges.",
        recommendations: [
            "Continue standard quarterly monitoring schedule.",
            "No immediate intervention required."
        ]
    };

    // Simulate longer realistic processing (3 seconds)
    return await mockApiCall(mockData, 3000);
}

export async function getAssessmentHistory(): Promise<AssessmentHistoryItem[]> {
    const mockHistory: AssessmentHistoryItem[] = [
        { id: "A-1029", date: "2026-02-15T09:30:00Z", durationSeconds: 45, riskScore: 12.5, riskLevel: "Low", status: "Completed" },
        { id: "A-1014", date: "2026-01-14T10:15:00Z", durationSeconds: 38, riskScore: 14.2, riskLevel: "Low", status: "Completed" },
        { id: "A-0982", date: "2025-12-10T14:20:00Z", durationSeconds: 52, riskScore: 18.5, riskLevel: "Low", status: "Completed" },
        { id: "A-0941", date: "2025-11-05T08:45:00Z", durationSeconds: 41, riskScore: 22.1, riskLevel: "Medium", status: "Completed" },
        { id: "A-0899", date: "2025-10-01T11:10:00Z", durationSeconds: 30, riskScore: 15.4, riskLevel: "Low", status: "Completed" },
    ];

    return await mockApiCall(mockHistory, 800);
}
