"use client";

import { Bell, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentUser } from "@/lib/admin-auth";
import { useState } from "react";

export function AdminTopbar() {
    const [showDropdown, setShowDropdown] = useState(false);

    const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

    return (
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-border bg-white sticky top-0 z-10">
            <div>
                <h1 className="text-lg font-semibold text-foreground">
                    Admin Dashboard
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">
                    Cognitive Echo Sentinel
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                    className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground hidden sm:inline">
                            {currentUser.name}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-lg shadow-lg py-1 z-50">
                                <div className="px-4 py-2 border-b border-border/50">
                                    <p className="text-sm font-medium text-foreground">
                                        {currentUser.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {currentUser.email}
                                    </p>
                                </div>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
