"use client";

import React, { useState } from "react";
import { CheckCircle, X, ChevronUp, ChevronDown, Plus } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";

type NavLink = { label: string; href: string; externe?: boolean };
type FooterLink = { label: string; href: string };

type ConfigData = {
  couleurPrimaire?: string | null;
  couleurAccent?: string | null;
  faviconUrl?: string | null;
  cssPersonnalise?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  youtubeChannelId?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  siteWeb?: string | null;
  horaires?: string | null;
  navLinksJson?: unknown;
  footerLinksJson?: unknown;
  contactEmailDestinataire?: string | null;
  contactChampsActifs?: unknown;
  contactMessageConfirmation?: string | null;
};

function parseLinks<T>(raw: unknown, fallback: T[]): T[] {
  if (!raw) return fallback;
  if (Array.isArray(raw)) return raw as T[];
  try { return JSON.parse(raw as string) as T[]; } catch { return fallback; }
}

function parseChampsActifs(raw: unknown): { telephone: boolean; sujet: boolean } {
  const defaults = { telephone: false, sujet: true };
  if (!raw) return defaults;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    return {
      telephone: typeof r.telephone === "boolean" ? r.telephone : defaults.telephone,
      sujet: typeof r.sujet === "boolean" ? r.sujet : defaults.sujet,
    };
  }
  try {
    const parsed = JSON.parse(raw as string) as Record<string, boolean>;
    return {
      telephone: typeof parsed.telephone === "boolean" ? parsed.telephone : defaults.telephone,
      sujet: typeof parsed.sujet === "boolean" ? parsed.sujet : defaults.sujet,
    };
  } catch { return defaults; }
}

type ContactData = { adresse?: string | null; telephone?: string | null; email?: string | null };

export default function GestionApparenceClient({ initialConfig, initialContact, egliseId }: { initialConfig: ConfigData | null; initialContact?: ContactData; egliseId?: number }) {
  const [form, setForm] = useState({
    couleurPrimaire: initialConfig?.couleurPrimaire ?? "#1e3a8a",
    couleurAccent: initialConfig?.couleurAccent ?? "#c59b2e",
    faviconUrl: initialConfig?.faviconUrl ?? "",
    cssPersonnalise: initialConfig?.cssPersonnalise ?? "",
    facebook: initialConfig?.facebook ?? "",
    youtube: initialConfig?.youtube ?? "",
    youtubeChannelId: initialConfig?.youtubeChannelId ?? "",
    instagram: initialConfig?.instagram ?? "",
    twitter: initialConfig?.twitter ?? "",
    whatsapp: initialConfig?.whatsapp ?? "",
    siteWeb: initialConfig?.siteWeb ?? "",
    horaires: initialConfig?.horaires ?? "",
    contactEmailDestinataire: initialConfig?.contactEmailDestinataire ?? "",
    contactMessageConfirmation: initialConfig?.contactMessageConfirmation ?? "",
  });
  const [champsActifs, setChampsActifs] = useState(
    parseChampsActifs(initialConfig?.contactChampsActifs)
  );
  const [contact, setContact] = useState({
    adresse: initialContact?.adresse ?? "",
    telephone: initialContact?.telephone ?? "",
    email: initialContact?.email ?? "",
  });
  const [navLinks, setNavLinks] = useState<NavLink[]>(
    parseLinks<NavLink>(initialConfig?.navLinksJson, [])
  );
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>(
    parseLinks<FooterLink>(initialConfig?.footerLinksJson, [])
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  }

  function updateContact(key: keyof typeof contact, value: string) {
    setContact((c) => ({ ...c, [key]: value }));
    setSuccess(false);
  }

  // --- Nav links helpers ---
  function addNavLink() {
    setNavLinks((l) => [...l, { label: "", href: "", externe: false }]);
  }
  function updateNavLink(i: number, field: keyof NavLink, value: string | boolean) {
    setNavLinks((l) => l.map((x, idx) => idx === i ? { ...x, [field]: value } : x));
  }
  function removeNavLink(i: number) {
    setNavLinks((l) => l.filter((_, idx) => idx !== i));
  }
  function moveNavLink(i: number, dir: -1 | 1) {
    setNavLinks((l) => {
      const next = [...l];
      const j = i + dir;
      if (j < 0 || j >= next.length) return l;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  // --- Footer links helpers ---
  function addFooterLink() {
    setFooterLinks((l) => [...l, { label: "", href: "" }]);
  }
  function updateFooterLink(i: number, field: keyof FooterLink, value: string) {
    setFooterLinks((l) => l.map((x, idx) => idx === i ? { ...x, [field]: value } : x));
  }
  function removeFooterLink(i: number) {
    setFooterLinks((l) => l.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/gestion/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...contact,
          navLinksJson: navLinks.filter((l) => l.label && l.href),
          footerLinksJson: footerLinks.filter((l) => l.label && l.href),
          contactChampsActifs: champsActifs,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      setSuccess(true);
    } finally { setLoading(false); }
  }

  const input = (key: keyof typeof form, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="label text-[13px] text-slate-700">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => updateField(key, e.target.value)}
        className="input"
        {...extra}
      />
    </div>
  );

  const section = (title: string, desc: string, children: React.ReactNode) => (
    <div className="card rounded-[14px] p-6 mb-5">
      <h3 className="font-bold text-foreground text-[15px] mb-1 pb-3 border-b border-slate-100">
        {title}
      </h3>
      {desc && <p className="text-[13px] text-muted-foreground mb-3.5">{desc}</p>}
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className="alert alert-success mb-5 font-semibold">
          <CheckCircle size={16} className="text-green-700" />
          Apparence sauvegardée avec succès
        </div>
      )}
      {error && (
        <div className="alert alert-danger mb-5">
          {error}
        </div>
      )}

      {section("Couleurs et identité visuelle", "",
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label text-[13px] text-slate-700">Couleur principale</label>
              <div className="flex gap-2.5 items-center">
                <input type="color" value={form.couleurPrimaire} onChange={(e) => updateField("couleurPrimaire", e.target.value)} className="w-11 h-[38px] border border-gray-300 rounded-[7px] cursor-pointer p-0.5" />
                <input value={form.couleurPrimaire} onChange={(e) => updateField("couleurPrimaire", e.target.value)} placeholder="#1e3a8a" className="input flex-1" />
              </div>
            </div>
            <div>
              <label className="label text-[13px] text-slate-700">Couleur accent</label>
              <div className="flex gap-2.5 items-center">
                <input type="color" value={form.couleurAccent} onChange={(e) => updateField("couleurAccent", e.target.value)} className="w-11 h-[38px] border border-gray-300 rounded-[7px] cursor-pointer p-0.5" />
                <input value={form.couleurAccent} onChange={(e) => updateField("couleurAccent", e.target.value)} placeholder="#c59b2e" className="input flex-1" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mb-4 px-4 py-3 bg-slate-50 rounded-[10px] items-center">
            <div className="w-10 h-10 rounded-full" style={{ background: form.couleurPrimaire }} />
            <div className="w-10 h-10 rounded-full" style={{ background: form.couleurAccent }} />
            <div className="text-[13px] text-muted-foreground">Aperçu de vos couleurs</div>
            <div className="flex-1 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold" style={{ background: form.couleurPrimaire }}>Bouton</div>
            <div className="flex-1 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold" style={{ background: form.couleurAccent }}>Accent</div>
          </div>
          <ImagePicker
            label="Favicon (icône dans l'onglet navigateur)"
            value={form.faviconUrl}
            onChange={(url) => updateField("faviconUrl", url)}
            egliseId={egliseId}
          />
        </>
      )}

      {section("Liens de navigation personnalisés", "Ajoutez des liens supplémentaires dans la barre de navigation de votre site public (après les liens standards).",
        <>
          <div className="flex flex-col gap-2 mb-3">
            {navLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center bg-slate-50 px-3 py-2.5 rounded-lg border border-border">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveNavLink(i, -1)} disabled={i === 0} className="bg-transparent border-none cursor-pointer text-slate-400 px-1 py-px flex items-center"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => moveNavLink(i, 1)} disabled={i === navLinks.length - 1} className="bg-transparent border-none cursor-pointer text-slate-400 px-1 py-px flex items-center"><ChevronDown size={14} /></button>
                </div>
                <input value={link.label} onChange={(e) => updateNavLink(i, "label", e.target.value)} placeholder="Libellé (ex: Dons)" className="input flex-1 py-[7px]! px-2.5! text-[13px]! rounded-md!" />
                <input value={link.href} onChange={(e) => updateNavLink(i, "href", e.target.value)} placeholder="URL (/c/dons ou https://...)" className="input flex-2 py-[7px]! px-2.5! text-[13px]! rounded-md!" />
                <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 cursor-pointer">
                  <input type="checkbox" checked={!!link.externe} onChange={(e) => updateNavLink(i, "externe", e.target.checked)} />
                  Ext.
                </label>
                <button type="button" onClick={() => removeNavLink(i)} className="bg-red-100 border border-red-300 text-red-700 rounded-md px-2 py-[5px] cursor-pointer shrink-0 flex items-center"><X size={13} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addNavLink} className="btn btn-outline btn-sm border-dashed border-slate-300 text-primary font-semibold">
            <Plus size={14} /> Ajouter un lien de navigation
          </button>
        </>
      )}

      {section("Liens du pied de page", "Liens additionnels affichés dans le footer de votre site (ex: FAQ, Dons, Politique de confidentialité).",
        <>
          <div className="flex flex-col gap-2 mb-3">
            {footerLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center bg-slate-50 px-3 py-2.5 rounded-lg border border-border">
                <input value={link.label} onChange={(e) => updateFooterLink(i, "label", e.target.value)} placeholder="Libellé (ex: FAQ)" className="input flex-1 py-[7px]! px-2.5! text-[13px]! rounded-md!" />
                <input value={link.href} onChange={(e) => updateFooterLink(i, "href", e.target.value)} placeholder="URL (/c/faq ou https://...)" className="input flex-2 py-[7px]! px-2.5! text-[13px]! rounded-md!" />
                <button type="button" onClick={() => removeFooterLink(i)} className="bg-red-100 border border-red-300 text-red-700 rounded-md px-2 py-[5px] cursor-pointer shrink-0 flex items-center"><X size={13} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addFooterLink} className="btn btn-outline btn-sm border-dashed border-slate-300 text-primary font-semibold">
            <Plus size={14} /> Ajouter un lien de pied de page
          </button>
        </>
      )}

      {section("Coordonnées de l'église", "",
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-[13px] text-slate-700">Téléphone</label>
            <input value={contact.telephone} onChange={(e) => updateContact("telephone", e.target.value)} placeholder="+243 XXX XXX XXX" className="input" />
          </div>
          <div>
            <label className="label text-[13px] text-slate-700">Email</label>
            <input type="email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="contact@eglise.org" className="input" />
          </div>
          <div className="col-span-full">
            <label className="label text-[13px] text-slate-700">Adresse</label>
            <textarea value={contact.adresse} onChange={(e) => updateContact("adresse", e.target.value)} rows={2} placeholder="Avenue de l'Église, Kinshasa…" className="input textarea" />
          </div>
        </div>
      )}

      {section("Réseaux sociaux et horaires", "",
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {input("facebook", "Facebook (URL)", { placeholder: "https://facebook.com/..." })}
            {input("youtube", "YouTube (URL)", { placeholder: "https://youtube.com/..." })}
            <div>
              {input("youtubeChannelId", "YouTube Channel ID (direct auto)", { placeholder: "UCxxxxxxxxxxxxxxxxxxxxxxxxx" })}
              <p className="text-[11px] text-gray-500 mt-0.5">
                Trouvez l&apos;ID dans YouTube Studio → Paramètres → Informations sur la chaîne.
                Il commence par <strong>UC</strong>. Le direct s&apos;affiche <em>automatiquement</em> sur votre site.
              </p>
            </div>
            {input("instagram", "Instagram (URL)", { placeholder: "https://instagram.com/..." })}
            {input("twitter", "Twitter / X (URL)", { placeholder: "https://twitter.com/..." })}
            {input("whatsapp", "WhatsApp (numéro)", { placeholder: "+243..." })}
            {input("siteWeb", "Site web externe", { placeholder: "https://..." })}
          </div>
          <div>
            <label className="label text-[13px] text-slate-700">Horaires des cultes</label>
            <textarea
              value={form.horaires}
              onChange={(e) => updateField("horaires", e.target.value)}
              rows={3}
              placeholder="Ex: Dimanche 9h - 12h30, Mercredi 18h - 20h"
              className="input textarea"
            />
          </div>
        </div>
      )}

      {section("Formulaire de contact", "Configurez le formulaire de contact affiché sur votre site public dans la section 'Contact'.",
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="label text-[13px] text-slate-700">Email destinataire des messages</label>
            <input
              type="email"
              value={form.contactEmailDestinataire}
              onChange={(e) => updateField("contactEmailDestinataire", e.target.value)}
              placeholder="contact@eglise.org"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-1">Les messages reçus seront transmis à cette adresse par email.</p>
          </div>

          <div>
            <label className="label text-[13px] text-slate-700 mb-2">Champs affichés dans le formulaire</label>
            <div className="flex flex-col gap-2 bg-slate-50 rounded-lg px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-700 flex-1">Nom et email</span>
                <span className="text-xs text-slate-400 bg-border rounded px-2 py-0.5">Toujours affiché</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={champsActifs.sujet}
                  onChange={(e) => setChampsActifs((c) => ({ ...c, sujet: e.target.checked }))}
                />
                <span className="text-[13px] text-slate-700">Champ Sujet</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={champsActifs.telephone}
                  onChange={(e) => setChampsActifs((c) => ({ ...c, telephone: e.target.checked }))}
                />
                <span className="text-[13px] text-slate-700">Champ Téléphone</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-700 flex-1">Message</span>
                <span className="text-xs text-slate-400 bg-border rounded px-2 py-0.5">Toujours affiché</span>
              </div>
            </div>
          </div>

          <div>
            <label className="label text-[13px] text-slate-700">Message de confirmation après envoi</label>
            <textarea
              value={form.contactMessageConfirmation}
              onChange={(e) => updateField("contactMessageConfirmation", e.target.value)}
              rows={2}
              placeholder="Merci pour votre message ! Nous vous répondrons dans les plus brefs délais."
              className="input textarea"
            />
          </div>
        </div>
      )}

      {section("CSS personnalisé (avancé)", "",
        <>
          <p className="text-muted-foreground text-[13px] mb-2.5">
            CSS supplémentaire injecté sur tout votre site public. Utilisez des variables <code>--church-primary</code> et <code>--church-accent</code>.
          </p>
          <textarea
            value={form.cssPersonnalise}
            onChange={(e) => updateField("cssPersonnalise", e.target.value)}
            rows={8}
            placeholder=".ma-classe { color: var(--church-primary); }"
            className="input textarea text-[13px]! font-mono bg-slate-50"
          />
        </>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary rounded-[9px] px-7 py-[11px] text-sm font-bold ${loading ? "opacity-70" : ""}`}
        >
          {loading ? "Sauvegarde…" : "Sauvegarder l'apparence"}
        </button>
      </div>
    </form>
  );
}
