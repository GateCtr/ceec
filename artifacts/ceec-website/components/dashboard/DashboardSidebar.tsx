"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Church,
  Users,
  Megaphone,
  CalendarDays,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  LucideIcon,
  Shield,
  UserCog,
  FileText,
  MessageSquare,
  Palette,
  Video,
  Lock,
  Trophy,
} from "lucide-react";

export type IconName =
  | "dashboard"
  | "church"
  | "users"
  | "megaphone"
  | "calendar"
  | "logs"
  | "settings"
  | "shield"
  | "user-cog"
  | "file-text"
  | "message"
  | "palette"
  | "video"
  | "lock"
  | "trophy";

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

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  matchExact?: boolean;
  badge?: number;
}

interface UserInfo {
  name: string;
  email: string;
  imageUrl?: string;
  role?: string;
}

interface Props {
  items: NavItem[];
  headerTitle: string;
  headerSubtitle: string;
  logoUrl?: string;
  headerInitial: string;
  headerColor?: string;
  backHref: string;
  backLabel: string;
  collapsed: boolean;
  onToggle: () => void;
  user?: UserInfo;
  onMobileClose?: () => void;
}

export default function DashboardSidebar({
  items,
  headerTitle,
  headerSubtitle,
  logoUrl,
  headerInitial,
  headerColor = "#c59b2e",
  backHref,
  backLabel,
  collapsed,
  onToggle,
  user,
  onMobileClose,
}: Props) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const w = collapsed ? 64 : 240;

  const sidebarContent = (
    <aside
      style={{
        width: w,
        height: "100vh",
        background: "linear-gradient(180deg, #1a3470 0%, #1e3a8a 60%, #1e2d6b 100%)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        zIndex: 40,
        boxShadow: "2px 0 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* En-tête avec logo */}
      <div
        style={{
          padding: collapsed ? "1rem 0" : "1rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
          minHeight: 64,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: logoUrl ? "transparent" : headerColor,
          }}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo CEEC"
              width={36}
              height={36}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          ) : (
            <span style={{ fontWeight: 800, color: "white", fontSize: 16 }}>
              {headerInitial}
            </span>
          )}
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
                letterSpacing: "0.01em",
              }}
            >
              {headerTitle}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 10,
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              {headerSubtitle}
            </div>
          </div>
        )}
        {!collapsed && onMobileClose && (
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              padding: 4,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "0.75rem 0.5rem" : "0.75rem 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {items.map((item) => {
          const active = isActive(item);
          const IconComp = ICON_MAP[item.icon as IconName] ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 10,
                padding: collapsed ? "9px 0" : "8px 10px",
                borderRadius: 8,
                textDecoration: "none",
                background: active
                  ? "rgba(255,255,255,0.13)"
                  : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.6)",
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                transition: "background 0.15s, color 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace: "nowrap",
                overflow: "hidden",
                borderLeft: active
                  ? "2px solid #c59b2e"
                  : "2px solid transparent",
                position: "relative",
              }}
            >
              <IconComp
                size={17}
                style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}
              />
              {!collapsed && (
                <>
                  <span
                    style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}
                  >
                    {item.label}
                  </span>
                  {item.badge != null && item.badge > 0 && (
                    <span
                      style={{
                        background: "#c59b2e",
                        color: "white",
                        borderRadius: 100,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        flexShrink: 0,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge != null && item.badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    background: "#c59b2e",
                    borderRadius: "50%",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profil utilisateur */}
      {user && (
        <div
          style={{
            padding: collapsed ? "0.75rem 0.5rem" : "0.75rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "6px 0" : "6px 8px",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                background: "#c59b2e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 12,
                border: "1.5px solid rgba(255,255,255,0.2)",
              }}
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                user.name[0]?.toUpperCase() ?? "U"
              )}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </div>
                {user.role && (
                  <div
                    style={{
                      color: "#c59b2e",
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.role}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pied de sidebar */}
      <div
        style={{
          padding: collapsed ? "0.5rem 0.5rem 1rem" : "0.5rem 0.625rem 1rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
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
            color: "rgba(255,255,255,0.4)",
            fontSize: 12.5,
            textDecoration: "none",
            padding: collapsed ? "8px 0" : "7px 10px",
            borderRadius: 8,
            justifyContent: collapsed ? "center" : "flex-start",
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "color 0.15s, background 0.15s",
          }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
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
            padding: collapsed ? "8px 0" : "7px 10px",
            borderRadius: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12.5,
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "color 0.15s",
          }}
        >
          <ChevronLeft
            size={15}
            style={{
              flexShrink: 0,
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
          {!collapsed && "Réduire"}
        </button>
      </div>
    </aside>
  );

  return sidebarContent;
}
