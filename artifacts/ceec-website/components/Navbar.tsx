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

  const navLinkClass = (href: string) =>
    `px-3 py-1.5 rounded-md text-sm text-white transition-all duration-150 ${
      isActive(href)
        ? "bg-white/[0.18] font-semibold border-b-2 border-[#c59b2e]"
        : "font-normal hover:bg-white/10 border-b-2 border-transparent"
    }`;

  const mobileLinkClass = (href: string) =>
    `block px-4 py-3 rounded-lg text-sm text-white transition-colors duration-150 ${
      isActive(href)
        ? "bg-white/[0.12] font-semibold border-l-[3px] border-[#c59b2e]"
        : "font-normal border-l-[3px] border-transparent hover:bg-white/5"
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-[8px] ${
        scrolled
          ? "bg-[#1e3a8a] shadow-[0_2px_16px_rgba(0,0,0,0.22)]"
          : "bg-[linear-gradient(to_bottom,rgba(30,58,138,0.97),rgba(30,58,138,0.94))]"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="w-9 h-9 rounded-full bg-[#c59b2e] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-[#1e3a8a]"
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
            <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}

          {isSignedIn && (
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Mon espace
            </Link>
          )}

          {isSignedIn && isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#fcd34d] bg-[rgba(197,155,46,0.18)] transition-all duration-150 hover:bg-[rgba(197,155,46,0.28)]"
            >
              Admin
            </Link>
          )}

          {/* Séparateur */}
          <div className="w-px h-5 mx-2 bg-white/20" />

          {isSignedIn ? (
            <div className="ml-1">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-white/[0.12] transition-all duration-150 hover:bg-white/20"
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 rounded-md text-sm font-semibold text-[#1e3a8a] bg-[#c59b2e] transition-all duration-150 hover:brightness-110"
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
            className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-2" : "rotate-0 translate-y-0"
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-2" : "rotate-0 translate-y-0"
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-[#1e2d6b] ${
          menuOpen ? "max-h-[500px] border-t border-white/10" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn && (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass("/dashboard")}
            >
              Mon espace
            </Link>
          )}
          {isSignedIn && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-[#fcd34d]"
            >
              Administration
            </Link>
          )}

          {!isSignedIn && (
            <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white text-center bg-white/[0.12]"
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center text-[#1e3a8a] bg-[#c59b2e]"
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
