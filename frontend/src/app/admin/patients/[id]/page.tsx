"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    getPatientById,
    getLatestAssessment,
    getTrendData,
} from "@/lib/admin-data";
import { AssessmentSummary } from "@/components/admin/AssessmentSummary";
import { AudioPlayer } from "@/components/admin/AudioPlayer";
import { TranscriptCard } from "@/components/admin/TranscriptCard";
import { TrendChart } from "@/components/admin/TrendChart";
import { ClinicalNotes } from "@/components/admin/ClinicalNotes";
import { GuidanceBox } from "@/components/admin/GuidanceBox";
import { ReviewToggle } from "@/components/admin/ReviewToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";

interface PatientDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const patient = getPatientById(id);
    const assessment = getLatestAssessment(id);
    const trend = getTrendData(id);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-48 rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
                <User className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-1">
                    Patient Not Found
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                    The patient record you&apos;re looking for doesn&apos;t exist or has
                    been removed.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/admin/patients")}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Patients
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#F5F7F9] pb-4 -mt-2 pt-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/admin/patients")}
                            className="shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                {patient.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {patient.email} · Age {patient.age} · {patient.gender}
                            </p>
                        </div>
                    </div>
                    <ReviewToggle initialStatus={patient.reviewStatus} />
                </div>
            </div>

            {/* Assessment Summary */}
            {assessment && <AssessmentSummary assessment={assessment} />}

            {/* Audio + Transcript side-by-side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {assessment && <AudioPlayer duration={assessment.audioDuration} />}
                {assessment && <TranscriptCard transcript={assessment.transcript} />}
            </div>

            {/* Trend Chart */}
            <TrendChart data={trend} />

            {/* Clinical Notes + Guidance side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ClinicalNotes />
                <GuidanceBox />
            </div>
        </div>
    );
}
