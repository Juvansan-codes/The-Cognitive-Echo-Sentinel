"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { riskDistribution } from "@/lib/admin-data";
import { BarChart3 } from "lucide-react";

export function RiskDistributionChart() {
    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/8">
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Risk Distribution
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-8">
                    <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #E4E7EC",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                                    }}
                                    formatter={(value: unknown, name: unknown) => [
                                        `${value} patients`,
                                        String(name),
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 flex-1">
                        {riskDistribution.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <div className="flex items-center justify-between flex-1 min-w-0">
                                    <span className="text-sm text-muted-foreground">
                                        {item.name}
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {item.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
