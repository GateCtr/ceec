"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/paroisses", label: "Paroisses" },
    { href: "/evenements", label: "Événements" },
    { href: "/annonces", label: "Annonces" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "#1e3a8a"
          : "linear-gradient(to bottom, rgba(30,58,138,0.97), rgba(30,58,138,0.94))",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.2)" : "none",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{ background: "#c59b2e" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              style={{ color: "#1e3a8a" }}
            >
              <path
                d="M12 2v8M12 14v8M4 12h16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-bold text-base leading-tight text-white tracking-wide">
              CEEC
            </div>
            <div className="text-[11px] leading-tight text-white/70">
              Communauté Évangélique au Congo
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm transition-all duration-150"
              style={{
                color: "white",
                fontWeight: isActive(link.href) ? 600 : 400,
                background: isActive(link.href)
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
                borderBottom: isActive(link.href)
                  ? "2px solid #c59b2e"
                  : "2px solid transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn && (
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-sm transition-all duration-150"
              style={{
                color: "white",
                fontWeight: isActive("/dashboard") ? 600 : 400,
                background: isActive("/dashboard")
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
                borderBottom: isActive("/dashboard")
                  ? "2px solid #c59b2e"
                  : "2px solid transparent",
              }}
            >
              Mon espace
            </Link>
          )}

          {isSignedIn && isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-150"
              style={{
                color: "#fcd34d",
                background: "rgba(197,155,46,0.18)",
              }}
            >
              Admin
            </Link>
          )}

          {/* Séparateur */}
          <div
            className="w-px h-5 mx-2 self-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />

          {isSignedIn ? (
            <div className="ml-1">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="px-4 py-1.5 rounded-md text-sm font-medium text-white transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 hover:brightness-110"
                style={{ background: "#c59b2e", color: "#1e3a8a" }}
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 rounded-md text-white"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span
            className="block h-0.5 w-6 bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
            }}
          />
          <span
            className="block h-0.5 w-6 bg-white transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block h-0.5 w-6 bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? "500px" : "0",
          background: "#1e2d6b",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.1)" : "none",
        }}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm transition-colors duration-150"
              style={{
                color: "white",
                fontWeight: isActive(link.href) ? 600 : 400,
                background: isActive(link.href)
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                borderLeft: isActive(link.href)
                  ? "3px solid #c59b2e"
                  : "3px solid transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn && (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm text-white"
            >
              Mon espace
            </Link>
          )}
          {isSignedIn && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold"
              style={{ color: "#fcd34d" }}
            >
              Administration
            </Link>
          )}

          {!isSignedIn && (
            <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white text-center"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center"
                style={{ background: "#c59b2e", color: "#1e3a8a" }}
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
