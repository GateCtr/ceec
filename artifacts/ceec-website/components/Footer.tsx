import Link from "next/link";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#0f172a" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.374 0 0 5.373 0 12c0 2.107.547 4.153 1.588 5.946L.057 23.855a.5.5 0 0 0 .617.609l6.099-1.598A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.877 0-3.685-.5-5.27-1.443l-.38-.225-3.924 1.028 1.001-3.821-.248-.394A9.936 9.936 0 0 1 2 12c0-5.523 4.478-10 10-10s10 4.477 10 10-4.478 10-10 10z" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary">
      <path d="M12 2v8M12 14v8M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0 text-slate-500" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0 text-slate-500" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.06 6.06l.82-.82a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-foreground text-slate-400">
      <div className="max-w-[1280px] mx-auto px-4 pt-14 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">

          {/* Identité — 2 colonnes sur lg */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 no-underline">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <CrossIcon />
              </div>
              <div>
                <div className="font-bold text-base text-white leading-tight">CEEC</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Communauté Évangélique au Congo
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              La Communauté des Églises Évangéliques au Congo, unie dans la foi
              et le service à Dieu et à la nation congolaise depuis plusieurs décennies.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
                aria-label="YouTube"
              >
                <YoutubeIcon />
              </a>
              <a
                href="https://wa.me/243000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
                aria-label="WhatsApp"
              >
                <WhatsappIcon />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-secondary">
              Liens rapides
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/paroisses", label: "Nos paroisses" },
                { href: "/evenements", label: "Événements" },
                { href: "/annonces", label: "Annonces" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon espace */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-secondary">
              Mon espace
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/sign-in", label: "Se connecter" },
                { href: "/sign-up", label: "Créer un compte" },
                { href: "/dashboard", label: "Mon tableau de bord" },
                { href: "/dashboard/profile", label: "Mon profil" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-secondary">
              Contact
            </h4>
            <div className="flex flex-col gap-3 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <PinIcon />
                Kinshasa, République Démocratique du Congo
              </p>
              <p className="flex items-center gap-2">
                <MailIcon />
                contact@ceec-rdc.org
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon />
                +243 xxx xxx xxx
              </p>
            </div>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="pt-6 border-t border-surface flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} CEEC — Communauté des Églises Évangéliques au Congo.
            Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-slate-300 transition-colors duration-150">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors duration-150">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
