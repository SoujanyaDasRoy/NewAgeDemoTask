import React from "react";

export const STATUS_MAP: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  PENDING_APPROVAL: {
    label: "Pending Approval",
    className: "badge-amber",
    dotClass: "badge-dot-amber-pulse",
  },
  PENDING_EXCEPTION_APPROVAL: {
    label: "Pending Exception Approval",
    className: "badge-amber",
    dotClass: "badge-dot-amber-pulse",
  },
  APPROVED: {
    label: "Approved",
    className: "badge-blue",
    dotClass: "badge-dot-blue",
  },
  PROVISIONING: {
    label: "Provisioning",
    className: "badge-blue",
    dotClass: "badge-dot-blue-pulse",
  },
  PENDING_MANUAL_PROVISIONING: {
    label: "Pending Provisioning",
    className: "badge-orange",
    dotClass: "badge-dot-orange-pulse",
  },
  ACCESS_PROVISIONED: {
    label: "Access Provisioned",
    className: "badge-teal",
    dotClass: "badge-dot-teal",
  },
  COMPLETED: {
    label: "Completed",
    className: "badge-green",
    dotClass: "badge-dot-green",
  },
  REJECTED: {
    label: "Rejected",
    className: "badge-red",
    dotClass: "badge-dot-red",
  },
  EXPIRED: {
    label: "Access Expired",
    className: "badge-gray",
    dotClass: "badge-dot-gray",
  },
  "Pending Approval": {
    label: "Pending Approval",
    className: "badge-amber",
    dotClass: "badge-dot-amber-pulse",
  },
  "Pending Exception Approval": {
    label: "Pending Exception Approval",
    className: "badge-amber",
    dotClass: "badge-dot-amber-pulse",
  },
  Approved: {
    label: "Approved",
    className: "badge-blue",
    dotClass: "badge-dot-blue",
  },
  Provisioning: {
    label: "Provisioning",
    className: "badge-blue",
    dotClass: "badge-dot-blue-pulse",
  },
  "Pending Manual Provisioning": {
    label: "Pending Provisioning",
    className: "badge-orange",
    dotClass: "badge-dot-orange-pulse",
  },
  "Access Provisioned": {
    label: "Access Provisioned",
    className: "badge-teal",
    dotClass: "badge-dot-teal",
  },
  Completed: {
    label: "Completed",
    className: "badge-green",
    dotClass: "badge-dot-green",
  },
  Rejected: {
    label: "Rejected",
    className: "badge-red",
    dotClass: "badge-dot-red",
  },
  "Pending Governance Review": {
    label: "Pending Review",
    className: "badge-violet",
    dotClass: "badge-dot-violet-pulse",
  },
  "Access ID Created": {
    label: "Access ID Created",
    className: "badge-green",
    dotClass: "badge-dot-green",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || {
    label: status,
    className: "badge-gray",
    dotClass: "badge-dot-gray",
  };

  return (
    <span className={`badge ${config.className}`}>
      <span className={`badge-dot ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}

