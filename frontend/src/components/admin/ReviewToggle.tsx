"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

interface ReviewToggleProps {
    initialStatus?: "Reviewed" | "Pending";
}

export function ReviewToggle({
    initialStatus = "Pending",
}: ReviewToggleProps) {
    const [status, setStatus] = useState(initialStatus);

    const isReviewed = status === "Reviewed";

    return (
        <div className="flex items-center gap-3">
            <Button
                onClick={() => setStatus(isReviewed ? "Pending" : "Reviewed")}
                variant={isReviewed ? "outline" : "default"}
                size="sm"
                className={`gap-2 transition-all ${isReviewed
                        ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        : ""
                    }`}
            >
                {isReviewed ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        Reviewed
                    </>
                ) : (
                    <>
                        <Clock className="w-4 h-4" />
                        Mark as Reviewed
                    </>
                )}
            </Button>
            <Badge
                className={`shadow-none ${isReviewed
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
            >
                {status}
            </Badge>
        </div>
    );
}
