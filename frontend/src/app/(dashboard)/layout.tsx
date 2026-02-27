"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { getSession, UserSession } from "@/services/auth";
import { ShieldCheck } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [session, setSession] = useState<UserSession | null>(null);

    useEffect(() => {
        // Load the session securely from localStorage purely for UI display purposes
        setSession(getSession());
    }, []);

    const getDayTimestamp = () => {
        return new Date().toISOString().split("T")[0] + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Secondary Top Header inside the App */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-white sticky top-0 z-10 w-full">
                    <h1 className="text-lg font-semibold text-foreground">
                        Research Portal
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                        <div className="hidden sm:block">
                            {session ? `Dr. ${session.user.lastName}` : "Loading..."}
                        </div>
                        <div className="hidden sm:block">
                            <span>{getDayTimestamp()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs">HIPAA Compliant</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-background w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
