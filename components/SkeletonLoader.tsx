"use client";

import React from "react";

export default function SkeletonLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header Skeleton */}
      <div
        style={{
          height: "60px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
          <div>
            <div className="skeleton" style={{ width: "80px", height: "13px", borderRadius: "4px", marginBottom: "4px" }} />
            <div className="skeleton" style={{ width: "120px", height: "10px", borderRadius: "4px" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="skeleton" style={{ width: "64px", height: "24px", borderRadius: "999px" }} />
          <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
          <div className="skeleton" style={{ width: "110px", height: "32px", borderRadius: "6px" }} />
        </div>
      </div>

      {/* Main Container Skeleton */}
      <div style={{ maxWidth: "1680px", width: "92%", margin: "0 auto", padding: "24px 0" }}>
        {/* Hero Skeleton */}
        <div style={{ marginBottom: "20px" }}>
          <div className="skeleton" style={{ width: "240px", height: "22px", borderRadius: "6px", marginBottom: "6px" }} />
          <div className="skeleton" style={{ width: "420px", height: "13px", borderRadius: "4px" }} />
        </div>

        {/* 4 Metrics Grid Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "16px",
                height: "90px",
              }}
            >
              <div className="skeleton" style={{ width: "80px", height: "11px", borderRadius: "4px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "45px", height: "22px", borderRadius: "4px" }} />
            </div>
          ))}
        </div>

        {/* Search Card Skeleton */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div className="skeleton" style={{ width: "100px", height: "15px", borderRadius: "4px", marginBottom: "6px" }} />
          <div className="skeleton" style={{ width: "280px", height: "12px", borderRadius: "4px", marginBottom: "14px" }} />
          <div className="skeleton" style={{ width: "100%", height: "42px", borderRadius: "8px" }} />
        </div>

        {/* 2-Column Grid Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "16px", marginBottom: "16px" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px",
              minHeight: "220px",
            }}
          >
            <div className="skeleton" style={{ width: "120px", height: "15px", borderRadius: "4px", marginBottom: "14px" }} />
            <div className="skeleton" style={{ width: "100%", height: "44px", borderRadius: "8px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "100%", height: "44px", borderRadius: "8px" }} />
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "20px",
              minHeight: "220px",
            }}
          >
            <div className="skeleton" style={{ width: "150px", height: "15px", borderRadius: "4px", marginBottom: "14px" }} />
            <div className="skeleton" style={{ width: "100%", height: "44px", borderRadius: "8px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "100%", height: "44px", borderRadius: "8px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
