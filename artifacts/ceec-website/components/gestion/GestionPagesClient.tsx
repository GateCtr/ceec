"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Page = {
  id: number;
  titre: string;
  slug: string;
  type: string;
  publie: boolean;
  ordre: number;
  sectionsCount: number;
};

type FormData = {
  titre: string;
  slug: string;
  type: string;
  publie: boolean;
};

const typeLabels: Record<string, string> = {
  accueil: "Accueil",
  about: "À propos",
  contact: "Contact",
  departements: "Ministères",
  custom: "Page libre",
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const emptyForm: FormData = { titre: "", slug: "", type: "custom", publie: false };

export default function GestionPagesClient({ initialPages }: { initialPages: Page[] }) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "titre" && !f.slug) next.slug = slugify(value as string);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
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
      setPages((p) => [...p, { ...created, sectionsCount: 0 }]);
      setShowForm(false);
      setForm(emptyForm);
    } finally { setLoading(false); }
  }

  async function togglePublish(page: Page) {
    const res = await fetch(`/api/gestion/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publie: !page.publie }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPages((ps) => ps.map((p) => (p.id === page.id ? { ...p, publie: updated.publie } : p)));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette page et toutes ses sections ?")) return;
    const res = await fetch(`/api/gestion/pages/${id}`, { method: "DELETE" });
    if (res.ok) setPages((ps) => ps.filter((p) => p.id !== id));
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); setForm(emptyForm); }}
          style={{ padding: "9px 20px", borderRadius: 9, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          + Créer une page
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 15 }}>Nouvelle page</h3>
          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Titre *</label>
                <input
                  required value={form.titre}
                  onChange={(e) => updateField("titre", e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
                  placeholder="Ex: À propos de nous"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", slugify(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
                  placeholder="a-propos"
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
                >
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
                <input type="checkbox" id="publie" checked={form.publie} onChange={(e) => updateField("publie", e.target.checked)} />
                <label htmlFor="publie" style={{ fontSize: 14, color: "#374151" }}>Publier immédiatement</label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 14, cursor: "pointer" }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: "9px 18px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Création…" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {pages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <h3 style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Aucune page configurée</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Créez votre première page personnalisée pour enrichir votre site public.</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>TITRE</th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>TYPE</th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>SECTIONS</th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>STATUT</th>
                <th style={{ padding: "11px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#64748b" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{page.titre}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>/c/{page.slug}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>
                    {typeLabels[page.type] ?? page.type}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
                    {page.sectionsCount} section{page.sectionsCount !== 1 ? "s" : ""}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                      background: page.publie ? "#dcfce7" : "#f1f5f9",
                      color: page.publie ? "#15803d" : "#64748b",
                    }}>
                      {page.publie ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <Link
                        href={`/gestion/pages/${page.id}`}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none" }}
                      >
                        Sections
                      </Link>
                      <button
                        onClick={() => togglePublish(page)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: page.publie ? "#fef3c7" : "#dcfce7", fontSize: 12, fontWeight: 600, color: page.publie ? "#b45309" : "#15803d", cursor: "pointer" }}
                      >
                        {page.publie ? "Dépublier" : "Publier"}
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, fontWeight: 600, color: "#b91c1c", cursor: "pointer" }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
