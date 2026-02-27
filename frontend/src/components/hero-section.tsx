"use client";

import { Activity, Brain, Shield } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 px-4">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
                <div
                    className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px] animate-float"
                    style={{ animationDelay: "3s" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/5 blur-[100px] animate-float"
                    style={{ animationDelay: "1.5s" }}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-8">
                    <Shield className="w-4 h-4" />
                    <span>AI-Powered Cognitive Assessment</span>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                        Cognitive Echo
                    </span>
                    <br />
                    <span className="text-foreground">Sentinel</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    Advanced voice biomarker analysis for early cognitive health
                    detection. Record your speech and receive a comprehensive
                    neuro-risk assessment powered by AI.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-4">
                    {[
                        { icon: Activity, label: "Acoustic Analysis", color: "text-cyan-400" },
                        { icon: Brain, label: "Cognitive Scoring", color: "text-violet-400" },
                        { icon: Shield, label: "Vocal Twin Baseline", color: "text-emerald-400" },
                    ].map(({ icon: Icon, label, color }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
                        >
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-sm font-medium text-foreground/80">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
