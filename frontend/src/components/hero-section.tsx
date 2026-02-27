"use client";

import { Activity, Fingerprint, FileText } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden py-16 px-4">
            {/* Background geometric pattern for clinical look */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border-[40px] border-primary/5" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border-[40px] border-emerald-500/5" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-8 shadow-sm">
                    <Activity className="w-4 h-4" />
                    <span>Early-Onset Neuro-Degenerative Detection</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
                    The <span className="text-primary">Cognitive Echo</span> Sentinel
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                    Acoustic micro-biometrics can detect Parkinson's and Alzheimer's years before physical symptoms.
                    Monitor 10ms increases in pause-time and vowel clarity decay with clinical precision.
                </p>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Temporal Phonetic Mapper</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Analyze 'micro-rhythms' of speech to detect 'Phonetic Decay'—where vocal folds lose coordination.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Fingerprint className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">The 'Vocal Twin' Reference</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Create a 'Healthy Baseline' voice clone as a 'Golden Reference' to measure speech degradation over time.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Contextual Lexical Density</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Utilize LLM analysis to determine if logic and vocabulary are deteriorating alongside acoustic quality.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
