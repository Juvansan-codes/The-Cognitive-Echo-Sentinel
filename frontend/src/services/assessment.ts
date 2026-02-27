import { analyzeAudio, AnalysisResponse } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export * from "@/lib/api";

export interface AssessmentHistoryItem {
    id: string;
    date: string;
    durationSeconds: number;
    riskScore: number;
    riskLevel: "Low" | "Medium" | "High";
    status: string;
    cognitive_score: number | null;
    cognitive_available: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toRiskLevel(level: string): "Low" | "Medium" | "High" {
    const l = level.toLowerCase();
    if (l.includes("high")) return "High";
    if (l.includes("medium") || l.includes("moderate")) return "Medium";
    return "Low";
}

// ─── Submit Audio — calls FastAPI, then saves to Supabase non-blockingly ───

export async function submitAudioSimulation(
    blob: Blob | File,
    mode: "guided" | "free_speech"
): Promise<AnalysisResponse> {
    // 1. Call the real FastAPI backend
    const result = await analyzeAudio(blob, mode);

    // 2. Fire-and-forget: persist to Supabase (never blocks or crashes the UI)
    void (async () => {
        try {
            const { error } = await supabase.from("assessments").insert({
                session_id: result.session_id,
                duration_seconds: result.duration_seconds,
                acoustic_score: result.risk_scores.acoustic_risk_score,
                cognitive_score: result.risk_scores.cognitive_risk_score ?? null,
                neuro_risk_level: result.risk_scores.neuro_risk_level,
                acoustic_confidence: result.risk_scores.confidence ?? null,
                cognitive_available: result.cognitive_available ?? true,
                transcript: result.lexical_analysis?.summary ?? null,
                recorded_at: new Date().toISOString(),
            });

            if (error) {
                console.warn("[Supabase] Insert failed:", error.message);
            }
        } catch (err) {
            console.warn("[Supabase] Could not persist assessment:", err);
        }
    })();

    return result;
}

// ─── Fetch History from Supabase ─────────────────────────────────────────────

export async function getAssessmentHistory(): Promise<AssessmentHistoryItem[]> {
    try {
        const { data, error } = await supabase
            .from("assessments")
            .select("id, recorded_at, duration_seconds, acoustic_score, cognitive_score, neuro_risk_level, cognitive_available")
            .order("recorded_at", { ascending: false })
            .limit(10);

        if (error) {
            console.warn("[Supabase] Could not fetch history:", error.message);
            return [];
        }

        return (data ?? []).map((row) => ({
            id: String(row.id),
            date: row.recorded_at,
            durationSeconds: row.duration_seconds ?? 0,
            riskScore: row.acoustic_score ?? 0,
            riskLevel: toRiskLevel(row.neuro_risk_level ?? "low"),
            status: "Completed",
            cognitive_score: row.cognitive_score ?? null,
            cognitive_available: row.cognitive_available ?? false,
        }));
    } catch (err) {
        console.warn("[Supabase] Unexpected error loading history:", err);
        return [];
    }
}

