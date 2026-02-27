"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
    duration: string;
}

export function AudioPlayer({ duration }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        // Simulate playback progress
        if (!isPlaying) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev + 2;
                });
            }, 200);
        }
    };

    // Generate placeholder waveform bars
    const waveformBars = Array.from({ length: 60 }, (_, i) => {
        const height = 15 + Math.sin(i * 0.4) * 12 + Math.random() * 10;
        return height;
    });

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/8">
                        <Volume2 className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Audio Recording
                    </CardTitle>
                    <span className="text-xs text-muted-foreground ml-auto font-medium">
                        Duration: {duration}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handlePlayPause}
                        size="icon"
                        className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                        ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                    </Button>

                    {/* Waveform visualization */}
                    <div className="flex-1 flex items-center gap-[2px] h-12 overflow-hidden">
                        {waveformBars.map((height, i) => {
                            const barProgress = (i / waveformBars.length) * 100;
                            const isActive = barProgress <= progress;
                            return (
                                <div
                                    key={i}
                                    className={`w-1 rounded-full transition-colors duration-150 shrink-0 ${isActive ? "bg-primary" : "bg-border"
                                        }`}
                                    style={{ height: `${height}%` }}
                                />
                            );
                        })}
                    </div>

                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                        {isPlaying
                            ? `${Math.floor((progress / 100) * 3)}:${String(
                                Math.floor(((progress / 100) * 222) % 60)
                            ).padStart(2, "0")}`
                            : "0:00"}{" "}
                        / {duration}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground mt-3 italic">
                    Audio playback is a UI placeholder. No real streaming is connected.
                </p>
            </CardContent>
        </Card>
    );
}
