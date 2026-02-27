"use client";

import { useEffect, useState } from "react";
import { getAssessmentHistory, AssessmentHistoryItem } from "@/services/assessment";
import { Loader2, Activity, ChevronRight, FileText } from "lucide-react";

export default function HistoryPage() {
    const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getAssessmentHistory();
                setHistory(data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="max-w-6xl mx-auto w-full p-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Assessment History</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review past clinical vocal biomarker recordings</p>
                </div>
            </div>

            <div className="bg-white border text-sm border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 border-b border-border text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Assessment ID</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Risk Index</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            <span>Loading registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No assessment history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-foreground">
                                            {item.id}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {item.durationSeconds}s
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${item.riskLevel === "Medium" ? "bg-amber-500" :
                                                        item.riskLevel === "High" ? "bg-red-500" : "bg-emerald-500"
                                                    }`} />
                                                <span className="font-semibold">{item.riskScore.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Report <ChevronRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
