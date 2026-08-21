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
                style={{ background: isDone ? "#1A7F37" : "var(--border)" }}
              />
            )}
            <div className="t-dot">
              {isDone ? (
                <CheckCircle2 size={18} style={{ color: "#1A7F37" }} />
              ) : isCurrent ? (
                <div style={{ width: "18px", height: "18px", borderRadius: "999px", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "999px", background: "var(--accent)" }} />
                </div>
              ) : (
                <Circle size={18} style={{ color: "var(--border)" }} />
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
