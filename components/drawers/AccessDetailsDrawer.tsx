"use client";

import React from "react";
import { X, CheckCircle2, Lock, Clock, Key, AlertTriangle } from "lucide-react";
import StatusBadge from "../StatusBadge";

interface AccessDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  currentUserName: string;
  onRequestAccess: (accessItem: any) => void;
  onRequestException: (accessItem: any) => void;
  onRequestAccessId: (accessItemId: string) => void;
  onViewAccessIdStatus: (accessItemId: string) => void;
}

export default function AccessDetailsDrawer({
  isOpen,
  onClose,
  accessItem,
  currentUserName,
  onRequestAccess,
  onRequestException,
  onRequestAccessId,
  onViewAccessIdStatus,
}: AccessDetailsDrawerProps) {
  if (!isOpen || !accessItem) return null;

  const isEligible = accessItem.isEligible;
  const hasAccessId = !!accessItem.accessId;
  const isPendingAccessId = accessItem.pendingAccessIdReq;

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <h3>{accessItem.name}</h3>
            <div className="sub">
              {accessItem.tool} · {accessItem.category}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <p style={{ fontSize: "13.5px", color: "#6B7280", lineHeight: "1.6" }}>
            {accessItem.description}
          </p>

          <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label">Access Details</div>
            <div className="field-grid">
              <div className="field">
                <span className="f-label">Access ID</span>
                <span className="f-value mono">
                  {accessItem.accessId ? (
                    accessItem.accessId
                  ) : (
                    <span style={{ color: "#D97706" }}>Not available</span>
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Request Type</span>
                <span className="f-value">{accessItem.requestType}</span>
              </div>
              <div className="field">
                <span className="f-label">Eligibility Group</span>
                <span className="f-value">{accessItem.group}</span>
              </div>
              <div className="field">
                <span className="f-label">Creator</span>
                <span className="f-value">{accessItem.creator}</span>
              </div>
              <div className="field">
                <span className="f-label">Approver</span>
                <span className="f-value">{accessItem.approver}</span>
              </div>
              <div className="field">
                <span className="f-label">Backup Approver</span>
                <span className="f-value">{accessItem.backupApprover}</span>
              </div>
              <div className="field">
                <span className="f-label">Access Provider</span>
                <span className="f-value">{accessItem.provider}</span>
              </div>
              <div className="field">
                <span className="f-label">Provisioning</span>
                <span className="f-value">
                  {accessItem.automation
                    ? "Automated on approval"
                    : "Manual, by access provider"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            {isEligible ? (
              <>
                <div className="success-box">
                  <CheckCircle2 size={16} className="text-[#15803D]" />
                  <span>You're eligible for this access.</span>
                </div>

                {hasAccessId ? (
                  <button
                    className="btn btn-primary btn-block"
                    style={{ marginTop: "18px" }}
                    onClick={() => onRequestAccess(accessItem)}
                  >
                    Request Access
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-primary btn-block"
                      style={{ marginTop: "18px" }}
                      disabled
                    >
                      Access ID required first
                    </button>
                    {isPendingAccessId ? (
                      <button
                        className="btn btn-secondary btn-block"
                        style={{ marginTop: "10px" }}
                        onClick={() => onViewAccessIdStatus(accessItem.id)}
                      >
                        <Clock size={16} /> Access ID Creation Pending — View Status
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-block"
                        style={{ marginTop: "10px" }}
                        onClick={() => onRequestAccessId(accessItem.id)}
                      >
                        <Key size={16} /> Request Access ID Creation
                      </button>
                    )}
                    <p style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "10px" }}>
                      This board doesn't have an Access ID yet. We'll route a governed request to the Board Admin to create one.
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="warn-box">
                  <Lock size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "#374151" }}>
                      You're not currently eligible for this access
                    </div>
                    <div style={{ color: "#6B7280", marginTop: "2px" }}>
                      This access is normally restricted to the {accessItem.group}.
                    </div>
                  </div>
                </div>

                <div className="exception-box">
                  <div className="t1">Need this access for your project?</div>
                  <div className="t2">
                    You can submit an exception request for review by the designated approver.
                  </div>
                  <button
                    className="btn btn-block"
                    style={{ marginTop: "14px", background: "#B45309", color: "#fff" }}
                    onClick={() => onRequestException(accessItem)}
                  >
                    <AlertTriangle size={15} /> Request Access Exception
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
