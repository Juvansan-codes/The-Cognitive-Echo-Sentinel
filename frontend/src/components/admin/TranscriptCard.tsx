"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface TranscriptCardProps {
    transcript: string;
}

export function TranscriptCard({ transcript }: TranscriptCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/8">
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">
                            Transcript
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="gap-1.5 text-xs text-muted-foreground"
                    >
                        {expanded ? (
                            <>
                                Collapse <ChevronUp className="w-3.5 h-3.5" />
                            </>
                        ) : (
                            <>
                                Expand <ChevronDown className="w-3.5 h-3.5" />
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    className={`transition-all duration-300 overflow-hidden ${expanded ? "max-h-96" : "max-h-24"
                        }`}
                >
                    <div className="overflow-y-auto max-h-96 pr-2">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {transcript}
                        </p>
                    </div>
                </div>
                {!expanded && transcript.length > 200 && (
                    <div className="mt-2 bg-gradient-to-t from-white to-transparent h-6 -translate-y-6 pointer-events-none" />
                )}
            </CardContent>
        </Card>
    );
}
