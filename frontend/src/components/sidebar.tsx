"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, History, Users, FileText, Settings, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

const navigation = [
    { name: "Self Assessment", href: "/assessment", icon: LayoutDashboard },
    { name: "Assessment History", href: "/history", icon: History },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

    return (
        <div className="flex flex-col w-64 bg-sidebar border-r border-border min-h-screen sticky top-0">
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-[15px] tracking-tight text-foreground truncate">
                        Cognitive Echo
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                ? "bg-white text-primary shadow-sm border border-border"
                                : "text-muted-foreground hover:bg-black/5 hover:text-foreground border border-transparent"
                                }`}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Footer Profile / Logout */}
            <div className="p-4 border-t border-border/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors border border-transparent"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
