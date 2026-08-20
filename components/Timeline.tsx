import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export interface TimelineStepItem {
  id?: string;
  label: string;
  actor?: string | null;
  timestamp?: string | null;
  state: "DONE" | "CURRENT" | "PENDING" | string;
}

export default function Timeline({ steps }: { steps: TimelineStepItem[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="timeline">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const isDone = step.state === "DONE" || step.state === "done";
        const isCurrent = step.state === "CURRENT" || step.state === "current";

        return (
          <div key={i} className="t-row">
            {!isLast && (
              <div
                className="t-line"
                style={{ background: isDone ? "#22C55E" : "#E5E7EB" }}
              />
            )}
            <div className="t-dot">
              {isDone ? (
                <CheckCircle2 size={18} className="text-[#22C55E]" />
              ) : isCurrent ? (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-[#2F6FED] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#2F6FED]" />
                </div>
              ) : (
                <Circle size={18} className="text-[#D1D5DB]" />
              )}
            </div>
            <div>
              <div className={`t-label ${!isDone && !isCurrent ? "muted" : ""}`}>
                {step.label}
              </div>
              {(step.actor || step.timestamp) && (
                <div className="t-meta">
                  {step.actor} {step.actor && step.timestamp && "·"} {step.timestamp}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
