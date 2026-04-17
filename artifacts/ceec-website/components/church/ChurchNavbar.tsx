"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import type { EgliseData } from "@/lib/church-context";

type PageLink = {
  titre: string;
  slug: string;
};

type NavbarConfig = {
  couleurPrimaire?: string;
  couleurAccent?: string;
};

export default function ChurchNavbar({
  eglise,
  pages = [],
  config,
}: {
  eglise: EgliseData;
  pages?: PageLink[];
  config?: NavbarConfig;
}) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const primary = config?.couleurPrimaire ?? "var(--church-primary, #1e3a8a)";
  const accent = config?.couleurAccent ?? "var(--church-accent, #c59b2e)";
  const navBg = primary.startsWith("#") ? primary : "#1e3a8a";

  const baseLinks = [
    { href: "/c", label: "Accueil" },
    { href: "/c/annonces", label: "Annonces" },
    { href: "/c/evenements", label: "Événements" },
    { href: "/c/marathons", label: "Marathons" },
  ];

  const customLinks = pages.map((p) => ({
    href: `/c/${p.slug}`,
    label: p.titre,
  }));

  const links = [...baseLinks, ...customLinks];

  const isActive = (href: string) =>
    href === "/c"
      ? pathname === "/c"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      style={{
        background: navBg,
        color: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo + Name */}
        <Link href="/c" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
          {eglise.logoUrl ? (
            <img
              src={eglise.logoUrl}
              alt={eglise.nom}
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent.startsWith("#") ? accent : "#c59b2e"}` }}
            />
          ) : (
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: accent.startsWith("#") ? accent : "#c59b2e",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 16, color: navBg, flexShrink: 0,
              }}
            >
              {eglise.nom.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: "white", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {eglise.nom}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.2 }}>
              {eglise.ville} — CEEC
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="church-desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 14,
                fontWeight: isActive(link.href) ? 600 : 400,
                background: isActive(link.href) ? "rgba(255,255,255,0.2)" : "transparent",
                borderBottom: isActive(link.href) ? `2px solid ${accent.startsWith("#") ? accent : "#c59b2e"}` : "2px solid transparent",
                color: "white",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />

          {isSignedIn ? (
            <>
              <Link href="/c/mon-espace" style={{
                padding: "6px 12px", borderRadius: 7, fontSize: 14,
                background: pathname === "/c/mon-espace" ? "rgba(255,255,255,0.2)" : "transparent",
                borderBottom: pathname === "/c/mon-espace" ? `2px solid ${accent.startsWith("#") ? accent : "#c59b2e"}` : "2px solid transparent",
                color: "white", textDecoration: "none", fontWeight: pathname === "/c/mon-espace" ? 600 : 400,
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
                padding: "6px 16px", borderRadius: 7, fontSize: 14,
                background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 500,
                marginLeft: 4, textDecoration: "none",
              }}>
                Connexion
              </Link>
              <Link href="/c/inscription" style={{
                padding: "6px 16px", borderRadius: 7, fontSize: 14,
                background: accent.startsWith("#") ? accent : "#c59b2e",
                color: navBg, fontWeight: 700, marginLeft: 4, textDecoration: "none",
              }}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", padding: 8 }}
          className="church-mobile-btn"
        >
          <span style={{ display: "block", width: 24, height: 2, background: "white", marginBottom: 5, transition: "transform 0.2s", transform: menuOpen ? "rotate(45deg) translate(4px,5px)" : "none" }} />
          <span style={{ display: "block", width: 24, height: 2, background: "white", marginBottom: 5, transition: "opacity 0.2s", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 24, height: 2, background: "white", transition: "transform 0.2s", transform: menuOpen ? "rotate(-45deg) translate(4px,-5px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)", padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "12px 14px", borderRadius: 8,
                color: "white", fontSize: 15, fontWeight: isActive(link.href) ? 600 : 400,
                background: isActive(link.href) ? "rgba(255,255,255,0.15)" : "transparent",
                marginBottom: 4, textDecoration: "none",
                borderLeft: isActive(link.href) ? `3px solid ${accent.startsWith("#") ? accent : "#c59b2e"}` : "3px solid transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <Link href="/c/mon-espace" onClick={() => setMenuOpen(false)} style={{
              display: "block", padding: "12px 14px", borderRadius: 8,
              color: "white", fontSize: 15, marginBottom: 4, textDecoration: "none",
              background: pathname === "/c/mon-espace" ? "rgba(255,255,255,0.15)" : "transparent",
              borderLeft: pathname === "/c/mon-espace" ? `3px solid ${accent.startsWith("#") ? accent : "#c59b2e"}` : "3px solid transparent",
            }}>
              Mon espace
            </Link>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Link href="/c/connexion" onClick={() => setMenuOpen(false)} style={{
                flex: 1, padding: "11px", borderRadius: 8,
                background: "rgba(255,255,255,0.14)", color: "white",
                fontWeight: 600, textAlign: "center", fontSize: 14, textDecoration: "none",
              }}>
                Connexion
              </Link>
              <Link href="/c/inscription" onClick={() => setMenuOpen(false)} style={{
                flex: 1, padding: "11px", borderRadius: 8,
                background: accent.startsWith("#") ? accent : "#c59b2e",
                color: navBg, fontWeight: 700, textAlign: "center", fontSize: 14, textDecoration: "none",
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
        @media (min-width: 769px) {
          .church-mobile-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
