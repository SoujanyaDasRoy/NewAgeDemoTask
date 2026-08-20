"use client";

import React from "react";

interface ServiceLogoProps {
  tool: string;
  size?: number;
}

export default function ServiceLogo({ tool, size = 18 }: ServiceLogoProps) {
  const t = tool.toLowerCase();

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

  // Default clean app icon
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "4px",
        background: "#0F1B33",
        color: "#FFF",
        fontSize: size * 0.55,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {tool.slice(0, 1).toUpperCase()}
    </div>
  );
}
