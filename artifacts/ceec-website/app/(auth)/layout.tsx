import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <Link
        href="/"
        style={{
          marginBottom: 28,
          textAlign: "center",
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#c59b2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 26,
            color: "#1e3a8a",
          }}
        >
          C
        </div>
        <div style={{ color: "white", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>
          CEEC
        </div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 1 }}>
          Communauté des Églises Évangéliques au Congo
        </div>
      </Link>

      {children}
    </div>
  );
}
