"use client";

import { useEffect, useState } from "react";
import { getSession, UserSession } from "@/services/auth";
import { Settings as SettingsIcon, User, Lock, Trash2, KeyRound } from "lucide-react";

export default function SettingsPage() {
    const [session, setSession] = useState<UserSession | null>(null);

    useEffect(() => {
        setSession(getSession());
    }, []);

    if (!session) return null;

    return (
        <div className="max-w-4xl mx-auto w-full p-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded bg-primary/10">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings & Preferences</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your clinical account access and parameters</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Profile Settings */}
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h2 className="font-semibold text-sm text-foreground">Researcher Profile</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                                <input type="text" disabled defaultValue={session.user.firstName} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                                <input type="text" disabled defaultValue={session.user.lastName} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                            <input type="email" disabled defaultValue={session.user.email} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Institution</label>
                            <input type="text" disabled defaultValue={session.user.institution} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium opacity-80 cursor-not-allowed">
                                Update Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <h2 className="font-semibold text-sm text-foreground">Security & Authorization</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-foreground">Change Password</h3>
                                <p className="text-xs text-muted-foreground mt-1">Requires re-authentication with current credentials.</p>
                            </div>
                            <button className="px-4 py-2 bg-white border border-border text-foreground hover:bg-secondary rounded-md text-sm font-medium flex items-center gap-2">
                                <KeyRound className="w-4 h-4" /> Change Password
                            </button>
                        </div>

                        <div className="h-px w-full bg-border" />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-red-600">Delete Account</h3>
                                <p className="text-xs text-muted-foreground mt-1">Permanently remove your researcher access and history.</p>
                            </div>
                            <button className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
