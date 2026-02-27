"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Assessment } from "@/lib/admin-data";
import { Activity, Brain, Shield, Calendar, Gauge } from "lucide-react";

interface AssessmentSummaryProps {
    assessment: Assessment;
}

function getRiskColor(level: string) {
    switch (level) {
        case "Baseline":
            return {
                badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                text: "text-emerald-700",
            };
        case "Mild Deviation":
            return {
                badge: "bg-amber-50 text-amber-700 border border-amber-200",
                text: "text-amber-700",
            };
        case "Significant Deviation":
            return {
                badge: "bg-red-50 text-red-700 border border-red-200",
                text: "text-red-700",
            };
        default:
            return { badge: "", text: "" };
    }
}

export function AssessmentSummary({ assessment }: AssessmentSummaryProps) {
    const riskColors = getRiskColor(assessment.riskLevel);

    const metrics = [
        {
            label: "Acoustic Risk Score",
            value: assessment.acousticRiskScore,
            icon: Activity,
            color: "text-primary",
            bg: "bg-primary/8",
        },
        {
            label: "Cognitive Risk Score",
            value: assessment.cognitiveRiskScore,
            icon: Brain,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            label: "Final Neuro Risk",
            value: assessment.finalNeuroRisk,
            icon: Gauge,
            color: riskColors.text,
            bg:
                assessment.riskLevel === "Baseline"
                    ? "bg-emerald-50"
                    : assessment.riskLevel === "Mild Deviation"
                        ? "bg-amber-50"
                        : "bg-red-50",
        },
    ];

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/8">
                            <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">
                            Assessment Summary
                        </CardTitle>
                    </div>
                    <Badge className={`${riskColors.badge} shadow-none`}>
                        {assessment.riskLevel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F7F9] border border-border/50"
                        >
                            <div className={`p-2.5 rounded-lg ${metric.bg}`}>
                                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground tracking-tight">
                                    {metric.value}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        /100
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {metric.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-6 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gauge className="w-4 h-4" />
                        <span>
                            Confidence:{" "}
                            <span className="font-semibold text-foreground">
                                {(assessment.confidenceScore * 100).toFixed(0)}%
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {new Date(assessment.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
