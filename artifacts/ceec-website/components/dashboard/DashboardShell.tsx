"use client";

import { useState, useEffect } from "react";
import DashboardSidebar, { type NavItem } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface Props {
  items: NavItem[];
  headerTitle: string;
  headerSubtitle: string;
  headerInitial: string;
  headerColor?: string;
  contextLabel: string;
  backHref: string;
  backLabel: string;
  storageKey: string;
  children: React.ReactNode;
}

const COLLAPSED_W = 64;
const EXPANDED_W = 240;

export default function DashboardShell({
  items,
  headerTitle,
  headerSubtitle,
  headerInitial,
  headerColor,
  contextLabel,
  backHref,
  backLabel,
  storageKey,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {}
  }, [storageKey]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      return next;
    });
  };

  const sidebarW = mounted ? (collapsed ? COLLAPSED_W : EXPANDED_W) : EXPANDED_W;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <DashboardSidebar
        items={items}
        headerTitle={headerTitle}
        headerSubtitle={headerSubtitle}
        headerInitial={headerInitial}
        headerColor={headerColor}
        backHref={backHref}
        backLabel={backLabel}
        collapsed={collapsed}
        onToggle={toggle}
      />

      {/* Zone de contenu, décalée de la largeur de la sidebar */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarW,
          transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        <DashboardHeader items={items} contextLabel={contextLabel} />
        <main
          style={{
            flex: 1,
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
