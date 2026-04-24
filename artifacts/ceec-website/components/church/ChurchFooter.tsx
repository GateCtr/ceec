import Link from "next/link";
import type { EgliseData } from "@/lib/church-context";
import { safeUrl } from "@/lib/sanitize-url";
import {
  MapPin, Phone, Mail, Globe, Clock, ChevronRight, Church,
  Facebook, Youtube, Instagram, Twitter, MessageCircle,
} from "lucide-react";

type SocialLinks = {
  facebook?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  siteWeb?: string | null;
  horaires?: string | null;
};

type FooterPage = { titre: string; slug: string };

const socialConfig = [
  { key: "facebook" as const, icon: Facebook, label: "Facebook" },
  { key: "youtube" as const, icon: Youtube, label: "YouTube" },
  { key: "instagram" as const, icon: Instagram, label: "Instagram" },
  { key: "twitter" as const, icon: Twitter, label: "Twitter / X" },
  { key: "whatsapp" as const, icon: MessageCircle, label: "WhatsApp" },
] as const;

function getSocialHref(key: string, value: string): string {
  if (key === "whatsapp") return `https://wa.me/${value.replace(/\D/g, "")}`;
  return safeUrl(value);
}

export default function ChurchFooter({
  eglise,
  social,
  pages = [],
}: {
  eglise: EgliseData;
  social?: SocialLinks;
  pages?: FooterPage[];
}) {
  const navLinks: FooterPage[] = [
    { titre: "Accueil", slug: "" },
    { titre: "Annonces", slug: "annonces" },
    { titre: "Événements", slug: "evenements" },
    ...pages,
  ];

  const activeSocials = socialConfig.filter(
    (s) => social?.[s.key] && typeof social[s.key] === "string" && social[s.key]!.trim(),
  );

  const hasContact = eglise.adresse || eglise.telephone || eglise.email || eglise.pasteur;

  return (
    <footer>
      {/* ── Bandeau horaires / CTA ─────────────────────── */}
      <div
        className="py-8 px-4 text-center"
        style={{ background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), var(--church-primary-dark, #152a5e))" }}
      >
        <div className="max-w-2xl mx-auto">
          {social?.horaires ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock size={16} className="text-white/60" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Horaires de culte
                </span>
              </div>
              <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed whitespace-pre-line">
                {social.horaires}
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-bold text-lg md:text-xl font-display mb-3">
                Rejoignez {eglise.nom}
              </p>
              <Link
                href="/c/inscription"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold no-underline transition-all hover:brightness-110"
                style={{ background: "var(--church-accent, #c59b2e)", color: "var(--church-primary, #1e3a8a)" }}
              >
                S&apos;inscrire
                <ChevronRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Corps principal ────────────────────────────── */}
      <div className="bg-slate-950 text-slate-400">
        <div className="max-w-[1200px] mx-auto px-4 pt-12 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

            {/* Col 1 — Identité */}
            <div>
              <Link href="/c" className="inline-flex items-center gap-3 mb-5 no-underline group">
                {eglise.logoUrl ? (
                  <img
                    src={eglise.logoUrl}
                    alt={eglise.nom}
                    className="w-11 h-11 rounded-full object-cover border-2 transition-transform duration-200 group-hover:scale-105"
                    style={{ borderColor: "var(--church-accent, #c59b2e)" }}
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base"
                    style={{ background: "var(--church-accent, #c59b2e)", color: "var(--church-primary, #1e3a8a)" }}
                  >
                    {eglise.nom.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm text-white leading-tight">{eglise.nom}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{eglise.ville} — CEEC</div>
                </div>
              </Link>

              {eglise.description && (
                <p className="text-sm leading-relaxed text-slate-400 max-w-[280px] mb-5">
                  {eglise.description.slice(0, 180)}
                  {eglise.description.length > 180 ? "…" : ""}
                </p>
              )}

              {/* Réseaux sociaux */}
              {activeSocials.length > 0 && (
                <div className="flex items-center gap-2">
                  {activeSocials.map((s) => (
                    <a
                      key={s.key}
                      href={getSocialHref(s.key, social![s.key]!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-slate-400 transition-all duration-200 hover:text-white hover:scale-105"
                      style={{ ["--tw-bg-opacity" as string]: undefined }}
                      onMouseEnter={undefined}
                      aria-label={s.label}
                    >
                      <s.icon size={17} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Col 2 — Navigation */}
            <div>
              <h4 className="text-xs font-bold mb-5 uppercase tracking-widest text-white">
                Navigation
              </h4>
              <ul className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <li key={link.slug}>
                    <Link
                      href={link.slug ? `/c/${link.slug}` : "/c"}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group"
                    >
                      <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-150" />
                      {link.titre}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/c/inscription"
                    className="text-sm transition-colors duration-150 inline-flex items-center gap-1 group font-semibold"
                    style={{ color: "var(--church-accent, #c59b2e)" }}
                  >
                    <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-150" />
                    Rejoindre l&apos;église
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 — Contact */}
            {hasContact && (
              <div>
                <h4 className="text-xs font-bold mb-5 uppercase tracking-widest text-white">
                  Contact
                </h4>
                <div className="flex flex-col gap-3.5 text-sm">
                  {eglise.pasteur && (
                    <div className="flex items-start gap-3">
                      <Church size={15} className="shrink-0 mt-0.5" style={{ color: "var(--church-accent, #c59b2e)" }} />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Pasteur</p>
                        <p className="text-slate-300 font-medium">{eglise.pasteur}</p>
                      </div>
                    </div>
                  )}
                  {eglise.adresse && (
                    <div className="flex items-start gap-3">
                      <MapPin size={15} className="shrink-0 mt-0.5" style={{ color: "var(--church-accent, #c59b2e)" }} />
                      <div>
                        <p className="text-slate-300 font-medium">{eglise.adresse}</p>
                        <p className="text-xs text-slate-500">{eglise.ville}, RDC</p>
                      </div>
                    </div>
                  )}
                  {eglise.telephone && (
                    <a href={`tel:${eglise.telephone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors no-underline">
                      <Phone size={15} className="shrink-0" style={{ color: "var(--church-accent, #c59b2e)" }} />
                      {eglise.telephone}
                    </a>
                  )}
                  {eglise.email && (
                    <a href={`mailto:${eglise.email}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors no-underline">
                      <Mail size={15} className="shrink-0" style={{ color: "var(--church-accent, #c59b2e)" }} />
                      {eglise.email}
                    </a>
                  )}
                  {social?.siteWeb && (
                    <a href={safeUrl(social.siteWeb)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors no-underline">
                      <Globe size={15} className="shrink-0" style={{ color: "var(--church-accent, #c59b2e)" }} />
                      {social.siteWeb.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Col 4 — CEEC */}
            <div>
              <h4 className="text-xs font-bold mb-5 uppercase tracking-widest text-white">
                Notre communauté
              </h4>
              <div className="flex items-start gap-3 mb-4">
                <img
                  src="/ceec-emblem.svg"
                  alt="Logo CEEC"
                  width={36}
                  height={36}
                  className="shrink-0"
                  style={{ mixBlendMode: "screen" }}
                />
                <p className="text-sm leading-relaxed text-slate-400">
                  Membre de la Communauté des Églises Évangéliques au Congo.
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="https://ceec-rdc.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-white transition-colors no-underline inline-flex items-center gap-1"
                  >
                    Site communautaire <ChevronRight size={12} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://ceec-rdc.org/paroisses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-white transition-colors no-underline inline-flex items-center gap-1"
                  >
                    Toutes les paroisses <ChevronRight size={12} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Séparateur ──────────────────────────────── */}
          <div className="h-px bg-white/10 mb-5" />

          {/* ── Barre du bas ────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {eglise.nom} — CEEC</p>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--church-accent, #c59b2e)", opacity: 0.6 }} />
              <span className="italic">Soli Deo Gloria</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
