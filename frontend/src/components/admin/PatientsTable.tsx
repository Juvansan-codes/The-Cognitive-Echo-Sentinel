"use client";

import { useState } from "react";
import { patients } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye } from "lucide-react";
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

export function PatientsTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [riskFilter, setRiskFilter] = useState<string>("all");

    const filteredPatients = patients.filter((patient) => {
        const matchesSearch =
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRisk =
            riskFilter === "all" || patient.latestRiskLevel === riskFilter;
        return matchesSearch && matchesRisk;
    });

    return (
        <div className="space-y-5">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-border"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="h-9 pl-9 pr-8 rounded-md border border-border bg-white text-sm text-foreground appearance-none cursor-pointer hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="Baseline">Baseline</option>
                        <option value="Mild Deviation">Mild Deviation</option>
                        <option value="Significant Deviation">Significant Deviation</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-white border-border shadow-sm">
                <CardContent className="px-0 py-0">
                    {filteredPatients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No patients found
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Patient Name
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Risk Level
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Last Assessment
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-6 text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.map((patient) => (
                                    <TableRow
                                        key={patient.id}
                                        className="border-border/50 hover:bg-muted/30 transition-colors"
                                    >
                                        <TableCell className="pl-6">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {patient.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Age {patient.age} · {patient.gender}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {patient.email}
                                        </TableCell>
                                        <TableCell>
                                            {getRiskBadge(patient.latestRiskLevel)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(patient.lastAssessmentDate).toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                }
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {patient.reviewStatus === "Reviewed" ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-none">
                                                    Reviewed
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 shadow-none">
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <Link href={`/admin/patients/${patient.id}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
