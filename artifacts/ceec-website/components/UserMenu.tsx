"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NavInfo } from "./Navbar";
import { Church, Shield, User, LogOut, ChevronDown } from "lucide-react";

type Props = { navInfo: NavInfo };

/* ── Avatar ─────────────────────────────────────────── */
function Avatar({
  user,
  initials,
  size = 32,
  bordered,
}: {
  user: { imageUrl?: string | null; fullName?: string | null };
  initials: string;
  size?: number;
  bordered?: boolean;
}) {
  const cls = bordered ? "border-2 border-secondary" : "";
  if (user.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt={user.fullName ?? ""}
        className={`rounded-full object-cover shrink-0 ${cls}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-secondary text-primary font-extrabold flex items-center justify-center shrink-0 ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────── */
function useInitials(user: ReturnType<typeof useUser>["user"]) {
  if (!user) return "?";
  return (
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
    user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "?"
  );
}

function getRoleLabel(navInfo: NavInfo): string {
  return (
    navInfo.roleLabel ||
    (navInfo.isSuperAdmin
      ? "Super Administrateur CEEC"
      : navInfo.isChurchAdmin
        ? "Personnel d'église"
        : "Fidèle")
  );
}

function getChurchLink(navInfo: NavInfo): string | null {
  return navInfo.isChurchAdmin && navInfo.churchSlugs[0]
    ? `/gestion?eglise=${navInfo.churchSlugs[0]}`
    : null;
}

/* ═══════════════════════════════════════════════════════
   Desktop UserMenu
═══════════════════════════════════════════════════════ */
export function UserMenu({ navInfo }: Props) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoaded || !user) {
    return <div className="w-9 h-9 rounded-full bg-white/15 animate-pulse" />;
  }

  const initials = useInitials(user);
  const roleLabel = getRoleLabel(navInfo);
  const churchLink = getChurchLink(navInfo);
  const isSuperAdmin = navInfo.isSuperAdmin;

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Menu utilisateur"
        className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer ${
          open
            ? "border-white/35 bg-white/18"
            : "border-white/18 bg-white/8 hover:bg-white/12"
        }`}
      >
        <Avatar user={user} initials={initials} size={28} />
        <span className="text-white text-[13px] font-semibold max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap">
          {user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0]}
        </span>
        <ChevronDown
          size={12}
          className={`text-white/55 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[272px] bg-white rounded-2xl shadow-xl border border-primary/7 overflow-hidden z-1000">
          {/* Header */}
          <div
            className="px-[18px] pt-[18px] pb-4"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)" }}
          >
            <div className="flex items-center gap-3.5">
              <Avatar user={user} initials={initials} size={48} bordered />
              <div className="overflow-hidden flex-1">
                <div className="text-white font-bold text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.fullName || user.primaryEmailAddress?.emailAddress}
                </div>
                <div className="text-white/50 text-[11px] overflow-hidden text-ellipsis whitespace-nowrap mt-px">
                  {user.primaryEmailAddress?.emailAddress}
                </div>
                <span
                  className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isSuperAdmin
                      ? "bg-secondary/20 text-secondary border-secondary/40"
                      : "bg-white/12 text-white/80 border-white/20"
                  }`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1.5">
            {isSuperAdmin && (
              <DropdownItem
                icon={<Shield size={15} />}
                label="Administration CEEC"
                onClick={() => navigate("/admin")}
                accent
              />
            )}
            {churchLink && (
              <DropdownItem
                icon={<Church size={15} />}
                label={navInfo.churchName ? `Gérer ${navInfo.churchName}` : "Gérer ma paroisse"}
                onClick={() => navigate(churchLink)}
                accent
              />
            )}
            <DropdownItem
              icon={<User size={15} />}
              label="Mon compte"
              onClick={() => { setOpen(false); openUserProfile(); }}
            />
          </div>

          <div className="h-px bg-slate-100 mx-3.5" />

          <div className="py-1.5 pb-2">
            <DropdownItem
              icon={<LogOut size={15} />}
              label="Se déconnecter"
              onClick={() => { setOpen(false); signOut(() => router.push("/")); }}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Dropdown item ──────────────────────────────────── */
function DropdownItem({
  icon,
  label,
  onClick,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
  danger?: boolean;
}) {
  const colorCls = danger
    ? "text-red-600 hover:bg-red-50"
    : accent
      ? "text-primary font-semibold hover:bg-primary-50"
      : "text-slate-700 hover:bg-slate-50";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-left transition-colors cursor-pointer border-none bg-transparent ${colorCls}`}
    >
      <span className="opacity-80 flex items-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   Mobile UserMenu
═══════════════════════════════════════════════════════ */
export function UserMenuMobile({ navInfo, onClose }: Props & { onClose: () => void }) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded || !user) return null;

  const initials = useInitials(user);
  const roleLabel = getRoleLabel(navInfo);
  const churchLink = getChurchLink(navInfo);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="border-t border-white/10 mt-2 pt-3">
      {/* User card */}
      <div className="flex items-center gap-3 px-4 py-2 pb-3.5">
        <Avatar user={user} initials={initials} size={44} bordered />
        <div className="overflow-hidden">
          <div className="text-white font-bold text-sm overflow-hidden text-ellipsis whitespace-nowrap">
            {user.fullName || user.primaryEmailAddress?.emailAddress}
          </div>
          <span className="inline-block mt-1 bg-secondary/20 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-secondary/35">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      {navInfo.isSuperAdmin && (
        <MobileItem icon={<Shield size={16} />} label="Administration CEEC" onClick={() => go("/admin")} accent />
      )}
      {churchLink && (
        <MobileItem icon={<Church size={16} />} label="Gérer ma paroisse" onClick={() => go(churchLink)} accent />
      )}
      <MobileItem
        icon={<User size={16} />}
        label="Mon compte"
        onClick={() => { onClose(); openUserProfile(); }}
      />
      <MobileItem
        icon={<LogOut size={16} />}
        label="Se déconnecter"
        onClick={() => { onClose(); signOut(() => router.push("/")); }}
        danger
      />
    </div>
  );
}

/* ── Mobile item ────────────────────────────────────── */
function MobileItem({
  icon,
  label,
  onClick,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
  danger?: boolean;
}) {
  const colorCls = danger
    ? "text-red-400"
    : accent
      ? "text-secondary"
      : "text-white/80";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold text-left bg-transparent border-none cursor-pointer ${colorCls}`}
    >
      <span className="flex items-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
