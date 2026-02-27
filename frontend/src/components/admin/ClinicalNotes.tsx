"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, Save, Clock } from "lucide-react";
import type { ClinicalNote } from "@/lib/admin-data";

export function ClinicalNotes() {
    const [noteText, setNoteText] = useState("");
    const [savedNotes, setSavedNotes] = useState<ClinicalNote[]>([]);

    const handleSave = () => {
        if (!noteText.trim()) return;
        const newNote: ClinicalNote = {
            id: `cn-${Date.now()}`,
            text: noteText.trim(),
            timestamp: new Date().toISOString(),
        };
        setSavedNotes((prev) => [newNote, ...prev]);
        setNoteText("");
    };

    return (
        <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/8">
                        <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Clinical Notes
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Textarea
                        placeholder="Add a clinical note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="min-h-24 bg-[#F5F7F9] border-border resize-none"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={!noteText.trim()}
                            size="sm"
                            className="gap-1.5"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save Note
                        </Button>
                    </div>
                </div>

                {savedNotes.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Saved Notes
                        </p>
                        {savedNotes.map((note) => (
                            <div
                                key={note.id}
                                className="p-3 rounded-lg bg-[#F5F7F9] border border-border/50"
                            >
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {note.text}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {new Date(note.timestamp).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
