import React from "react";

export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING_APPROVAL: { label: "Pending Approval", className: "badge-amber" },
  PENDING_EXCEPTION_APPROVAL: { label: "Pending Exception Approval", className: "badge-amber" },
  APPROVED: { label: "Approved", className: "badge-blue" },
  PROVISIONING: { label: "Provisioning", className: "badge-blue" },
  PENDING_MANUAL_PROVISIONING: { label: "Pending Manual Provisioning", className: "badge-orange" },
  ACCESS_PROVISIONED: { label: "Access Provisioned", className: "badge-teal" },
  COMPLETED: { label: "Completed", className: "badge-green" },
  REJECTED: { label: "Rejected", className: "badge-red" },
  EXPIRED: { label: "Access Expired", className: "badge-gray" },
  "Pending Approval": { label: "Pending Approval", className: "badge-amber" },
  "Pending Exception Approval": { label: "Pending Exception Approval", className: "badge-amber" },
  "Approved": { label: "Approved", className: "badge-blue" },
  "Provisioning": { label: "Provisioning", className: "badge-blue" },
  "Pending Manual Provisioning": { label: "Pending Manual Provisioning", className: "badge-orange" },
  "Access Provisioned": { label: "Access Provisioned", className: "badge-teal" },
  "Completed": { label: "Completed", className: "badge-green" },
  "Rejected": { label: "Rejected", className: "badge-red" },
  "Pending Governance Review": { label: "Pending Governance Review", className: "badge-violet" },
  "Access ID Created": { label: "Access ID Created", className: "badge-green" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || { label: status, className: "badge-gray" };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
