"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { NavItem } from "./DashboardSidebar";

interface Props {
  items: NavItem[];
  contextLabel: string;
}

export default function DashboardHeader({ items, contextLabel }: Props) {
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

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e2e8f0",
        height: 56,
        display: "flex",
        alignItems: "center",
        paddingLeft: "1.5rem",
        paddingRight: "1.25rem",
        justifyContent: "space-between",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}
    >
      {/* Titre de la section */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {current && (
          <>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{current.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
              {current.label}
            </span>
          </>
        )}
        <span
          style={{
            color: "#94a3b8",
            fontSize: 13,
            marginLeft: 4,
            display: "inline-block",
          }}
        >
          — {contextLabel}
        </span>
      </div>

      {/* Profil utilisateur */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {displayName && (
          <span style={{ fontSize: 13, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
