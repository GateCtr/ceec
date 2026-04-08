"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  matchExact?: boolean;
}

interface Props {
  items: NavItem[];
  headerTitle: string;
  headerSubtitle: string;
  headerInitial: string;
  headerColor?: string;
  backHref: string;
  backLabel: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({
  items,
  headerTitle,
  headerSubtitle,
  headerInitial,
  headerColor = "#c59b2e",
  backHref,
  backLabel,
  collapsed,
  onToggle,
}: Props) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const w = collapsed ? 64 : 240;

  return (
    <aside
      style={{
        width: w,
        height: "100vh",
        background: "#1e3a8a",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        zIndex: 40,
        boxShadow: "2px 0 12px rgba(0,0,0,0.12)",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          padding: collapsed ? "1.25rem 0" : "1.25rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: headerColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            color: "white",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {headerInitial}
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headerTitle}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                whiteSpace: "nowrap",
              }}
            >
              {headerSubtitle}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "1rem 0.5rem" : "1rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 10,
                padding: collapsed ? "10px 0" : "9px 12px",
                borderRadius: 8,
                textDecoration: "none",
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.68)",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: "background 0.15s, color 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace: "nowrap",
                overflow: "hidden",
                borderLeft: active ? "3px solid #c59b2e" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pied de sidebar */}
      <div
        style={{
          padding: collapsed ? "0.75rem 0.5rem" : "0.75rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Link
          href={backHref}
          title={collapsed ? backLabel : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 8,
            color: "rgba(255,255,255,0.45)",
            fontSize: 13,
            textDecoration: "none",
            padding: collapsed ? "8px 0" : "8px 12px",
            borderRadius: 8,
            justifyContent: collapsed ? "center" : "flex-start",
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "color 0.15s",
          }}
        >
          <span style={{ fontSize: 15, flexShrink: 0 }}>←</span>
          {!collapsed && backLabel}
        </Link>

        <button
          onClick={onToggle}
          title={collapsed ? "Développer la barre" : "Réduire la barre"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 8,
            padding: collapsed ? "8px 0" : "8px 12px",
            borderRadius: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "color 0.15s",
          }}
        >
          <span
            style={{
              fontSize: 15,
              flexShrink: 0,
              display: "inline-block",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            «
          </span>
          {!collapsed && "Réduire"}
        </button>
      </div>
    </aside>
  );
}
