"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, Check } from "lucide-react";
import { useState } from "react";

export function GuidedReading() {
    const [copied, setCopied] = useState(false);
    const text = "The quick brown fox jumps over the lazy dog. Please read this sentence clearly and at a natural speaking pace for accurate acoustic analysis.";

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100/50">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-gray-900 text-sm font-semibold tracking-tight">Guided Reading Passage</h3>
                </div>
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100/80 border border-teal-200/60 font-medium px-2 py-0.5 pointer-events-none">
                    Standardized Input
                </Badge>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
                <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200/60 relative group transition-colors hover:bg-gray-50">
                    <p className="text-gray-900 text-[15px] leading-relaxed font-medium pr-8">
                        "{text}"
                    </p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                        title="Copy text"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                </div>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center text-center">
                    This standardized passage helps ensure consistent voice biomarker extraction.
                </p>
            </CardContent>
        </Card>
    );
}
