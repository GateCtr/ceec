"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "custom", label: "Page libre" },
  { value: "about", label: "À propos" },
  { value: "contact", label: "Contact" },
  { value: "departements", label: "Ministères / Départements" },
  { value: "accueil", label: "Accueil" },
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function GestionNouvellePageClient() {
  const router = useRouter();
  const [form, setForm] = useState({ titre: "", slug: "", type: "custom", publie: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTitre(titre: string) {
    setForm((f) => ({ ...f, titre, ...(f.slug === "" || f.slug === slugify(f.titre) ? { slug: slugify(titre) } : {}) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/gestion/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.titre) }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      const created = await res.json();
      router.push(`/gestion/pages/${created.id}`);
    } finally { setLoading(false); }
  }

  return (
    <>
      <Link href="/gestion/pages" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        <ArrowLeft size={13} /> Retour aux pages
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Nouvelle page</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Configurez les informations de base, puis ajoutez des sections pour composer son contenu.</p>
      </div>

      <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Titre de la page *</label>
            <input
              required value={form.titre}
              onChange={(e) => updateTitre(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }}
              placeholder="Ex: À propos de notre église"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Slug (URL)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#94a3b8", flexShrink: 0 }}>/c/</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
                placeholder="a-propos"
              />
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>URL publique de la page. Généré automatiquement depuis le titre.</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Type de page</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
            >
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Le type conditionne les sections disponibles (sans impact technique pour les pages libres).</p>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={form.publie} onChange={(e) => setForm((f) => ({ ...f, publie: e.target.checked }))} />
            <span style={{ color: "#374151", fontWeight: 500 }}>Publier immédiatement</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>(si non coché, la page sera en brouillon)</span>
          </label>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 4, borderTop: "1px solid #f1f5f9" }}>
            <Link
              href="/gestion/pages"
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", fontSize: 14, color: "#374151", textDecoration: "none", fontWeight: 500 }}
            >
              Annuler
            </Link>
            <button
              type="submit" disabled={loading}
              style={{ padding: "10px 24px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Création…" : "Créer et configurer les sections →"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
