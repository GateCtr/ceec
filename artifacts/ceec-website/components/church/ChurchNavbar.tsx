"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import type { EgliseData } from "@/lib/church-context";

type PageLink = { titre: string; slug: string };
type NavbarConfig = { couleurPrimaire?: string; couleurAccent?: string };

const NON_HERO_PATHS = [
  "/c/connexion", "/c/inscription",
  "/c/mon-espace", "/c/oauth-callback", "/c/suspendu",
];

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
  const [scrolled, setScrolled] = useState(false);

  const isHeroPage = !NON_HERO_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primary = config?.couleurPrimaire ?? "#1e3a8a";
  const accent = config?.couleurAccent ?? "#c59b2e";
  const transparent = isHeroPage && !scrolled;

  const links = [
    { href: "/c", label: "Accueil" },
    { href: "/c/annonces", label: "Annonces" },
    { href: "/c/evenements", label: "Événements" },
    { href: "/c/marathons", label: "Marathons" },
    ...pages.map((p) => ({ href: `/c/${p.slug}`, label: p.titre })),
  ];

  const isActive = (href: string) =>
    href === "/c" ? pathname === "/c" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
      }`}
      style={{ background: transparent ? "transparent" : primary, color: "white" }}
    >
      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-16">

        {/* ── Logo ──────────────────────────────────── */}
        <Link href="/c" className="flex items-center gap-3 no-underline shrink-0 group">
          {eglise.logoUrl ? (
            <img
              src={eglise.logoUrl}
              alt={eglise.nom}
              className="w-10 h-10 rounded-full object-cover border-2 transition-transform duration-200 group-hover:scale-105"
              style={{ borderColor: accent }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-base shrink-0"
              style={{ background: accent, color: primary }}
            >
              {eglise.nom.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div
              className="font-bold text-sm leading-tight text-white max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ textShadow: transparent ? "0 1px 4px rgba(0,0,0,0.4)" : "none" }}
            >
              {eglise.nom}
            </div>
            <div
              className="text-[10px] text-white/75 leading-tight"
              style={{ textShadow: transparent ? "0 1px 3px rgba(0,0,0,0.4)" : "none" }}
            >
              {eglise.ville} — CEEC
            </div>
          </div>
        </Link>

        {/* ── Desktop nav ───────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-[7px] text-sm text-white no-underline transition-all duration-150 border-b-2 ${
                isActive(link.href)
                  ? "bg-white/20 font-semibold"
                  : "font-normal hover:bg-white/10 border-transparent"
              }`}
              style={{
                borderBottomColor: isActive(link.href) ? accent : "transparent",
                textShadow: transparent ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {link.label}
            </Link>
          ))}

          <div className="w-px h-5 mx-1 bg-white/20" />

          {isSignedIn ? (
            <>
              <Link
                href="/c/mon-espace"
                className={`px-3 py-1.5 rounded-[7px] text-sm text-white no-underline transition-all duration-150 border-b-2 ${
                  pathname === "/c/mon-espace"
                    ? "bg-white/20 font-semibold"
                    : "font-normal hover:bg-white/10 border-transparent"
                }`}
                style={{
                  borderBottomColor: pathname === "/c/mon-espace" ? accent : "transparent",
                  textShadow: transparent ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                }}
              >
                Mon espace
              </Link>
              <div className="ml-2">
                <UserButton />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 ml-1">
              <Link
                href="/c/connexion"
                className="px-4 py-1.5 rounded-[7px] text-sm font-medium text-white bg-white/12 no-underline transition-all duration-150 hover:bg-white/20"
                style={{ textShadow: transparent ? "0 1px 4px rgba(0,0,0,0.5)" : "none" }}
              >
                Connexion
              </Link>
              <Link
                href="/c/inscription"
                className="px-4 py-1.5 rounded-[7px] text-sm font-bold no-underline transition-all duration-150 hover:brightness-110"
                style={{ background: accent, color: primary }}
              >
                Rejoindre
              </Link>
            </div>
          )}
        </div>

        {/* ── Hamburger mobile ──────────────────────── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 rounded-md text-white bg-transparent border-none cursor-pointer"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* ── Mobile menu ─────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[600px] border-t border-white/12" : "max-h-0"
        }`}
        style={{ background: `${primary}f0`, backdropFilter: "blur(8px)" }}
      >
        <div className="px-5 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3.5 py-3 rounded-lg text-[15px] text-white no-underline transition-colors duration-150 border-l-[3px] ${
                isActive(link.href)
                  ? "bg-white/15 font-semibold"
                  : "font-normal border-transparent hover:bg-white/5"
              }`}
              style={{ borderLeftColor: isActive(link.href) ? accent : "transparent" }}
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn ? (
            <Link
              href="/c/mon-espace"
              onClick={() => setMenuOpen(false)}
              className={`block px-3.5 py-3 rounded-lg text-[15px] text-white no-underline transition-colors duration-150 border-l-[3px] ${
                pathname === "/c/mon-espace"
                  ? "bg-white/15 font-semibold"
                  : "font-normal border-transparent hover:bg-white/5"
              }`}
              style={{ borderLeftColor: pathname === "/c/mon-espace" ? accent : "transparent" }}
            >
              Mon espace
            </Link>
          ) : (
            <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
              <Link
                href="/c/connexion"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white text-center bg-white/14 no-underline"
              >
                Connexion
              </Link>
              <Link
                href="/c/inscription"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center no-underline"
                style={{ background: accent, color: primary }}
              >
                Rejoindre
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
