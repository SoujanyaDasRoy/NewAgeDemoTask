"use client";

import React from "react";
import { Check, Clock, X, AlertCircle } from "lucide-react";

interface RequestMiniStepperProps {
  status: string;
}

export default function RequestMiniStepper({ status }: RequestMiniStepperProps) {
  const isRejected = status === "REJECTED";
  const isExpired = status === "EXPIRED";

  const isStep1Done = true; // Always submitted

  const isStep2Done = [
    "APPROVED",
    "PENDING_MANUAL_PROVISIONING",
    "PROVISIONING",
    "ACCESS_PROVISIONED",
    "COMPLETED",
  ].includes(status);

  const isStep2Current = ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(status);

  const isStep3Done = status === "COMPLETED";
  const isStep3Current = ["PENDING_MANUAL_PROVISIONING", "PROVISIONING", "ACCESS_PROVISIONED"].includes(
    status
  );

  if (isRejected) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#DC2626", fontWeight: 600 }}>
        <X size={13} /> Request Rejected
      </div>
    );
  }

  if (isExpired) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 }}>
        <AlertCircle size={13} /> Access Expired
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", maxWidth: "220px" }}>
      {/* Step 1 */}
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          background: "#16A34A",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "9px",
          flexShrink: 0,
        }}
        title="Submitted"
      >
        <Check size={10} strokeWidth={3} />
      </div>

      <div
        style={{
          flex: 1,
          height: "2px",
          background: isStep2Done ? "#16A34A" : isStep2Current ? "#F59E0B" : "#E2E8F0",
          borderRadius: "1px",
        }}
      />

      {/* Step 2 */}
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          background: isStep2Done
            ? "#16A34A"
            : isStep2Current
            ? "#FEF3C7"
            : "#F1F5F9",
          color: isStep2Done
            ? "#FFF"
            : isStep2Current
            ? "#D97706"
            : "#94A3B8",
          border: isStep2Current ? "1.5px solid #D97706" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "9px",
          fontWeight: 700,
          flexShrink: 0,
        }}
        title={isStep2Done ? "Approved" : isStep2Current ? "Pending Approval" : "Approval"}
      >
        {isStep2Done ? <Check size={10} strokeWidth={3} /> : "2"}
      </div>

      <div
        style={{
          flex: 1,
          height: "2px",
          background: isStep3Done ? "#16A34A" : isStep3Current ? "#3B82F6" : "#E2E8F0",
          borderRadius: "1px",
        }}
      />

      {/* Step 3 */}
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          background: isStep3Done
            ? "#16A34A"
            : isStep3Current
            ? "#EFF6FF"
            : "#F1F5F9",
          color: isStep3Done
            ? "#FFF"
            : isStep3Current
            ? "#2563EB"
            : "#94A3B8",
          border: isStep3Current ? "1.5px solid #2563EB" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "9px",
          fontWeight: 700,
          flexShrink: 0,
        }}
        title={isStep3Done ? "Access Active" : isStep3Current ? "Provisioning in Progress" : "Provisioning"}
      >
        {isStep3Done ? <Check size={10} strokeWidth={3} /> : "3"}
      </div>
    </div>
  );
}
