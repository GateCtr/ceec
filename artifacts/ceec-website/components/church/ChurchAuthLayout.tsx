import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { EgliseData } from "@/lib/church-context";

export default function ChurchAuthLayout({
  eglise,
  children,
}: {
  eglise: EgliseData;
  children: React.ReactNode;
}) {
  const initiale = eglise.nom.charAt(0).toUpperCase();

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
      {/* Logo / Identité de l'église */}
      <Link
        href="/c"
        style={{
          marginBottom: 28,
          textAlign: "center",
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {eglise.logoUrl ? (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "white",
            border: "3px solid rgba(197,155,46,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: 4,
          }}>
            <Image
              src={eglise.logoUrl}
              alt={`Logo ${eglise.nom}`}
              width={70}
              height={70}
              style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "50%" }}
            />
          </div>
        ) : (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c59b2e, #a07c20)",
            border: "3px solid rgba(197,155,46,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 32,
            color: "#1e3a8a",
          }}>
            {initiale}
          </div>
        )}

        <div style={{ color: "white", fontWeight: 800, fontSize: 17, lineHeight: 1.2, maxWidth: 280, textAlign: "center" }}>
          {eglise.nom}
        </div>

        {eglise.ville && (
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            📍 {eglise.ville}
          </div>
        )}
      </Link>

      {children}

      {/* Badge CEEC en bas */}
      <Link
        href="/"
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          gap: 6,
          textDecoration: "none",
          opacity: 0.55,
        }}
      >
        <Image src="/ceec-emblem.svg" alt="CEEC" width={16} height={16} />
        <span style={{ color: "white", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
          Plateforme CEEC
        </span>
      </Link>
    </div>
  );
}
