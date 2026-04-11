"use client";

import React, { useState } from "react";

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
};

export default function GestionApparenceClient({ initialConfig }: { initialConfig: ConfigData | null }) {
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/gestion/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 20 }}>
      <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </h3>
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

      {section("Couleurs et identité visuelle",
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Couleur principale</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="color"
                  value={form.couleurPrimaire}
                  onChange={(e) => updateField("couleurPrimaire", e.target.value)}
                  style={{ width: 44, height: 38, border: "1px solid #d1d5db", borderRadius: 7, cursor: "pointer", padding: 2 }}
                />
                <input
                  value={form.couleurPrimaire}
                  onChange={(e) => updateField("couleurPrimaire", e.target.value)}
                  placeholder="#1e3a8a"
                  style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14 }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Couleur accent</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="color"
                  value={form.couleurAccent}
                  onChange={(e) => updateField("couleurAccent", e.target.value)}
                  style={{ width: 44, height: 38, border: "1px solid #d1d5db", borderRadius: 7, cursor: "pointer", padding: 2 }}
                />
                <input
                  value={form.couleurAccent}
                  onChange={(e) => updateField("couleurAccent", e.target.value)}
                  placeholder="#c59b2e"
                  style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14 }}
                />
              </div>
            </div>
          </div>
          {/* Color preview */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: form.couleurPrimaire }} />
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: form.couleurAccent }} />
            <div style={{ fontSize: 13, color: "#64748b" }}>Aperçu de vos couleurs</div>
            <div style={{ flex: 1, height: 32, borderRadius: 8, background: form.couleurPrimaire, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 600 }}>
              Bouton
            </div>
            <div style={{ flex: 1, height: 32, borderRadius: 8, background: form.couleurAccent, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 600 }}>
              Accent
            </div>
          </div>
          {input("faviconUrl", "URL du favicon (icône dans l'onglet)", { placeholder: "https://..." })}
        </>
      )}

      {section("Réseaux sociaux et contact",
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

      {section("CSS personnalisé (avancé)",
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
