"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { TrendDataPoint } from "@/lib/admin-data";
import { TrendingUp } from "lucide-react";

interface TrendChartProps {
    data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
    if (data.length === 0) {
        return (
            <Card className="bg-white border-border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/8">
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">
                            Risk Trend
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <TrendingUp className="w-8 h-8 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            No trend data available
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/8">
                        <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Risk Trend Over Time
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E4E7EC"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: "#667085" }}
                                axisLine={{ stroke: "#E4E7EC" }}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 12, fill: "#667085" }}
                                axisLine={{ stroke: "#E4E7EC" }}
                                tickLine={false}
                                width={35}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E4E7EC",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="acousticRisk"
                                name="Acoustic Risk"
                                stroke="#2E5BFF"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#2E5BFF" }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cognitiveRisk"
                                name="Cognitive Risk"
                                stroke="#7C3AED"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#7C3AED" }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="neuroRisk"
                                name="Neuro Risk"
                                stroke="#D92D20"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#D92D20" }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
