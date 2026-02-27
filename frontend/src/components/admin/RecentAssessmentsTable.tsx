"use client";

import { assessments } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

function getRiskBadge(level: string) {
    switch (level) {
        case "Baseline":
            return (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-none">
                    Baseline
                </Badge>
            );
        case "Mild Deviation":
            return (
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 shadow-none">
                    Mild Deviation
                </Badge>
            );
        case "Significant Deviation":
            return (
                <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-none">
                    Significant Deviation
                </Badge>
            );
        default:
            return <Badge variant="secondary">{level}</Badge>;
    }
}

function getStatusBadge(status: string) {
    return status === "Reviewed" ? (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-none">
            Reviewed
        </Badge>
    ) : (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 shadow-none">
            Pending
        </Badge>
    );
}

export function RecentAssessmentsTable() {
    const recentAssessments = assessments.slice(0, 5);

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/8">
                        <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Recent Assessments
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Patient
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Risk Level
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Score
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Date
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-6">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentAssessments.map((assessment) => (
                            <TableRow
                                key={assessment.id}
                                className="border-border/50 hover:bg-muted/30 transition-colors"
                            >
                                <TableCell className="pl-6">
                                    <Link
                                        href={`/admin/patients/${assessment.patientId}`}
                                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                                    >
                                        {assessment.patientName}
                                    </Link>
                                </TableCell>
                                <TableCell>{getRiskBadge(assessment.riskLevel)}</TableCell>
                                <TableCell>
                                    <span className="text-sm font-semibold text-foreground">
                                        {assessment.finalNeuroRisk}
                                    </span>
                                    <span className="text-xs text-muted-foreground">/100</span>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(assessment.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </TableCell>
                                <TableCell className="pr-6">
                                    {getStatusBadge(assessment.reviewStatus)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
