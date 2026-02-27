"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    MessageSquare,
    BarChart3,
    Settings,
    Activity,
    Shield,
} from "lucide-react";
import { currentUser, canAccessNavItem } from "@/lib/admin-auth";

const navItems = [
    {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
    },
    { name: "Patients", href: "/admin/patients", icon: Users },
    { name: "Assessments", href: "/admin/assessments", icon: ClipboardList },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    const visibleItems = navItems.filter((item) =>
        canAccessNavItem(currentUser.role, item.name)
    );

    return (
        <aside className="flex flex-col w-[280px] bg-white border-r border-border min-h-screen sticky top-0 z-20 shrink-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-[15px] tracking-tight text-foreground leading-tight">
                            Cognitive Echo
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                            Admin Panel
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1">
                <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Navigation
                </p>
                {visibleItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? "bg-primary/8 text-primary border border-primary/15 shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                }`}
                        >
                            <item.icon className="w-[18px] h-[18px] shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                            {currentUser.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                            {currentUser.role}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
