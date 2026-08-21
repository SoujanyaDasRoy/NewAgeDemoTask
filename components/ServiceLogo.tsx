"use client";

import React from "react";

interface ServiceLogoProps {
  tool?: string;
  size?: number;
}

export default function ServiceLogo({ tool = "App", size = 18 }: ServiceLogoProps) {
  const t = (tool || "app").toLowerCase();

  if (t.includes("monday")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M3 17.5C3 15.0147 5.01472 13 7.5 13C9.98528 13 12 15.0147 12 17.5C12 19.9853 9.98528 22 7.5 22C5.01472 22 3 19.9853 3 17.5Z"
          fill="#FF3D57"
        />
        <path
          d="M8.5 7.5C8.5 5.01472 10.5147 3 13 3C15.4853 3 17.5 5.01472 17.5 7.5C17.5 9.98528 15.4853 12 13 12C10.5147 12 8.5 9.98528 8.5 7.5Z"
          fill="#00CA72"
        />
        <path
          d="M14 17.5C14 15.0147 16.0147 13 18.5 13C20.9853 13 23 15.0147 23 17.5C23 19.9853 20.9853 22 18.5 22C16.0147 22 14 19.9853 14 17.5Z"
          fill="#FFCB00"
        />
      </svg>
    );
  }

  if (t.includes("salesforce")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.1 5.3C11.5 3.8 13.5 3 15.6 3.1C18.6 3.3 21 5.7 21.3 8.7C22.3 9.5 23 10.7 23 12.1C23 14.5 21 16.5 18.6 16.5H6.2C4.4 16.5 3 15.1 3 13.3C3 11.8 4 10.5 5.5 10.2C5.9 8.2 7.8 6.6 10.1 5.3Z"
          fill="#00A1E0"
        />
      </svg>
    );
  }

  if (t.includes("zendesk")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path d="M12 3L3 12H12V3Z" fill="#03363D" />
        <path d="M12 21L21 12H12V21Z" fill="#03363D" />
        <path d="M3 21C3 16.0294 7.02944 12 12 12C12 16.9706 7.97056 21 3 21Z" fill="#03363D" />
        <path d="M21 3C21 7.97056 16.9706 12 12 12C12 7.02944 16.0294 3 21 3Z" fill="#03363D" />
      </svg>
    );
  }

  if (t.includes("datadog")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="5" fill="#632CA6" />
        <path
          d="M6.5 7.5H11C14 7.5 16.5 9.5 16.5 12C16.5 14.5 14 16.5 11 16.5H6.5V7.5ZM9 14.5H11C12.5 14.5 14 13.5 14 12C14 10.5 12.5 9.5 11 9.5H9V14.5Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (t.includes("figma")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83" />
        <path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF" />
        <path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E" />
        <path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262" />
        <circle cx="16" cy="12" r="4" fill="#1ABCFE" />
      </svg>
    );
  }

  if (t.includes("snowflake")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="5" fill="#29B5E8" />
        <path
          d="M12 4V20M4 12H20M6.34 6.34L17.66 17.66M6.34 17.66L17.66 6.34"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (t.includes("slack")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="24" height="24" rx="5" fill="#4A154B" />
        <path d="M6 10a2 2 0 112-2v2H6zm0 2h5a2 2 0 110 4H6v-4zm8-6a2 2 0 112 2h-2V6zm-2 0a2 2 0 114 0v5h-4V6zm6 8a2 2 0 11-2 2v-2h2zm0-2h-5a2 2 0 110-4h5v4zm-8 6a2 2 0 11-2-2h2v2zm2 0a2 2 0 11-4 0v-5h4v5z" fill="#E01E5A" />
      </svg>
    );
  }

  // Default clean branded app icon
  const colors = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0D9488", "#4F46E5"];
  const charCode = (tool.charCodeAt(0) || 0) + (tool.charCodeAt(1) || 0);
  const bgColor = colors[charCode % colors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size > 16 ? "5px" : "4px",
        background: bgColor,
        color: "#FFF",
        fontSize: Math.max(9, Math.round(size * 0.52)),
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        textTransform: "uppercase",
      }}
    >
      {tool.slice(0, 1).toUpperCase()}
    </div>
  );
}
