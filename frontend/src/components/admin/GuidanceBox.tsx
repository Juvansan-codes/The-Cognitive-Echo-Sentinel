"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Clock } from "lucide-react";
import type { GuidanceMessage } from "@/lib/admin-data";

export function GuidanceBox() {
    const [messageText, setMessageText] = useState("");
    const [sentMessages, setSentMessages] = useState<GuidanceMessage[]>([]);

    const handleSend = () => {
        if (!messageText.trim()) return;
        const newMessage: GuidanceMessage = {
            id: `gm-${Date.now()}`,
            text: messageText.trim(),
            timestamp: new Date().toISOString(),
            sentBy: "Dr. Sarah Mitchell",
        };
        setSentMessages((prev) => [newMessage, ...prev]);
        setMessageText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/8">
                        <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Follow-Up Guidance
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Type a follow-up guidance message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-[#F5F7F9] border-border"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!messageText.trim()}
                        size="icon"
                        className="shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                {sentMessages.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Sent Messages
                        </p>
                        {sentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className="p-3 rounded-lg bg-primary/5 border border-primary/10"
                            >
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {msg.text}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {msg.sentBy}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {new Date(msg.timestamp).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
