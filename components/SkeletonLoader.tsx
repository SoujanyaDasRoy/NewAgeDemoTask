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
          height: "64px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "10px" }} />
          <div>
            <div className="skeleton" style={{ width: "90px", height: "14px", borderRadius: "4px", marginBottom: "4px" }} />
            <div className="skeleton" style={{ width: "140px", height: "10px", borderRadius: "4px" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="skeleton" style={{ width: "70px", height: "24px", borderRadius: "999px" }} />
          <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "999px" }} />
          <div className="skeleton" style={{ width: "120px", height: "32px", borderRadius: "8px" }} />
        </div>
      </div>

      {/* Main Container Skeleton */}
      <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "32px 24px" }}>
        {/* Hero Skeleton */}
        <div style={{ marginBottom: "28px" }}>
          <div className="skeleton" style={{ width: "260px", height: "24px", borderRadius: "6px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ width: "480px", height: "14px", borderRadius: "4px" }} />
        </div>

        {/* Search Card Skeleton */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div className="skeleton" style={{ width: "120px", height: "16px", borderRadius: "4px", marginBottom: "6px" }} />
          <div className="skeleton" style={{ width: "320px", height: "12px", borderRadius: "4px", marginBottom: "16px" }} />
          <div className="skeleton" style={{ width: "100%", height: "42px", borderRadius: "8px" }} />
        </div>

        {/* 2-Column Grid Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "24px",
              minHeight: "220px",
            }}
          >
            <div className="skeleton" style={{ width: "140px", height: "16px", borderRadius: "4px", marginBottom: "16px" }} />
            <div className="skeleton" style={{ width: "100%", height: "48px", borderRadius: "8px", marginBottom: "10px" }} />
            <div className="skeleton" style={{ width: "100%", height: "48px", borderRadius: "8px" }} />
          </div>

          <div
            style={{
              background: "#FFFCF5",
              border: "1px solid #FDE7B8",
              borderRadius: "14px",
              padding: "24px",
              minHeight: "220px",
            }}
          >
            <div className="skeleton" style={{ width: "180px", height: "16px", borderRadius: "4px", marginBottom: "16px" }} />
            <div className="skeleton" style={{ width: "100%", height: "48px", borderRadius: "8px", marginBottom: "10px" }} />
            <div className="skeleton" style={{ width: "100%", height: "48px", borderRadius: "8px" }} />
          </div>
        </div>

        {/* 3-Column Grid Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "20px",
                height: "170px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <div className="skeleton" style={{ width: "80px", height: "18px", borderRadius: "6px" }} />
                <div className="skeleton" style={{ width: "60px", height: "18px", borderRadius: "999px" }} />
              </div>
              <div className="skeleton" style={{ width: "160px", height: "16px", borderRadius: "4px", marginBottom: "16px" }} />
              <div className="skeleton" style={{ width: "100%", height: "32px", borderRadius: "6px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
