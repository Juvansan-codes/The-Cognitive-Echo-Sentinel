"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";

export type RecordingState = "idle" | "recording" | "processing";

interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    state: RecordingState;
    onStateChange: (state: RecordingState) => void;
}

export function AudioRecorder({
    onRecordingComplete,
    state,
    onStateChange,
}: AudioRecorderProps) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Waveform visualisation
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = "rgba(18, 18, 28, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw center line
            ctx.strokeStyle = "rgba(100, 200, 220, 0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Draw waveform
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#22d3ee");
            gradient.addColorStop(0.5, "#818cf8");
            gradient.addColorStop(1, "#22d3ee");

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = gradient;
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#22d3ee";
            ctx.stroke();
            ctx.shadowBlur = 0;
        };

        draw();
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Set up analyser for waveform
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Set up MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.start(250);
            onStateChange("recording");
            setDuration(0);
            timerRef.current = setInterval(
                () => setDuration((d) => d + 1),
                1000
            );
            drawWaveform();
        } catch (err) {
            console.error("Microphone access denied:", err);
        }
    }, [onRecordingComplete, onStateChange, drawWaveform]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        cancelAnimationFrame(animFrameRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        onStateChange("processing");
    }, [onStateChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60)
            .toString()
            .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    return (
        <Card className="glass-card border-border/30" id="recorder-card">
            <CardContent className="p-6 md:p-8">
                <div className="flex flex-col items-center gap-6">
                    {/* Status text */}
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-1">
                            {state === "idle" && "Ready to Record"}
                            {state === "recording" && "Recording…"}
                            {state === "processing" && "Analyzing Voice Sample…"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {state === "idle" &&
                                "Click the microphone to begin a voice sample recording."}
                            {state === "recording" &&
                                `Duration: ${formatTime(duration)} — Click stop when finished.`}
                            {state === "processing" &&
                                "Processing your audio through the analysis pipeline."}
                        </p>
                    </div>

                    {/* Waveform canvas */}
                    <div className="w-full relative rounded-xl overflow-hidden border border-border/20 bg-slate-950/50">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={120}
                            className="w-full h-[120px]"
                        />
                        {state === "idle" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-muted-foreground/40 text-sm tracking-widest uppercase">
                                    Waveform Preview
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Record / Stop button */}
                    <div className="flex items-center gap-4">
                        {state === "idle" && (
                            <Button
                                size="lg"
                                onClick={startRecording}
                                className="rounded-full w-16 h-16 p-0 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-cyan-500/40"
                                id="start-recording-btn"
                            >
                                <Mic className="w-7 h-7 text-white" />
                            </Button>
                        )}
                        {state === "recording" && (
                            <Button
                                size="lg"
                                onClick={stopRecording}
                                variant="destructive"
                                className="rounded-full w-16 h-16 p-0 animate-pulse-glow shadow-lg transition-all hover:scale-105"
                                id="stop-recording-btn"
                            >
                                <Square className="w-6 h-6 fill-current" />
                            </Button>
                        )}
                        {state === "processing" && (
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border/40">
                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                <span className="text-sm font-medium text-muted-foreground">
                                    Extracting biomarkers…
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
