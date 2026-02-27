"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AnalysisResponse } from "@/lib/api";
import {
    Activity,
    Brain,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Info,
    Clock,
    AudioLines,
    Waves,
    Fingerprint,
    Lightbulb,
} from "lucide-react";

interface DashboardProps {
    data: AnalysisResponse;
}

function getRiskColor(level: string) {
    switch (level) {
        case "Low":
            return {
                badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                progress: "bg-emerald-500",
                glow: "shadow-emerald-500/20",
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            };
        case "Medium":
            return {
                badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                progress: "bg-amber-500",
                glow: "shadow-amber-500/20",
                icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            };
        case "High":
            return {
                badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
                progress: "bg-rose-500",
                glow: "shadow-rose-500/20",
                icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
            };
        default:
            return {
                badge: "bg-muted text-muted-foreground border-border",
                progress: "bg-muted-foreground",
                glow: "",
                icon: <Info className="w-5 h-5" />,
            };
    }
}

function ScoreCard({
    title,
    description,
    score,
    icon,
    colorClass,
    children,
}: {
    title: string;
    description: string;
    score: number;
    icon: React.ReactNode;
    colorClass: string;
    children?: React.ReactNode;
}) {
    return (
        <Card className="glass-card border-border/30 hover:border-border/50 transition-all duration-300 hover:-translate-y-0.5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <CardDescription className="text-xs">{description}</CardDescription>
                        </div>
                    </div>
                    <span className="text-3xl font-bold tabular-nums">
                        {score.toFixed(1)}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <div className="relative">
                        <Progress value={score} className="h-2" />
                    </div>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}

export function Dashboard({ data }: DashboardProps) {
    const { risk_scores, acoustic_features, baseline_comparison, lexical_analysis } =
        data;
    const riskStyle = getRiskColor(risk_scores.neuro_risk_level);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Assessment Results</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{data.duration_seconds.toFixed(1)}s sample</span>
                </div>
            </div>

            {/* ── Top-level Neuro Risk Indicator ────────────────────────────── */}
            <Card
                className={`glass-card border-border/30 shadow-lg ${riskStyle.glow}`}
                id="neuro-risk-card"
            >
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-card border border-border/30">
                                {riskStyle.icon}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Final Neuro Risk Indicator
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge
                                        variant="outline"
                                        className={`text-base px-4 py-1 font-semibold ${riskStyle.badge}`}
                                    >
                                        {risk_scores.neuro_risk_level}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Confidence: {(risk_scores.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-5xl font-bold tabular-nums text-foreground">
                            {risk_scores.cognitive_risk_score.toFixed(1)}
                            <span className="text-lg text-muted-foreground font-normal">/100</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Score Cards Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreCard
                    title="Acoustic Risk Score"
                    description="Voice quality biomarkers"
                    score={risk_scores.acoustic_risk_score}
                    icon={<AudioLines className="w-5 h-5 text-cyan-400" />}
                    colorClass="bg-cyan-500/10"
                >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Jitter</span>
                            <span className="text-foreground font-medium">
                                {acoustic_features.jitter_percent.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shimmer</span>
                            <span className="text-foreground font-medium">
                                {acoustic_features.shimmer_percent.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pitch</span>
                            <span className="text-foreground font-medium">
                                {acoustic_features.mean_pitch_hz.toFixed(0)} Hz
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>HNR</span>
                            <span className="text-foreground font-medium">
                                {acoustic_features.harmonics_to_noise.toFixed(1)} dB
                            </span>
                        </div>
                    </div>
                </ScoreCard>

                <ScoreCard
                    title="Cognitive Risk Score"
                    description="Combined neuro indicators"
                    score={risk_scores.cognitive_risk_score}
                    icon={<Brain className="w-5 h-5 text-violet-400" />}
                    colorClass="bg-violet-500/10"
                >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Coherence</span>
                            <span className="text-foreground font-medium">
                                {lexical_analysis.coherence_score.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Vocabulary</span>
                            <span className="text-foreground font-medium">
                                {lexical_analysis.vocabulary_richness.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Repetition</span>
                            <span className="text-foreground font-medium">
                                {lexical_analysis.repetition_index.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Stability</span>
                            <span className="text-foreground font-medium">
                                {(acoustic_features.pitch_stability * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </ScoreCard>
            </div>

            {/* ── Baseline Comparison ──────────────────────────────────────── */}
            <Card className="glass-card border-border/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Fingerprint className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Vocal Twin Baseline</CardTitle>
                            <CardDescription className="text-xs">
                                Deviation from stored voice profile
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: "Overall Drift",
                                value: baseline_comparison.deviation_score,
                                unit: "%",
                            },
                            {
                                label: "MFCC Drift",
                                value: baseline_comparison.mfcc_drift,
                                unit: "%",
                            },
                            {
                                label: "Pitch Δ",
                                value: baseline_comparison.pitch_deviation,
                                unit: "%",
                            },
                            {
                                label: "Rhythm Δ",
                                value: baseline_comparison.rhythm_deviation,
                                unit: "%",
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="text-center p-3 rounded-xl bg-card/50 border border-border/20"
                            >
                                <div className="text-2xl font-bold tabular-nums">
                                    {item.value.toFixed(1)}
                                    <span className="text-sm text-muted-foreground font-normal">
                                        {item.unit}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3">
                        <Badge
                            variant="outline"
                            className={`text-xs ${baseline_comparison.status === "normal"
                                    ? "border-emerald-500/30 text-emerald-400"
                                    : baseline_comparison.status === "mild_drift"
                                        ? "border-amber-500/30 text-amber-400"
                                        : "border-rose-500/30 text-rose-400"
                                }`}
                        >
                            Status: {baseline_comparison.status.replace(/_/g, " ")}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* ── AI Explanation ────────────────────────────────────────────── */}
            <Card className="glass-card border-border/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                        </div>
                        <CardTitle className="text-base">AI Analysis Summary</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {data.explanation}
                    </p>

                    {data.recommendations.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                                Recommendations
                            </p>
                            <ul className="space-y-2">
                                {data.recommendations.map((rec, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Lexical Analysis ─────────────────────────────────────────── */}
            <Alert className="glass-card border-border/30">
                <Info className="h-4 w-4 text-cyan-400" />
                <AlertDescription className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Lexical Analysis:</strong>{" "}
                    {lexical_analysis.summary}
                </AlertDescription>
            </Alert>

            {/* Session ID */}
            <p className="text-center text-xs text-muted-foreground/50">
                Session: {data.session_id}
            </p>
        </div>
    );
}
