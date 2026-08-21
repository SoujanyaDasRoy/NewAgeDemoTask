"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Zap,
  Package,
  Key,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Command,
} from "lucide-react";
import ServiceLogo from "./ServiceLogo";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: any[];
  requests: any[];
  onSelectItem: (item: any) => void;
  onSelectRequest: (request: any) => void;
  isAdmin: boolean;
}

export default function CommandPalette({
  isOpen,
  onClose,
  catalog,
  requests,
  onSelectItem,
  onSelectRequest,
  isAdmin,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtered catalog items
  const matchedCatalog = catalog
    .filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tool.toLowerCase().includes(q) ||
        (item.accessId && item.accessId.toLowerCase().includes(q))
    )
    .slice(0, 5);

  // Filtered requests
  const matchedRequests = requests
    .filter(
      (req) =>
        req.accessLabel.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q) ||
        (req.beneficiaryName && req.beneficiaryName.toLowerCase().includes(q))
    )
    .slice(0, 4);

  const totalItems = matchedCatalog.length + matchedRequests.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < totalItems ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < matchedCatalog.length) {
        onSelectItem(matchedCatalog[selectedIndex]);
        onClose();
      } else {
        const reqIdx = selectedIndex - matchedCatalog.length;
        if (matchedRequests[reqIdx]) {
          onSelectRequest(matchedRequests[reqIdx]);
          onClose();
        }
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        paddingLeft: "16px",
        paddingRight: "16px",
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "var(--surface-popover)",
          borderRadius: "14px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-popover)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            gap: "12px",
          }}
        >
          <Search size={18} style={{ color: "var(--muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, boards, requests, or press Esc to exit..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14.5px",
              color: "var(--text)",
              background: "transparent",
            }}
          />
          <kbd
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              background: "var(--surface-subtle)",
              border: "1px solid var(--border)",
              fontSize: "11px",
              color: "var(--muted)",
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "8px" }}>
          {totalItems === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                No results found for &ldquo;{query}&rdquo;
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Try searching for Monday.com, Salesforce, Zendesk, or request ID.
              </div>
            </div>
          ) : (
            <>
              {/* Category: Tools & Boards */}
              {matchedCatalog.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "6px 10px 4px",
                    }}
                  >
                    Tools &amp; Boards
                  </div>
                  {matchedCatalog.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectItem(item);
                          onClose();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          background: isSelected ? "var(--surface-subtle)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.1s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <ServiceLogo tool={item.tool} size={18} />
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                              {item.tool} · {item.category === "APPLICATION" ? "Application" : "Board"}
                              {item.accessId && <span style={{ marginLeft: "6px" }} className="mono">ID: {item.accessId}</span>}
                            </div>
                          </div>
                        </div>
                        {item.automation ? (
                          <span className="badge badge-blue" style={{ fontSize: "10.5px" }}>
                            <Zap size={10} /> Auto
                          </span>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: "10.5px" }}>Manual</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category: Requests */}
              {matchedRequests.length > 0 && (
                <div style={{ marginTop: matchedCatalog.length > 0 ? "8px" : "0" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "6px 10px 4px",
                    }}
                  >
                    Requests
                  </div>
                  {matchedRequests.map((req, idx) => {
                    const currentIdx = matchedCatalog.length + idx;
                    const isSelected = selectedIndex === currentIdx;
                    return (
                      <div
                        key={req.id}
                        onClick={() => {
                          onSelectRequest(req);
                          onClose();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          background: isSelected ? "var(--surface-subtle)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.1s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Package size={16} style={{ color: "var(--accent)" }} />
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>
                              {req.accessLabel}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                              <span className="mono">{req.id}</span> · For: {req.beneficiaryName}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`badge ${req.status === "COMPLETED" ? "badge-green" : "badge-amber"}`}
                          style={{ fontSize: "10.5px" }}
                        >
                          {req.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Tips */}
        <div
          style={{
            padding: "8px 16px",
            background: "var(--surface-subtle)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11.5px",
            color: "var(--muted)",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <span>
              <kbd style={{ padding: "1px 5px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text)" }}>↑</kbd> <kbd style={{ padding: "1px 5px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text)" }}>↓</kbd> Navigate
            </span>
            <span>
              <kbd style={{ padding: "1px 5px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text)" }}>↵</kbd> Select
            </span>
          </div>
          <span>New Age Command Bar</span>
        </div>
      </div>
    </div>
  );
}
