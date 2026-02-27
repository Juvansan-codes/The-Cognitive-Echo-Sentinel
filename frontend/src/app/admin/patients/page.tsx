"use client";

import { PatientsTable } from "@/components/admin/PatientsTable";
import { Users } from "lucide-react";

export default function PatientsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Patients
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage and review patient assessments
                    </p>
                </div>
            </div>
            <PatientsTable />
        </div>
    );
}
