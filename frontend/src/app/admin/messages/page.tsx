"use client";

import { useState } from "react";
import { adminMessages } from "@/lib/admin-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    MessageSquare,
    Search,
    Clock,
    ArrowRight,
    Mail,
    MailOpen,
} from "lucide-react";
import Link from "next/link";

function getTypeBadge(type: string) {
    switch (type) {
        case "guidance":
            return (
                <Badge className="bg-primary/10 text-primary border-0 shadow-none text-[10px]">
                    Guidance
                </Badge>
            );
        case "follow-up":
            return (
                <Badge className="bg-violet-50 text-violet-700 border-0 shadow-none text-[10px]">
                    Follow-Up
                </Badge>
            );
        case "notification":
            return (
                <Badge className="bg-muted text-muted-foreground border-0 shadow-none text-[10px]">
                    Notification
                </Badge>
            );
        default:
            return <Badge variant="secondary">{type}</Badge>;
    }
}

export default function MessagesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMessages = adminMessages.filter(
        (msg) =>
            msg.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Messages
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Follow-up guidance and notifications sent to patients
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-border"
                />
            </div>

            {/* Messages List */}
            <div className="space-y-3">
                {filteredMessages.length === 0 ? (
                    <Card className="bg-white border-border shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No messages found
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Try adjusting your search criteria
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredMessages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`bg-white border-border shadow-sm hover:shadow-md transition-shadow duration-200 ${!msg.read ? "border-l-2 border-l-primary" : ""
                                }`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div
                                            className={`p-2 rounded-lg shrink-0 mt-0.5 ${msg.read ? "bg-muted" : "bg-primary/8"
                                                }`}
                                        >
                                            {msg.read ? (
                                                <MailOpen className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <Mail className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link
                                                    href={`/admin/patients/${msg.patientId}`}
                                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                                >
                                                    {msg.patientName}
                                                </Link>
                                                {getTypeBadge(msg.type)}
                                                {!msg.read && (
                                                    <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
                                                {msg.content}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(msg.timestamp).toLocaleString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/patients/${msg.patientId}`}
                                        className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
