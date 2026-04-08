import React from "react";
import Link from "next/link";
import Image from "next/image";

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
      {/* Logo CEEC */}
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
        <div style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "2px solid rgba(197,155,46,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
        }}>
          <Image
            src="/ceec-emblem.svg"
            alt="Logo CEEC"
            width={52}
            height={52}
            style={{ mixBlendMode: "screen" }}
          />
        </div>
        <div style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: "0.04em" }}>
          CEEC
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          Communauté des Églises Évangéliques au Congo
        </div>
      </Link>

      {children}
    </div>
  );
}
