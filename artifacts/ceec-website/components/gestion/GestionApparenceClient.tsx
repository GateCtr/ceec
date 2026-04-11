"use client";

import React, { useState } from "react";

type NavLink = { label: string; href: string; externe?: boolean };
type FooterLink = { label: string; href: string };

type ConfigData = {
  couleurPrimaire?: string | null;
  couleurAccent?: string | null;
  faviconUrl?: string | null;
  cssPersonnalise?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  siteWeb?: string | null;
  horaires?: string | null;
  navLinksJson?: unknown;
  footerLinksJson?: unknown;
};

function parseLinks<T>(raw: unknown, fallback: T[]): T[] {
  if (!raw) return fallback;
  if (Array.isArray(raw)) return raw as T[];
  try { return JSON.parse(raw as string) as T[]; } catch { return fallback; }
}

type ContactData = { adresse?: string | null; telephone?: string | null; email?: string | null };

export default function GestionApparenceClient({ initialConfig, initialContact }: { initialConfig: ConfigData | null; initialContact?: ContactData }) {
  const [form, setForm] = useState({
    couleurPrimaire: initialConfig?.couleurPrimaire ?? "#1e3a8a",
    couleurAccent: initialConfig?.couleurAccent ?? "#c59b2e",
    faviconUrl: initialConfig?.faviconUrl ?? "",
    cssPersonnalise: initialConfig?.cssPersonnalise ?? "",
    facebook: initialConfig?.facebook ?? "",
    youtube: initialConfig?.youtube ?? "",
    instagram: initialConfig?.instagram ?? "",
    twitter: initialConfig?.twitter ?? "",
    whatsapp: initialConfig?.whatsapp ?? "",
    siteWeb: initialConfig?.siteWeb ?? "",
    horaires: initialConfig?.horaires ?? "",
  });
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
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      setSuccess(true);
    } finally { setLoading(false); }
  }

  const input = (key: keyof typeof form, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>{label}</label>
      <input
        value={form[key]}
        onChange={(e) => updateField(key, e.target.value)}
        style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
        {...extra}
      />
    </div>
  );

  const section = (title: string, desc: string, children: React.ReactNode) => (
    <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 20 }}>
      <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 4, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </h3>
      {desc && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>{desc}</p>}
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div style={{ background: "#dcfce7", color: "#15803d", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
          ✓ Apparence sauvegardée avec succès
        </div>
      )}
      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {section("Couleurs et identité visuelle", "",
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Couleur principale</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={form.couleurPrimaire} onChange={(e) => updateField("couleurPrimaire", e.target.value)} style={{ width: 44, height: 38, border: "1px solid #d1d5db", borderRadius: 7, cursor: "pointer", padding: 2 }} />
                <input value={form.couleurPrimaire} onChange={(e) => updateField("couleurPrimaire", e.target.value)} placeholder="#1e3a8a" style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14 }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Couleur accent</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={form.couleurAccent} onChange={(e) => updateField("couleurAccent", e.target.value)} style={{ width: 44, height: 38, border: "1px solid #d1d5db", borderRadius: 7, cursor: "pointer", padding: 2 }} />
                <input value={form.couleurAccent} onChange={(e) => updateField("couleurAccent", e.target.value)} placeholder="#c59b2e" style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14 }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: form.couleurPrimaire }} />
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: form.couleurAccent }} />
            <div style={{ fontSize: 13, color: "#64748b" }}>Aperçu de vos couleurs</div>
            <div style={{ flex: 1, height: 32, borderRadius: 8, background: form.couleurPrimaire, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 600 }}>Bouton</div>
            <div style={{ flex: 1, height: 32, borderRadius: 8, background: form.couleurAccent, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 600 }}>Accent</div>
          </div>
          {input("faviconUrl", "URL du favicon (icône dans l'onglet)", { placeholder: "https://..." })}
        </>
      )}

      {section("Liens de navigation personnalisés", "Ajoutez des liens supplémentaires dans la barre de navigation de votre site public (après les liens standards).",
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {navLinks.map((link, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button type="button" onClick={() => moveNavLink(i, -1)} disabled={i === 0} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: "0 4px", lineHeight: 1 }}>▲</button>
                  <button type="button" onClick={() => moveNavLink(i, 1)} disabled={i === navLinks.length - 1} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: "0 4px", lineHeight: 1 }}>▼</button>
                </div>
                <input value={link.label} onChange={(e) => updateNavLink(i, "label", e.target.value)} placeholder="Libellé (ex: Dons)" style={{ flex: 1, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
                <input value={link.href} onChange={(e) => updateNavLink(i, "href", e.target.value)} placeholder="URL (/c/dons ou https://...)" style={{ flex: 2, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", flexShrink: 0, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!link.externe} onChange={(e) => updateNavLink(i, "externe", e.target.checked)} />
                  Ext.
                </label>
                <button type="button" onClick={() => removeNavLink(i)} style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addNavLink} style={{ padding: "8px 16px", borderRadius: 7, border: "1px dashed #cbd5e1", background: "white", fontSize: 13, color: "#1e3a8a", cursor: "pointer", fontWeight: 600 }}>
            + Ajouter un lien de navigation
          </button>
        </>
      )}

      {section("Liens du pied de page", "Liens additionnels affichés dans le footer de votre site (ex: FAQ, Dons, Politique de confidentialité).",
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {footerLinks.map((link, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <input value={link.label} onChange={(e) => updateFooterLink(i, "label", e.target.value)} placeholder="Libellé (ex: FAQ)" style={{ flex: 1, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
                <input value={link.href} onChange={(e) => updateFooterLink(i, "href", e.target.value)} placeholder="URL (/c/faq ou https://...)" style={{ flex: 2, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
                <button type="button" onClick={() => removeFooterLink(i)} style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addFooterLink} style={{ padding: "8px 16px", borderRadius: 7, border: "1px dashed #cbd5e1", background: "white", fontSize: 13, color: "#1e3a8a", cursor: "pointer", fontWeight: 600 }}>
            + Ajouter un lien de pied de page
          </button>
        </>
      )}

      {section("Coordonnées de l'église", "",
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Téléphone</label>
            <input value={contact.telephone} onChange={(e) => updateContact("telephone", e.target.value)} placeholder="+243 XXX XXX XXX" style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Email</label>
            <input type="email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="contact@eglise.org" style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Adresse</label>
            <textarea value={contact.adresse} onChange={(e) => updateContact("adresse", e.target.value)} rows={2} placeholder="Avenue de l'Église, Kinshasa…" style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
          </div>
        </div>
      )}

      {section("Réseaux sociaux et horaires", "",
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {input("facebook", "Facebook (URL)", { placeholder: "https://facebook.com/..." })}
            {input("youtube", "YouTube (URL)", { placeholder: "https://youtube.com/..." })}
            {input("instagram", "Instagram (URL)", { placeholder: "https://instagram.com/..." })}
            {input("twitter", "Twitter / X (URL)", { placeholder: "https://twitter.com/..." })}
            {input("whatsapp", "WhatsApp (numéro)", { placeholder: "+243..." })}
            {input("siteWeb", "Site web externe", { placeholder: "https://..." })}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Horaires des cultes</label>
            <textarea
              value={form.horaires}
              onChange={(e) => updateField("horaires", e.target.value)}
              rows={3}
              placeholder="Ex: Dimanche 9h - 12h30, Mercredi 18h - 20h"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
            />
          </div>
        </div>
      )}

      {section("CSS personnalisé (avancé)", "",
        <>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>
            CSS supplémentaire injecté sur tout votre site public. Utilisez des variables <code>--church-primary</code> et <code>--church-accent</code>.
          </p>
          <textarea
            value={form.cssPersonnalise}
            onChange={(e) => updateField("cssPersonnalise", e.target.value)}
            rows={8}
            placeholder=".ma-classe { color: var(--church-primary); }"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 13, boxSizing: "border-box", resize: "vertical", fontFamily: "monospace", background: "#f8fafc" }}
          />
        </>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "11px 28px", borderRadius: 9, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Sauvegarde…" : "Sauvegarder l'apparence"}
        </button>
      </div>
    </form>
  );
}
