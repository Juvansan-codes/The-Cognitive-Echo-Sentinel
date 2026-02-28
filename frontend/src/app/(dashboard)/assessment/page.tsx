"use client";

import { useState } from "react";
import { AudioRecorder, type RecordingState } from "@/components/audio-recorder";
import { Dashboard } from "@/components/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { analyzeAudio } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { AnalysisResponse } from "@/lib/api";
import { AlertTriangle, CheckCircle2, ChevronRight, FileText, ImageIcon, Mic, RefreshCw, Loader2 } from "lucide-react";

type AssessmentStep = 0 | 1 | 2 | 3;

interface AssessmentResults {
    test1: AnalysisResponse | null;
    test2: AnalysisResponse | null;
}

export default function AssessmentPage() {
    const [step, setStep] = useState<AssessmentStep>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [recordingState, setRecordingState] = useState<RecordingState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<AssessmentResults>({ test1: null, test2: null });

    const handleRecordingComplete = async (blob: Blob, mode: "guided" | "free_speech") => {
        setError(null);
        try {
            const data = await analyzeAudio(blob, mode);
            setResults(prev => ({
                ...prev,
                [mode === "guided" ? "test1" : "test2"]: data
            }));
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err instanceof Error ? err.message : "System error processing sample.");
        } finally {
            setRecordingState("idle");
        }
    };

    const handleGenerateReport = async () => {
        setIsSaving(true);
        try {
            const { error: dbError } = await supabase.from('assessments').insert({
                pitch_hz: results.test1?.acoustic_features.mean_pitch_hz,
                jitter_percent: results.test1?.acoustic_features.jitter_percent,
                shimmer_percent: results.test1?.acoustic_features.shimmer_percent,
                pitch_stability: results.test1?.acoustic_features.pitch_stability,
                pause_ratio: results.test1?.acoustic_features.pause_ratio,
                harmonics_to_noise: results.test1?.acoustic_features.harmonics_to_noise,
                acoustic_risk_score: results.test1?.risk_scores.acoustic_risk_score,
                vocabulary_richness: results.test2?.lexical_metrics?.vocabulary_richness,
                sentence_coherence: results.test2?.lexical_metrics?.sentence_coherence,
                word_finding_difficulty: results.test2?.lexical_metrics?.word_finding_difficulty,
                repetition_tendency: results.test2?.lexical_metrics?.repetition_tendency,
                cognitive_concern: results.test2?.lexical_metrics?.cognitive_concern,
                neuro_risk_level: results.test2?.risk_scores.neuro_risk_level,
                final_risk_score: results.test2?.risk_scores.cognitive_risk_score ?? results.test2?.risk_scores.acoustic_risk_score,
                explanation: results.test2?.explanation,
                cognitive_available: results.test2?.cognitive_available
            });

            if (dbError) {
                console.warn("[Supabase] Failed to securely persist history:", dbError.message);
            }
        } catch (err) {
            console.warn("Report storage failed", err);
        } finally {
            setIsSaving(false);
            setStep(3); // Proceed to Dashboard un-blocked
        }
    };

    const resetAssessment = () => {
        setStep(0);
        setResults({ test1: null, test2: null });
        setError(null);
    };

    return (
        <div className="max-w-5xl w-full mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Global Error Banner */}
            {error && (
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 text-red-800 shadow-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
            )}

            {/* Progress Bar (Hidden on Landing & Results) */}
            {step > 0 && step < 3 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 px-1">
                        <span>Step {step} of 2</span>
                        <span>{step === 1 ? "Acoustic Baseline" : "Lexical Assessment"}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* STEP 0: Landing Page */}
            {step === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary/10 rounded-2xl mb-2 sm:mb-4 relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-colors duration-500"></div>
                            <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-primary relative z-10" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                            Cognitive Echo Sentinel
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            This assessment consists of two short diagnostic tests to extract acoustic and lexical biomarkers. Each phase takes less than a minute.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl text-left">
                        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex items-start gap-4">
                            <div className="bg-emerald-100 p-2 rounded-full mt-1">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-1">Test 1: Guided Speech</h3>
                                <p className="text-sm text-muted-foreground">Read a standardized phonetic passage to baseline your vocal acoustics and motor stability.</p>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex items-start gap-4">
                            <div className="bg-emerald-100 p-2 rounded-full mt-1">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-1">Test 2: Free Speech</h3>
                                <p className="text-sm text-muted-foreground">Describe a clinical image to assess spontaneous lexical richness and sentence coherence.</p>
                            </div>
                        </div>
                    </div>

                    <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all" onClick={() => setStep(1)}>
                        Start Clinical Assessment <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            )}

            {/* STEP 1: Guided Reading */}
            {step === 1 && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 md:p-10 mx-auto max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <Mic className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Test 1 — Read Aloud</h2>
                    </div>

                    <div className="bg-muted/50 border border-border rounded-xl p-8 mb-6 text-center shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <p className="text-2xl md:text-3xl font-medium tracking-tight text-foreground leading-relaxed relative z-10 font-serif italic text-primary/90">
                            "The quick brown fox jumps over the lazy dog."
                        </p>
                    </div>

                    <p className="text-center text-muted-foreground mb-8 text-sm md:text-base font-medium">
                        Please read the passage above clearly and at a natural conversational pace.
                    </p>

                    <div className="flex flex-col items-center gap-6">
                        <AudioRecorder
                            state={recordingState}
                            onStateChange={setRecordingState}
                            onRecordingComplete={(blob) => handleRecordingComplete(blob, "guided")}
                        />

                        {/* Show Next button only after successful analysis */}
                        {results.test1 && recordingState === "idle" && (
                            <Button size="lg" className="w-full md:w-auto h-12 px-8 rounded-full animate-in fade-in zoom-in-95" onClick={() => setStep(2)}>
                                Continue to Test 2 <ChevronRight className="ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 2: Picture Description */}
            {step === 2 && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 md:p-10 mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Test 2 — Describe the Picture</h2>
                    </div>

                    <div className="bg-black/5 rounded-xl border border-border p-2 mb-6 shadow-inner mx-auto max-w-2xl flex justify-center overflow-hidden">
                        {/* Using standard Cookie Theft clinical assessment img placeholder */}
                        <img
                            src="https://www.alz.washington.edu/NONMEM/images/cookie.jpg"
                            alt="Cookie Theft Assessment Diagnostic"
                            className="rounded-lg object-contain max-h-[350px] mix-blend-multiply opacity-90 sepia-[.2] contrast-125"
                            onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1556910103-1c02745a8e31?q=80&w=2670&auto=format&fit=crop"; // Fallback kitchen scene
                            }}
                        />
                    </div>

                    <p className="text-center text-muted-foreground mb-8 text-sm md:text-base font-medium max-w-2xl mx-auto">
                        Please describe everything you see happening in this picture in as much detail as possible. Speak naturally and freely until you are finished.
                    </p>

                    <div className="flex flex-col items-center gap-6">
                        <AudioRecorder
                            state={recordingState}
                            onStateChange={setRecordingState}
                            onRecordingComplete={(blob) => handleRecordingComplete(blob, "free_speech")}
                        />

                        {/* Show Analyze button only after successful analysis */}
                        {results.test2 && recordingState === "idle" && (
                            <Button size="lg" disabled={isSaving} className="w-full md:w-auto h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 animate-in fade-in zoom-in-95 shadow-lg shadow-emerald-600/20" onClick={handleGenerateReport}>
                                {isSaving ? (
                                    <>Saving Report... <Loader2 className="ml-2 w-4 h-4 animate-spin" /></>
                                ) : (
                                    <>Generate Clinical Report <FileText className="ml-2 w-4 h-4" /></>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 3: Aggregate Results Dashboard */}
            {step === 3 && results.test1 && results.test2 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">Diagnostic Report</h2>
                            <p className="text-muted-foreground mt-1 text-sm md:text-base">Synthesized from Guided Acoustic and Spontaneous Lexical phases.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetAssessment} className="rounded-full shadow-sm">
                            <RefreshCw className="mr-2 w-4 h-4" /> Retake Assessment
                        </Button>
                    </div>

                    {/* Merged Dashboard View */}
                    <div className="mb-12">
                        {/* We inject the Lexical data from Test 2 into Test 1's shell to present a unified frontend card set */}
                        <Dashboard data={{
                            ...results.test1,
                            lexical_analysis: results.test2.lexical_analysis,
                            lexical_metrics: results.test2.lexical_metrics,
                            cognitive_available: results.test2.cognitive_available,
                            risk_scores: results.test2.risk_scores // Use the final blended risk from the final test
                        }} />
                    </div>
                </div>
            )}

        </div>
    );
}

// Temporary inline import purely for the landing-page icon so we don't need to rebuild components
function Activity(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
