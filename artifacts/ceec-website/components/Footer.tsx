import Link from "next/link";
import { Facebook, Youtube, MessageCircle, MapPin, Mail, Phone, Church, ChevronRight } from "lucide-react";

const communaute = [
  { href: "/paroisses", label: "Nos paroisses" },
  { href: "/evenements", label: "Événements" },
  { href: "/annonces", label: "Annonces" },
  { href: "/contact", label: "Nous contacter" },
  { href: "/sign-up", label: "Rejoindre la CEEC" },
];

const ressources = [
  { href: "/a-propos", label: "À propos de la CEEC" },
  { href: "/a-propos#doctrine", label: "Notre doctrine" },
  { href: "/a-propos#gouvernance", label: "Gouvernance" },
  { href: "/a-propos#departements", label: "Départements" },
  { href: "/historique", label: "Notre histoire" },
];

const socials = [
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://wa.me/243000000000", label: "WhatsApp", icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer>
      {/* ── Bandeau verset ─────────────────────────────── */}
      <div
        className="relative py-10 px-4 text-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-secondary) 50%, var(--color-secondary-500) 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-crosses" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 8v12M14 14h12" stroke="white" strokeWidth="1" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-crosses)" />
          </svg>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <p className="text-lg md:text-xl font-semibold italic leading-relaxed text-primary-900 font-display">
            &ldquo;Allez, faites de toutes les nations des disciples&rdquo;
          </p>
          <p className="text-xs font-bold uppercase tracking-widest mt-2 text-primary-800/70">
            Matthieu 28 : 19
          </p>
        </div>
      </div>

      {/* ── Corps principal ────────────────────────────── */}
      <div className="bg-foreground text-slate-400">
        <div className="max-w-[1280px] mx-auto px-4 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Col 1 — Identité */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3 mb-5 no-underline group">
                <img
                  src="/ceec-emblem.svg"
                  alt="Logo CEEC"
                  width={44}
                  height={44}
                  className="transition-transform duration-200 group-hover:scale-105"
                  style={{ mixBlendMode: "screen" }}
                />
                <div>
                  <div className="font-bold text-base text-white leading-tight">CEEC</div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    Communauté des Églises<br />Évangéliques au Congo
                  </div>
                </div>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400 max-w-[280px] mb-6">
                Unie dans la foi et le service à Dieu et à la nation congolaise
                depuis le 12 janvier 2009.
              </p>

              {/* Réseaux sociaux */}
              <div className="flex items-center gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-slate-400 transition-all duration-200 hover:bg-secondary/20 hover:text-secondary hover:scale-105"
                    aria-label={s.label}
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Communauté */}
            <div>
              <h4 className="text-xs font-bold mb-5 uppercase tracking-widest text-white">
                Communauté
              </h4>
              <ul className="flex flex-col gap-2.5">
                {communaute.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group"
                    >
                      <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-150" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Ressources */}
            <div>
              <h4 className="text-xs font-bold mb-5 uppercase tracking-widest text-white">
                Ressources
              </h4>
              <ul className="flex flex-col gap-2.5">
                {ressources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group"
                    >
                      <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-150" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <h4 className="text-xs font-bold mb-5 uppercase tracking-widest text-white">
                Siège social
              </h4>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="shrink-0 mt-0.5 text-secondary" />
                  <div>
                    <p className="text-slate-300 font-medium">N°04 bis, Av. Saulona</p>
                    <p className="text-slate-500 text-xs">Q/Musey, C/Ngaliema — Kinshasa, RDC</p>
                  </div>
                </div>
                <a href="mailto:contact@ceec-rdc.org" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors no-underline">
                  <Mail size={16} className="shrink-0 text-secondary" />
                  contact@ceec-rdc.org
                </a>
                <a href="tel:+243000000000" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors no-underline">
                  <Phone size={16} className="shrink-0 text-secondary" />
                  +243 xxx xxx xxx
                </a>
                <div className="flex items-start gap-3 mt-1">
                  <Church size={16} className="shrink-0 mt-0.5 text-secondary" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ASBL — Pers. juridique<br />
                    N°609/Cab/JU&DH/2011
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Séparateur ──────────────────────────────── */}
          <div className="h-px bg-white/10 mb-6" />

          {/* ── Barre du bas ────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} CEEC — Communauté des Églises Évangéliques au Congo.
            </p>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 inline-block" />
              <span className="italic">Soli Deo Gloria</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
