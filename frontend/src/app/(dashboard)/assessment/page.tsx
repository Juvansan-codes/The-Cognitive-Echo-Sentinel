"use client";

import { useState } from "react";
import { AudioRecorder, type RecordingState } from "@/components/audio-recorder";
import { Dashboard } from "@/components/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitAudioSimulation } from "@/services/assessment";
import type { AnalysisResponse } from "@/lib/api";
import { Activity, AlertTriangle, FileText } from "lucide-react";

export default function AssessmentPage() {
    const [recordingState, setRecordingState] = useState<RecordingState>("idle");
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRecordingComplete = async (blob: Blob) => {
        setError(null);
        try {
            const data = await submitAudioSimulation(blob);
            setResult(data);
        } catch (err) {
            console.error("Analysis error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "System error: Failed to process acoustic sample. Ensure diagnostic backend is available."
            );
        } finally {
            setRecordingState("idle");
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-8">

            {/* Global Error Banner */}
            {error && (
                <Alert
                    variant="destructive"
                    className="mb-6 border-red-200 bg-red-50 text-red-800"
                >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* Left Column (Speech Input Panel) */}
                <div className="xl:col-span-4 flex flex-col gap-6 sticky top-24">
                    <AudioRecorder
                        state={recordingState}
                        onStateChange={setRecordingState}
                        onRecordingComplete={handleRecordingComplete}
                    />

                    {/* Context/Instructions Card */}
                    <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground text-sm">Protocol Instructions</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="text-primary font-medium">1.</span>
                                Record a spontaneous speech sample of at least 30 seconds.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-medium">2.</span>
                                Describe the "Cookie Theft" picture or discuss a memorable event.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-medium">3.</span>
                                Ensure a quiet environment for accurate acoustic analysis.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column (Analysis Results) */}
                <div className="xl:col-span-8">
                    {result ? (
                        <Dashboard data={result} />
                    ) : (
                        <div className="h-[calc(100vh-12rem)] min-h-[500px] rounded-xl border-2 border-dashed border-border/60 bg-white/50 flex flex-col items-center justify-center text-center p-8">
                            <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h2 className="text-lg font-semibold text-foreground mb-2">Awaiting Diagnostic Input</h2>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Provide a speech sample using the acquisition tool to generate the acoustic biomarker analysis and cognitive-lexical assessment report.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
