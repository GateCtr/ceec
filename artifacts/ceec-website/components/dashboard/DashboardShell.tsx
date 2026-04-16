"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import DashboardSidebar, { type NavItem } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface Props {
  items: NavItem[];
  headerTitle: string;
  headerSubtitle: string;
  logoUrl?: string;
  headerInitial: string;
  headerColor?: string;
  contextLabel: string;
  backHref: string;
  backLabel: string;
  storageKey: string;
  userRole?: string;
  children: React.ReactNode;
}

const COLLAPSED_W = 64;
const EXPANDED_W = 240;
const MOBILE_BREAKPOINT = 768;

export default function DashboardShell({
  items,
  headerTitle,
  headerSubtitle,
  logoUrl,
  headerInitial,
  headerColor,
  contextLabel,
  backHref,
  backLabel,
  storageKey,
  userRole,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {}
    return () => window.removeEventListener("resize", checkMobile);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      return next;
    });
  }, [storageKey]);

  const sidebarW = mounted && !isMobile
    ? (collapsed ? COLLAPSED_W : EXPANDED_W)
    : 0;

  const userInfo = user
    ? {
        name: user.firstName
          ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
          : user.emailAddresses[0]?.emailAddress ?? "Utilisateur",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: user.imageUrl ?? undefined,
        role: userRole,
      }
    : undefined;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Sidebar desktop — fixe */}
      {mounted && !isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: collapsed ? COLLAPSED_W : EXPANDED_W,
            transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 40,
          }}
        >
          <DashboardSidebar
            items={items}
            headerTitle={headerTitle}
            headerSubtitle={headerSubtitle}
            logoUrl={logoUrl}
            headerInitial={headerInitial}
            headerColor={headerColor}
            backHref={backHref}
            backLabel={backLabel}
            collapsed={collapsed}
            onToggle={toggle}
            user={userInfo}
          />
        </div>
      )}

      {/* Sidebar mobile — drawer overlay */}
      {mounted && isMobile && mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 50,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: EXPANDED_W,
              zIndex: 51,
            }}
          >
            <DashboardSidebar
              items={items}
              headerTitle={headerTitle}
              headerSubtitle={headerSubtitle}
              logoUrl={logoUrl}
              headerInitial={headerInitial}
              headerColor={headerColor}
              backHref={backHref}
              backLabel={backLabel}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              user={userInfo}
              mobileOpen={mobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* Zone de contenu */}
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
        <DashboardHeader
          items={items}
          contextLabel={contextLabel}
          onMobileMenuOpen={isMobile ? () => setMobileOpen(true) : undefined}
        />
        <main style={{ flex: 1, overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
