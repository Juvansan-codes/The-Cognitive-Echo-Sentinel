"use client";

import { useState, useEffect } from "react";
import { DashboardCards } from "@/components/admin/DashboardCards";
import { RecentAssessmentsTable } from "@/components/admin/RecentAssessmentsTable";
import { RiskDistributionChart } from "@/components/admin/RiskDistributionChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                    <Skeleton className="h-8 w-48 mb-1" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <Skeleton className="h-80 rounded-xl lg:col-span-2" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Overview of patient assessments and risk metrics
                </p>
            </div>

            {/* Stat Cards */}
            <DashboardCards />

            {/* Table + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <RecentAssessmentsTable />
                </div>
                <div>
                    <RiskDistributionChart />
                </div>
            </div>
        </div>
    );
}
