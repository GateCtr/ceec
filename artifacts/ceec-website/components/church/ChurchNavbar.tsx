"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import type { EgliseData } from "@/lib/church-context";

export default function ChurchNavbar({ eglise }: { eglise: EgliseData }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/c", label: "Accueil" },
    { href: "/c/annonces", label: "Annonces" },
    { href: "/c/evenements", label: "Événements" },
    { href: "/c/paroisses", label: "Notre église" },
  ];

  const isActive = (href: string) => pathname === href || (href !== "/c" && pathname.startsWith(href));

  return (
    <nav style={{
      background: "#1e3a8a",
      color: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}>
        <Link href="/c" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          {eglise.logoUrl ? (
            <img
              src={eglise.logoUrl}
              alt={eglise.nom}
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#c59b2e",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 16, color: "#1e3a8a", flexShrink: 0,
            }}>
              {eglise.nom.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: "white" }}>
              {eglise.nom}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, lineHeight: 1.2 }}>
              {eglise.ville} — CEEC
            </div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="church-desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: isActive(link.href) ? 600 : 400,
                background: isActive(link.href) ? "rgba(255,255,255,0.2)" : "transparent",
                color: "white",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn ? (
            <>
              <Link href="/gestion" style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 14,
                background: pathname.startsWith("/gestion") ? "rgba(255,255,255,0.2)" : "transparent",
                color: "white", textDecoration: "none",
              }}>
                Mon espace
              </Link>
              <div style={{ marginLeft: 8 }}>
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/c/connexion" style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 14,
                background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 500,
                marginLeft: 4, textDecoration: "none",
              }}>
                Connexion
              </Link>
              <Link href="/c/inscription" style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 14,
                background: "#c59b2e", color: "#1e3a8a", fontWeight: 600,
                marginLeft: 4, textDecoration: "none",
              }}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "transparent", border: "none",
            color: "white", cursor: "pointer", padding: 8,
          }}
          className="church-mobile-btn"
          aria-label="Menu"
        >
          <div style={{ width: 24, height: 2, background: "white", marginBottom: 5 }} />
          <div style={{ width: 24, height: 2, background: "white", marginBottom: 5 }} />
          <div style={{ width: 24, height: 2, background: "white" }} />
        </button>
      </div>

      {menuOpen && (
        <div style={{
          background: "#1e2d6b", padding: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "12px 16px", borderRadius: 8,
                color: "white", fontSize: 15, fontWeight: isActive(link.href) ? 600 : 400,
                background: isActive(link.href) ? "rgba(255,255,255,0.15)" : "transparent",
                marginBottom: 4, textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <Link href="/gestion" onClick={() => setMenuOpen(false)} style={{
              display: "block", padding: "12px 16px", borderRadius: 8,
              color: "white", fontSize: 15, marginBottom: 4, textDecoration: "none",
            }}>
              Mon espace
            </Link>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Link href="/c/connexion" onClick={() => setMenuOpen(false)} style={{
                flex: 1, padding: "10px", borderRadius: 8,
                background: "rgba(255,255,255,0.15)", color: "white",
                fontWeight: 600, textAlign: "center", fontSize: 14, textDecoration: "none",
              }}>
                Connexion
              </Link>
              <Link href="/c/inscription" onClick={() => setMenuOpen(false)} style={{
                flex: 1, padding: "10px", borderRadius: 8,
                background: "#c59b2e", color: "#1e3a8a",
                fontWeight: 700, textAlign: "center", fontSize: 14, textDecoration: "none",
              }}>
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .church-desktop-nav { display: none !important; }
          .church-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
