"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResponse } from "@/lib/api";
import {
    Activity,
    Brain,
    AlertTriangle,
    CheckCircle2,
    Info,
} from "lucide-react";

interface DashboardProps {
    data: AnalysisResponse;
}

// Minimal Circular Gauge component
function CircularGauge({ score, status }: { score: number; status: string }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    let color = "#12B76A"; // Stable green
    if (status === "Medium") color = "#F79009"; // Amber
    if (status === "High") color = "#D92D20"; // Red

    return (
        <div className="relative flex items-center justify-center">
            <svg width="100" height="100" className="transform -rotate-90">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-secondary"
                    strokeWidth="8"
                    fill="transparent"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-in-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tight text-foreground">{score.toFixed(0)}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Index</span>
            </div>
        </div>
    );
}

function MetricRow({ label, value, unit, limit, invertValue = false, description }: { label: string, value: number, unit: string, limit: number, invertValue?: boolean, description?: string }) {
    // Determine progress percentage
    const progress = Math.min((value / limit) * 100, 100);
    // Simple clinical coloring based on inversion
    const isWarning = invertValue ? (progress < 40) : (progress > 60);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-end text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span>{label}</span>
                    <div className="group relative hidden sm:flex">
                        <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                        <div className="invisible group-hover:visible absolute left-5 top-0 w-48 p-2 bg-foreground text-background text-xs rounded-md z-10 font-normal shadow-lg">
                            {description || "Assessed clinical parameter tracking variation against healthy baselines."}
                        </div>
                    </div>
                </div>
                <div className="font-semibold text-foreground">
                    {value.toFixed(1)}<span className="text-muted-foreground font-medium text-xs ml-0.5">{unit}</span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: isWarning ? "#F79009" : "#2E5BFF"
                    }}
                />
            </div>
        </div>
    );
}

export function Dashboard({ data }: DashboardProps) {
    const { risk_scores, acoustic_features, lexical_analysis, lexical_metrics, cognitive_available } = data;

    // Map the neuro risk to specific text requested by user
    let riskStateText = "Within Baseline Range";
    let riskColorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    let Icon = CheckCircle2;
    let iconColor = "text-emerald-600";

    if (risk_scores.neuro_risk_level === "Medium") {
        riskStateText = "Mild Deviation";
        riskColorClass = "text-amber-700 bg-amber-50 border-amber-200";
        Icon = AlertTriangle;
        iconColor = "text-amber-600";
    } else if (risk_scores.neuro_risk_level === "High") {
        riskStateText = "Significant Deviation";
        riskColorClass = "text-red-700 bg-red-50 border-red-200";
        Icon = AlertTriangle;
        iconColor = "text-red-600";
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Card 1: Acoustic Biomarker Analysis */}
            <Card className="shadow-sm border-border">
                <CardHeader className="pb-4 border-b border-border bg-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-primary/10">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <CardTitle className="text-base font-semibold text-foreground">Acoustic Biomarker Analysis</CardTitle>
                        </div>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Confidence: {((risk_scores.confidence ?? 0) * 100).toFixed(0)}%</span>
                    </div>
                </CardHeader>
                <CardContent className="p-6 bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <MetricRow label="Pause Time Deviation" value={acoustic_features.pause_ratio * 100} unit="ms" limit={50} description="Measures unexpected silences or hesitations during speech, often linked to cognitive load or motor hesitation." />
                        <MetricRow label="Pitch Stability" value={acoustic_features.pitch_stability * 100} unit="%" limit={100} invertValue={true} description="Evaluates how consistent vocal cord vibration is. Lower stability can indicate loss of fine motor control." />
                        <MetricRow label="Jitter" value={acoustic_features.jitter_percent} unit="%" limit={15} description="Cycle-to-cycle variation in fundamental frequency. High jitter often indicates vocal tremor or mild neuromuscular dysfunction." />
                        <MetricRow label="Shimmer" value={acoustic_features.shimmer_percent} unit="%" limit={15} description="Cycle-to-cycle variation in voice amplitude (loudness). Elevated shimmer is an early sign of glottal instability." />
                        <MetricRow label="Harmonics-to-Noise Ratio" value={acoustic_features.harmonics_to_noise} unit="dB" limit={30} invertValue={true} description="The ratio of acoustic energy in the voice to background acoustic noise. Lower values suggest vocal breathiness or hoarseness." />
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Cognitive-Lexical Assessment */}
            <Card className="shadow-sm border-border">
                <CardHeader className="pb-4 border-b border-border bg-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-primary/10">
                            <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">Cognitive-Lexical Assessment</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 bg-card flex flex-col md:flex-row gap-8 items-center">
                    {cognitive_available && (lexical_analysis || lexical_metrics) ? (
                        <>
                            <div className="flex-1 space-y-6 w-full">
                                <MetricRow label="Lexical Density" value={lexical_metrics?.vocabulary_richness ?? 0} unit="%" limit={100} invertValue={true} description="The proportion of unique content words. A declining vocabulary richness over time may indicate early cognitive impairment." />
                                <MetricRow label="Repetition Frequency" value={lexical_metrics?.repetition_tendency ?? 0} unit="%" limit={25} description="Frequency of repeating the exact same words or phrases. Increased repetition often correlates with working memory deficits." />
                                <MetricRow label="Sentence Coherence Score" value={lexical_metrics?.sentence_coherence ?? 0} unit="/100" limit={100} invertValue={true} description="Measures logical flow and grammatical completeness. Sudden drops in coherence can be an early neural biomarker." />
                            </div>
                            <div className="bg-white border text-sm border-border rounded-lg p-5 flex-1 w-full text-foreground/80 leading-relaxed">
                                <span className="font-semibold text-foreground block mb-2">Automated Analysis Summary</span>
                                {lexical_analysis?.summary ?? `Cognitive concern level: ${lexical_metrics?.cognitive_concern ?? "Unknown"}. Word finding difficulty: ${((lexical_metrics?.word_finding_difficulty ?? 0) * 100).toFixed(0)}%.`}
                                <br /><br />
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Lexical Pattern Observation Completed</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 py-6 text-center text-muted-foreground text-sm">
                            <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Lexical Analysis Unavailable</p>
                            <p className="text-xs mt-1">The AI language service could not be reached. Acoustic scoring is still active.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card 3: Neuro Risk Indicator */}
            <Card className="shadow-sm border-border">
                <CardHeader className="pb-4 border-b border-border bg-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-primary/10">
                            <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">Neuro Risk Indicator</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 bg-card">
                    <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="flex items-center gap-6">
                            <CircularGauge score={risk_scores.cognitive_risk_score ?? risk_scores.acoustic_risk_score} status={risk_scores.neuro_risk_level} />
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">Early Biomarker Deviation Index</h4>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-semibold text-sm ${riskColorClass}`}>
                                    <Icon className={`w-4 h-4 ${iconColor}`} />
                                    {riskStateText}
                                </div>
                            </div>
                        </div>
                        <div className="max-w-xs text-right">
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                {data.explanation}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-3 uppercase tracking-wide">
                                This system is a monitoring tool and not a diagnostic device.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

