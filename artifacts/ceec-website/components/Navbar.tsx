"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin";

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/paroisses", label: "Paroisses" },
    { href: "/evenements", label: "Événements" },
    { href: "/annonces", label: "Annonces" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav style={{ background: "#1e3a8a", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#c59b2e", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 16, color: "#1e3a8a", flexShrink: 0
          }}>
            C
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: "white" }}>CEEC</div>
            <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.2 }}>Communauté Évangélique au Congo</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}
          className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: pathname === link.href ? 600 : 400,
                background: pathname === link.href ? "rgba(255,255,255,0.2)" : "transparent",
                color: "white",
              }}
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn ? (
            <>
              <Link href="/dashboard" style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 14,
                background: pathname.startsWith("/dashboard") ? "rgba(255,255,255,0.2)" : "transparent",
                color: "white", fontWeight: 400
              }}>
                Mon espace
              </Link>
              {isAdmin && (
                <Link href="/admin" style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 14,
                  background: pathname.startsWith("/admin") ? "rgba(197,155,46,0.3)" : "rgba(197,155,46,0.15)",
                  color: "#fcd34d", fontWeight: 600
                }}>
                  Admin
                </Link>
              )}
              <div style={{ marginLeft: 8 }}>
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 14,
                background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 500,
                marginLeft: 4
              }}>
                Connexion
              </Link>
              <Link href="/sign-up" style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 14,
                background: "#c59b2e", color: "#1e3a8a", fontWeight: 600,
                marginLeft: 4
              }}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "transparent", border: "none",
            color: "white", cursor: "pointer", padding: 8
          }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          <div style={{ width: 24, height: 2, background: "white", marginBottom: 5 }} />
          <div style={{ width: 24, height: 2, background: "white", marginBottom: 5 }} />
          <div style={{ width: 24, height: 2, background: "white" }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          background: "#1e2d6b", padding: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "12px 16px", borderRadius: 8,
                color: "white", fontSize: 15, fontWeight: pathname === link.href ? 600 : 400,
                background: pathname === link.href ? "rgba(255,255,255,0.15)" : "transparent",
                marginBottom: 4
              }}
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 16px", borderRadius: 8, color: "white", fontSize: 15, marginBottom: 4 }}>
                Mon espace
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 16px", borderRadius: 8, color: "#fcd34d", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  Administration
                </Link>
              )}
            </>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Link href="/sign-in" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, textAlign: "center", fontSize: 14 }}>
                Connexion
              </Link>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#c59b2e", color: "#1e3a8a", fontWeight: 700, textAlign: "center", fontSize: 14 }}>
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
