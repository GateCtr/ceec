"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EgliseData } from "@/lib/church-context";

interface NavPerms {
  contenus: boolean;
  membres: boolean;
  admins: boolean;
  parametres: boolean;
}

interface Props {
  eglise: EgliseData;
  permissions: NavPerms;
}

export default function GestionSidebar({ eglise, permissions }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: "Tableau de bord", href: "/gestion", icon: "📊", show: true },
    { label: "Annonces", href: "/gestion/annonces", icon: "📢", show: permissions.contenus },
    { label: "Événements", href: "/gestion/evenements", icon: "🗓️", show: permissions.contenus },
    { label: "Membres", href: "/gestion/membres", icon: "👥", show: permissions.membres },
    { label: "Admins", href: "/gestion/admins", icon: "🔐", show: permissions.admins },
    { label: "Paramètres", href: "/gestion/parametres", icon: "⚙️", show: permissions.parametres },
  ].filter((item) => item.show);

  return (
    <aside style={{
      width: 240, minHeight: "100vh", background: "#1e3a8a",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: "#c59b2e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "white", fontSize: 16, flexShrink: 0,
          }}>
            {eglise.nom.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {eglise.nom}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Espace de gestion</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const isActive = item.href === "/gestion"
            ? pathname === "/gestion"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, textDecoration: "none",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,0.7)",
                fontWeight: isActive ? 600 : 400, fontSize: 14,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Link href="/c" style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none",
          padding: "8px 12px", borderRadius: 8,
        }}>
          ← Site public
        </Link>
      </div>
    </aside>
  );
}
