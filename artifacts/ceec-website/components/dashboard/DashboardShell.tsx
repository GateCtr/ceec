"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Menu, LayoutDashboard, Church, Users, Settings, ScrollText, Megaphone, CalendarDays, Shield, UserCog, FileText, MessageSquare, Palette, Video, Lock, Trophy, LucideIcon } from "lucide-react";
import DashboardSidebar, { type NavItem, type IconName } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const BOTTOM_NAV_ICON_MAP: Record<IconName, LucideIcon> = {
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

const BOTTOM_NAV_MAX = 5;

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
  const pathname = usePathname();

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
        <main
          style={{
            flex: 1,
            overflowX: "hidden",
            paddingBottom: mounted && isMobile ? 64 : 0,
          }}
        >
          {children}
        </main>
      </div>

      {/* Bottom navigation bar — mobile uniquement */}
      {mounted && isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 62,
            background: "white",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "stretch",
            zIndex: 60,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {items.slice(0, BOTTOM_NAV_MAX).map((item) => {
            const iconKey = item.icon as IconName;
            const Icon = BOTTOM_NAV_ICON_MAP[iconKey];
            const isActive = item.matchExact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  textDecoration: "none",
                  color: isActive ? "#1e3a8a" : "#94a3b8",
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  padding: "6px 4px 8px",
                  borderTop: isActive ? "2px solid #1e3a8a" : "2px solid transparent",
                  background: isActive ? "#eff6ff" : "transparent",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {Icon && <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />}
                <span style={{ lineHeight: 1, textAlign: "center", maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
                {item.badge != null && item.badge > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: "50%",
                      marginRight: -20,
                      background: "#dc2626",
                      color: "white",
                      fontSize: 9,
                      fontWeight: 800,
                      borderRadius: 100,
                      padding: "1px 5px",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {/* Bouton "Plus" si plus de BOTTOM_NAV_MAX items */}
          {items.length > BOTTOM_NAV_MAX && (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                border: "none",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 10,
                fontWeight: 500,
                padding: "6px 4px 8px",
                borderTop: "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <Menu size={20} strokeWidth={1.8} />
              <span>Plus</span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
