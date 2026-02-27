"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Secondary Top Header inside the App */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-white sticky top-0 z-10 w-full">
                    <h1 className="text-lg font-semibold text-foreground">
                        Research Portal
                    </h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-background w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
