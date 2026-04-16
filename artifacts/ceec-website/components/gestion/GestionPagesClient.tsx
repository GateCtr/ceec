"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

type Page = {
  id: number;
  titre: string;
  slug: string;
  type: string;
  publie: boolean;
  ordre: number;
  sectionsCount: number;
};

const typeLabels: Record<string, string> = {
  accueil: "Accueil",
  about: "À propos",
  contact: "Contact",
  departements: "Ministères",
  custom: "Page libre",
};

const typeOptions = Object.entries(typeLabels);

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/[àâäá]/g, "a").replace(/[éèêë]/g, "e").replace(/[îïí]/g, "i")
    .replace(/[ôöó]/g, "o").replace(/[ûüú]/g, "u")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

function EditPageForm({ page, onSave, onCancel }: { page: Page; onSave: (d: Partial<Page>) => Promise<void>; onCancel: () => void }) {
  const [titre, setTitre] = useState(page.titre);
  const [slug, setSlug] = useState(page.slug);
  const [type, setType] = useState(page.type);
  const [saving, setSaving] = useState(false);
  const inp: React.CSSProperties = { width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
  return (
    <tr>
      <td colSpan={5} style={{ padding: 0 }}>
        <div style={{ background: "#f8fafc", padding: "16px 20px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Titre</label>
              <input value={titre} onChange={(e) => { setTitre(e.target.value); setSlug(slugify(e.target.value)); }} style={inp} placeholder="Titre de la page" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={inp}>
                {typeOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button disabled={saving} onClick={async () => { setSaving(true); await onSave({ titre, slug, type }); setSaving(false); }}
                style={{ padding: "7px 16px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "…" : "Sauvegarder"}
              </button>
              <button onClick={onCancel} style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 13, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function GestionPagesClient({ initialPages }: { initialPages: Page[] }) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  async function handleEdit(id: number, data: Partial<Page>) {
    const res = await fetch(`/api/gestion/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setPages((ps) => ps.map((p) => p.id === id ? { ...p, ...updated } : p));
      setEditingId(null);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 20 }}>
        <Link
          href="/gestion/pages/nouveau"
          style={{ padding: "9px 20px", borderRadius: 9, background: "#1e3a8a", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 14 }}
        >
          + Créer une page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <FileText size={40} color="#e2e8f0" />
          </div>
          <h3 style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Aucune page configurée</h3>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Créez votre première page personnalisée pour enrichir votre site public.</p>
          <Link href="/gestion/pages/nouveau" style={{ padding: "10px 24px", borderRadius: 9, background: "#1e3a8a", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Créer une page</Link>
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
                <React.Fragment key={page.id}>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{page.titre}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>/c/{page.slug}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{typeLabels[page.type] ?? page.type}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{page.sectionsCount} section{page.sectionsCount !== 1 ? "s" : ""}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: page.publie ? "#dcfce7" : "#f1f5f9", color: page.publie ? "#15803d" : "#64748b" }}>
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
                          onClick={() => setEditingId(editingId === page.id ? null : page.id)}
                          style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #bfdbfe", background: editingId === page.id ? "#bfdbfe" : "#eff6ff", fontSize: 12, fontWeight: 600, color: "#1e3a8a", cursor: "pointer" }}
                        >
                          Éditer
                        </button>
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
                  {editingId === page.id && (
                    <EditPageForm page={page} onSave={(d) => handleEdit(page.id, d)} onCancel={() => setEditingId(null)} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
