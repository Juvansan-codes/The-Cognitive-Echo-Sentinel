"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, Clock } from "lucide-react";
import { patients } from "@/lib/admin-data";

const stats = [
    {
        title: "Total Patients",
        value: patients.length,
        icon: Users,
        color: "text-primary",
        bgColor: "bg-primary/8",
        change: "+2 this week",
    },
    {
        title: "High Risk Cases",
        value: patients.filter((p) => p.latestRiskLevel === "Significant Deviation")
            .length,
        icon: AlertTriangle,
        color: "text-destructive",
        bgColor: "bg-destructive/8",
        change: "Requires attention",
    },
    {
        title: "Pending Reviews",
        value: patients.filter((p) => p.reviewStatus === "Pending").length,
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        change: "Action needed",
    },
];

export function DashboardCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.map((stat) => (
                <Card
                    key={stat.title}
                    className="bg-white border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold text-foreground tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-muted-foreground">{stat.change}</p>
                            </div>
                            <div
                                className={`p-3 rounded-xl ${stat.bgColor}`}
                            >
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
