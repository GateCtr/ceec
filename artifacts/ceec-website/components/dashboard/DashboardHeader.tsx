"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Menu, LucideIcon, LayoutDashboard, Church, Users, Megaphone, CalendarDays, ScrollText, Settings, Shield, UserCog, FileText, MessageSquare, Palette, Video, Lock, Trophy } from "lucide-react";
import type { NavItem, IconName } from "./DashboardSidebar";

const ICON_MAP: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  church: Church,
  users: Users,
  megaphone: Megaphone,
  calendar: CalendarDays,
  logs: ScrollText,
  settings: Settings,
  shield: Shield,
  "user-cog": UserCog,
  "file-text": FileText,
  message: MessageSquare,
  palette: Palette,
  video: Video,
  lock: Lock,
  trophy: Trophy,
};

interface Props {
  items: NavItem[];
  contextLabel: string;
  onMobileMenuOpen?: () => void;
}

export default function DashboardHeader({ items, contextLabel, onMobileMenuOpen }: Props) {
  const pathname = usePathname();
  const { user } = useUser();

  const current = items.find((item) => {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }) ?? items[0];

  const displayName = user
    ? (user.firstName
        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
        : user.emailAddresses[0]?.emailAddress ?? "")
    : "";

  const initial = displayName.trim()[0]?.toUpperCase() ?? "U";
  const IconComp = current ? (ICON_MAP[current.icon as IconName] ?? LayoutDashboard) : null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e2e8f0",
        height: 56,
        display: "flex",
        alignItems: "center",
        paddingLeft: onMobileMenuOpen ? "0.75rem" : "1.5rem",
        paddingRight: "1.25rem",
        justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onMobileMenuOpen && (
          <button
            onClick={onMobileMenuOpen}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              padding: "6px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={20} />
          </button>
        )}
        {current && IconComp && (
          <>
            <IconComp size={18} style={{ color: "#1e3a8a", opacity: 0.8 }} />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "#0f172a" }}>
              {current.label}
            </span>
          </>
        )}
        <span
          style={{
            color: "#94a3b8",
            fontSize: 12.5,
            marginLeft: 2,
            display: "inline-block",
          }}
        >
          — {contextLabel}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {displayName && (
          <span
            style={{
              fontSize: 13,
              color: "#64748b",
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </span>
        )}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: "#1e3a8a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            border: "2px solid #e2e8f0",
          }}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initial
          )}
        </div>
      </div>
    </header>
  );
}
