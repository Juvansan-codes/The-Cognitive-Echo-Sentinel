"use client";

import { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { AudioRecorder, type RecordingState } from "@/components/audio-recorder";
import { Dashboard } from "@/components/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { analyzeAudio, type AnalysisResponse } from "@/lib/api";
import { AlertTriangle, Github } from "lucide-react";

export default function Home() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob) => {
    setError(null);
    try {
      const data = await analyzeAudio(blob);
      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze audio. Is the backend running?"
      );
    } finally {
      setRecordingState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(100,200,220,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,220,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        {/* Header bar */}
        <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CE</span>
              </div>
              <span className="font-semibold text-sm tracking-tight hidden sm:block">
                Cognitive Echo Sentinel
              </span>
            </div>
            <a
              href="https://github.com/Juvansan-codes/The-Cognitive-Echo-Sentinel"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 pb-20">
          <HeroSection />

          {/* Recorder */}
          <section className="mb-10">
            <AudioRecorder
              state={recordingState}
              onStateChange={setRecordingState}
              onRecordingComplete={handleRecordingComplete}
            />
          </section>

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border-rose-500/30 bg-rose-500/5"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Dashboard */}
          {result && (
            <section>
              <Dashboard data={result} />
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/20 py-6">
          <p className="text-center text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Cognitive Echo Sentinel — For
            research & demonstration purposes only. Not a medical device.
          </p>
        </footer>
      </div>
    </div>
  );
}
