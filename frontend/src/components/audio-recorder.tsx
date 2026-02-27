"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Square, Loader2, UploadCloud, Clock, Activity } from "lucide-react";

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
    const fileInputRef = useRef<HTMLInputElement>(null);
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

            ctx.fillStyle = "#F5F7F9";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw center line
            ctx.strokeStyle = "#E4E7EC";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#2E5BFF"; // Primary Medical Blue
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
        };

        draw();
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onStateChange("processing");
        onRecordingComplete(file);
    };

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
        <Card className="border border-border bg-card shadow-sm" id="recorder-card">
            <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base text-foreground font-semibold">Voice Sample Acquisition</CardTitle>
                        <CardDescription className="text-xs">Acoustic marker collection</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    {/* Status Info Row */}
                    <div className="flex justify-between items-center text-xs font-medium bg-white rounded-md border border-border px-3 py-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Duration Limit: 2min</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Baseline Active</span>
                        </div>
                    </div>

                    {/* Waveform Canvas */}
                    <div className="w-full relative rounded-lg overflow-hidden border border-border bg-white h-24 flex items-center justify-center">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={96}
                            className="w-full h-24"
                        />
                        {state === "idle" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-card">
                                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                                    Awaiting Audio Input
                                </span>
                            </div>
                        )}
                        {state === "processing" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm font-medium text-foreground">Processing Biomarkers...</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-center w-full">
                            <div className="text-3xl font-mono font-medium tracking-tight text-foreground mb-4">
                                {formatTime(duration)}
                            </div>
                            <div className="flex justify-center items-center gap-4">
                                {state === "idle" && (
                                    <Button
                                        onClick={startRecording}
                                        className="rounded-full w-14 h-14 p-0 shrink-0 bg-primary hover:bg-primary/90 transition-transform hover:scale-105 shadow-sm"
                                        title="Start Recording"
                                    >
                                        <Mic className="w-6 h-6 text-white" />
                                    </Button>
                                )}
                                {state === "recording" && (
                                    <Button
                                        onClick={stopRecording}
                                        variant="destructive"
                                        className="rounded-full w-14 h-14 p-0 shrink-0 bg-red-600 hover:bg-red-700 transition-transform hover:scale-105 shadow-sm animate-pulse"
                                        title="Stop Recording"
                                    >
                                        <Square className="w-5 h-5 fill-current" />
                                    </Button>
                                )}
                                <div className="h-10 w-px bg-border mx-2 hidden sm:block"></div>
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={state !== "idle"}
                                    className="gap-2 text-sm font-medium border-border text-foreground hover:bg-secondary hidden sm:flex"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    Upload Audio
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
