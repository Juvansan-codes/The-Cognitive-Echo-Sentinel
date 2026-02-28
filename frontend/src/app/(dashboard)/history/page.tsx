"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dashboard } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, Brain, CheckCircle2, ChevronDown, ChevronUp, Clock, FileText, Search, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

type RiskLevel = "Low" | "Medium" | "High";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RiskLevel | "All">("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const { data, error } = await supabase
                    .from("assessments")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("[Supabase] Error loading history:", error);
                } else {
                    setHistory(data || []);
                }
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        filter === "All" || item.neuro_risk_level === filter
    );

    const getRiskStyles = (risk: string) => {
        if (risk === "High") return { color: "text-red-700", bg: "bg-red-50", icon: <AlertTriangle className="w-5 h-5 text-red-600" />, label: "High Deviation" };
        if (risk === "Medium" || risk === "Moderate") return { color: "text-amber-700", bg: "bg-amber-50", icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, label: "Mild Deviation" };
        return { color: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, label: "Low Risk" };
    };

    return (
        <div className="max-w-5xl w-full mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    Assessment History
                </h1>
                <p className="text-muted-foreground">View your past clinical cognitive assessments and biomarker trends over time.</p>
            </div>

            <div className="flex border-b border-border/60 mb-6 gap-2 pb-2">
                {["All", "Low", "Medium", "High"].map(level => (
                    <Button
                        key={level}
                        variant={filter === level ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(level as any)}
                        className="rounded-full px-4"
                    >
                        {level === "All" ? "All Records" : `${level} Risk`}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No assessments found</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        {filter === "All" ? "You haven't taken any assessments yet." : `No records match the '${filter}' risk filter.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map((record) => {
                        const styles = getRiskStyles(record.neuro_risk_level);
                        const isExpanded = expandedId === record.id;

                        return (
                            <Card key={record.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="p-0">
                                    <div
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 cursor-pointer bg-white"
                                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                                    >
                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                            <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-foreground">
                                                    {format(parseISO(record.created_at), "MMM d, yyyy")}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex gap-1 items-center">
                                                    {format(parseISO(record.created_at), "h:mm a")}
                                                    <span className="mx-1">•</span>
                                                    Score: {record.final_risk_score?.toFixed(1) || record.acoustic_risk_score?.toFixed(1) || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                            <div className="flex flex-col items-start sm:items-end w-1/2 sm:w-auto">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase mb-1">Acoustic</span>
                                                <span className="text-sm">Pitch <span className="font-semibold">{record.pitch_hz?.toFixed(1)}Hz</span></span>
                                                <span className="text-sm text-muted-foreground">Jitter <span className="text-foreground">{record.jitter_percent?.toFixed(2)}%</span></span>
                                            </div>

                                            <div className="flex flex-col items-start sm:items-end w-1/2 sm:w-auto">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase mb-1">Lexical</span>
                                                <span className="text-sm">Coherence <span className="font-semibold">{record.sentence_coherence?.toFixed(2) || "N/A"}</span></span>
                                                <span className="text-sm text-muted-foreground">Concern <span className="text-foreground">{record.cognitive_concern || "Unknown"}</span></span>
                                            </div>

                                            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 border w-full sm:w-auto justify-center sm:justify-start ${styles.bg} ${styles.color} border-current/20 ml-auto`}>
                                                {styles.icon}
                                                <span className="font-bold text-sm">{styles.label}</span>
                                            </div>

                                            <div className="hidden sm:block">
                                                {isExpanded ? <ChevronUp className="text-muted-foreground w-5 h-5" /> : <ChevronDown className="text-muted-foreground w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="border-t bg-muted/20 p-6 animate-in slide-in-from-top-2">
                                        {/* Reconstructing data obj to feed into the Dashboard safely */}
                                        <Dashboard data={{
                                            session_id: record.id,
                                            duration_seconds: 0,
                                            acoustic_features: {
                                                mean_pitch_hz: record.pitch_hz,
                                                jitter_percent: record.jitter_percent,
                                                shimmer_percent: record.shimmer_percent,
                                                pitch_stability: record.pitch_stability,
                                                pause_ratio: record.pause_ratio,
                                                harmonics_to_noise: record.harmonics_to_noise,
                                                mfcc_mean: [],
                                                mfcc_std: [],
                                                pitch_std_hz: 0,
                                                speech_rate: 0
                                            },
                                            baseline_comparison: {
                                                deviation_score: 0,
                                                mfcc_drift: 0,
                                                pitch_deviation: 0,
                                                rhythm_deviation: 0,
                                                status: "normal"
                                            },
                                            lexical_metrics: record.cognitive_available ? {
                                                vocabulary_richness: record.vocabulary_richness,
                                                sentence_coherence: record.sentence_coherence,
                                                word_finding_difficulty: record.word_finding_difficulty,
                                                repetition_tendency: record.repetition_tendency,
                                                cognitive_concern: record.cognitive_concern
                                            } : null,
                                            lexical_analysis: record.cognitive_available ? {
                                                summary: record.transcript || `Historical extraction. Diagnostic report saved on ${format(parseISO(record.created_at), "MMM d, yyyy")}.`,
                                                coherence_score: record.sentence_coherence,
                                                vocabulary_richness: record.vocabulary_richness,
                                                repetition_index: record.repetition_tendency
                                            } : null,
                                            risk_scores: {
                                                acoustic_risk_score: record.acoustic_risk_score,
                                                cognitive_risk_score: record.lexical_risk_score,
                                                neuro_risk_level: record.neuro_risk_level,
                                                confidence: 0.95
                                            },
                                            explanation: record.explanation || "Historical automated extraction.",
                                            recommendations: ["Review history with a clinical professional."],
                                            cognitive_available: record.cognitive_available
                                        }} />
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
