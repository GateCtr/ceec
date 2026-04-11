"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRef, useState, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";

type NavInfo = {
  isSuperAdmin: boolean;
  isChurchAdmin: boolean;
  churchSlugs: string[];
  roleLabel?: string;
  churchName?: string;
};

type Props = { navInfo: NavInfo };

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Super Administrateur CEEC": { bg: "rgba(197,155,46,0.2)", text: "#c59b2e", border: "rgba(197,155,46,0.4)" },
  default:                      { bg: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.8)", border: "rgba(255,255,255,0.2)" },
};

export function UserMenu({ navInfo }: Props) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoaded || !user) {
    return (
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
    );
  }

  const initials =
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
    user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "?";

  const roleLabel = navInfo.isSuperAdmin
    ? "Super Administrateur CEEC"
    : navInfo.roleLabel ||
      (navInfo.isChurchAdmin ? "Personnel d'église" : "Fidèle");

  const roleBadge = ROLE_COLORS[roleLabel] ?? ROLE_COLORS.default;

  const churchLink =
    navInfo.isChurchAdmin && navInfo.churchSlugs[0]
      ? `/gestion?eglise=${navInfo.churchSlugs[0]}`
      : null;

  const navigate = (path: string) => { setOpen(false); router.push(path); };

  return (
    <div ref={ref} style={{ position: "relative" }}>

      {/* ── Trigger ──────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Menu utilisateur"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 10px 4px 4px",
          borderRadius: 99,
          border: `1.5px solid ${open ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.18)"}`,
          background: open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
          cursor: "pointer", transition: "all 0.15s",
        }}
      >
        <Avatar user={user} initials={initials} size={28} />
        <span style={{ color: "white", fontSize: 13, fontWeight: 600, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0]}
        </span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
          style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Dropdown ─────────────────────────────────── */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 272,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid rgba(30,58,138,0.07)",
          overflow: "hidden",
          zIndex: 1000,
        }}>

          {/* Header gradient */}
          <div style={{ padding: "18px 18px 16px", background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <Avatar user={user} initials={initials} size={48} bordered />
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.fullName || user.primaryEmailAddress?.emailAddress}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                  {user.primaryEmailAddress?.emailAddress}
                </div>
                <span style={{
                  display: "inline-block", marginTop: 6,
                  background: roleBadge.bg, color: roleBadge.text,
                  fontSize: 10, fontWeight: 700, padding: "2px 9px",
                  borderRadius: 99, border: `1px solid ${roleBadge.border}`,
                  letterSpacing: "0.02em",
                }}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Nav section */}
          <div style={{ padding: "6px 0" }}>
            {navInfo.isSuperAdmin && (
              <MenuItem
                id="admin"
                hovered={hoveredItem}
                onHover={setHoveredItem}
                onClick={() => navigate("/admin")}
                icon={<ShieldIcon />}
                label="Administration CEEC"
                accent
              />
            )}
            {churchLink && (
              <MenuItem
                id="church"
                hovered={hoveredItem}
                onHover={setHoveredItem}
                onClick={() => navigate(churchLink)}
                icon={<ChurchIcon />}
                label={navInfo.churchName ? `Gérer ${navInfo.churchName}` : "Gérer ma paroisse"}
                accent
              />
            )}
            <MenuItem
              id="account"
              hovered={hoveredItem}
              onHover={setHoveredItem}
              onClick={() => { setOpen(false); openUserProfile(); }}
              icon={<AccountIcon />}
              label="Mon compte"
            />
          </div>

          <div style={{ height: 1, background: "#f1f5f9", margin: "0 14px" }} />

          {/* Sign out */}
          <div style={{ padding: "6px 0 8px" }}>
            <MenuItem
              id="signout"
              hovered={hoveredItem}
              onHover={setHoveredItem}
              onClick={() => { setOpen(false); signOut(() => router.push("/")); }}
              icon={<SignOutIcon />}
              label="Se déconnecter"
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mobile version (used inside the hamburger menu) ─── */
export function UserMenuMobile({ navInfo, onClose }: Props & { onClose: () => void }) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded || !user) return null;

  const initials =
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
    user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "?";

  const roleLabel = navInfo.isSuperAdmin
    ? "Super Administrateur CEEC"
    : navInfo.roleLabel || (navInfo.isChurchAdmin ? "Personnel d'église" : "Fidèle");

  const churchLink =
    navInfo.isChurchAdmin && navInfo.churchSlugs[0]
      ? `/gestion?eglise=${navInfo.churchSlugs[0]}`
      : null;

  const go = (path: string) => { onClose(); router.push(path); };

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 12 }}>
      {/* User card */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px 14px" }}>
        <Avatar user={user} initials={initials} size={44} bordered />
        <div style={{ overflow: "hidden" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.fullName || user.primaryEmailAddress?.emailAddress}
          </div>
          <span style={{ display: "inline-block", marginTop: 3, background: "rgba(197,155,46,0.2)", color: "#c59b2e", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(197,155,46,0.35)" }}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      {navInfo.isSuperAdmin && (
        <MobileItem icon="🛡" label="Administration CEEC" onClick={() => go("/admin")} accent />
      )}
      {churchLink && (
        <MobileItem icon="⛪" label="Gérer ma paroisse" onClick={() => go(churchLink)} accent />
      )}
      <MobileItem
        icon={<AccountIconSm />}
        label="Mon compte"
        onClick={() => { onClose(); openUserProfile(); }}
      />
      <MobileItem
        icon={<SignOutIconSm />}
        label="Se déconnecter"
        onClick={() => { onClose(); signOut(() => router.push("/")); }}
        danger
      />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function Avatar({ user, initials, size, bordered }: {
  user: { imageUrl?: string | null; fullName?: string | null };
  initials: string; size: number; bordered?: boolean;
}) {
  const border = bordered ? "2px solid #c59b2e" : "none";
  if (user.imageUrl) {
    return <img src={user.imageUrl} alt={user.fullName ?? ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border, flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#c59b2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e3a8a", fontWeight: 800, fontSize: size * 0.38, border, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function MenuItem({ id, hovered, onHover, onClick, icon, label, accent, danger }: {
  id: string; hovered: string | null; onHover: (id: string | null) => void;
  onClick: () => void; icon: React.ReactNode; label: string;
  accent?: boolean; danger?: boolean;
}) {
  const isHovered = hovered === id;
  const color = danger ? "#dc2626" : accent ? "#1e3a8a" : "#334155";
  const bg = isHovered ? (danger ? "#fef2f2" : accent ? "#eff6ff" : "#f8fafc") : "transparent";

  return (
    <button
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 11,
        width: "100%", padding: "9px 16px",
        background: bg, border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: accent || danger ? 600 : 500,
        color, textAlign: "left", transition: "background 0.1s",
      } as CSSProperties}
    >
      <span style={{ opacity: 0.8, display: "flex", alignItems: "center" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MobileItem({ icon, label, onClick, accent, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  accent?: boolean; danger?: boolean;
}) {
  const color = danger ? "#f87171" : accent ? "#c59b2e" : "rgba(255,255,255,0.8)";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "10px 16px",
        background: "none", border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 600, color, textAlign: "left",
      } as CSSProperties}
    >
      <span style={{ fontSize: typeof icon === "string" ? 15 : 14, display: "flex", alignItems: "center" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* ── Icons ──────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ChurchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 22H6l1-8H5l7-6 7 6h-2l1 8z"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="9" y1="5" x2="15" y2="5"/>
  </svg>
);
const AccountIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const SignOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const AccountIconSm = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const SignOutIconSm = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
