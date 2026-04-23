"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Home, Settings, Eye, EyeOff } from "lucide-react";

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

function HomePageCard({ homePage, onCreated }: { homePage: Page | null; onCreated: (page: Page) => void }) {
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [localPage, setLocalPage] = useState<Page | null>(homePage);

  async function createHomePage() {
    setCreating(true);
    try {
      const res = await fetch("/api/gestion/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: "Page d'accueil", slug: "accueil", type: "accueil" }),
      });
      if (res.ok) {
        const page = await res.json();
        const newPage = { ...page, sectionsCount: 0 };
        setLocalPage(newPage);
        onCreated(newPage);
      }
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish() {
    if (!localPage) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/gestion/pages/${localPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publie: !localPage.publie }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalPage((p) => p ? { ...p, publie: updated.publie } : p);
      }
    } finally {
      setPublishing(false);
    }
  }

  const page = localPage;

  return (
    <div style={{
      background: page ? "white" : "#f0f7ff",
      border: `2px solid ${page ? "#bfdbfe" : "#93c5fd"}`,
      borderRadius: 14,
      padding: "1.25rem 1.5rem",
      marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "linear-gradient(135deg, #1e3a8a, #1e5aa8)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Home size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Page d&apos;accueil du site</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {page
                ? `${page.sectionsCount} section${page.sectionsCount !== 1 ? "s" : ""} configurée${page.sectionsCount !== 1 ? "s" : ""} · ${page.publie ? "✅ Publiée" : "⚪ Brouillon"}`
                : "Non configurée — la page par défaut est affichée"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {page ? (
            <>
              <a
                href="/c"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "none" }}
              >
                Voir
              </a>
              <button
                onClick={togglePublish}
                disabled={publishing}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: page.publie ? "#fef3c7" : "#dcfce7", color: page.publie ? "#b45309" : "#15803d", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {page.publie ? <><EyeOff size={13} /> Dépublier</> : <><Eye size={13} /> Publier</>}
              </button>
              <Link
                href={`/gestion/pages/${page.id}/sections`}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Settings size={13} /> Configurer les sections
              </Link>
            </>
          ) : (
            <button
              onClick={createHomePage}
              disabled={creating}
              style={{ padding: "8px 20px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: creating ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} />
              {creating ? "Création…" : "Initialiser la page d'accueil"}
            </button>
          )}
        </div>
      </div>

      {!page && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1d4ed8" }}>
          💡 Sans page d&apos;accueil configurée, votre site affiche automatiquement vos annonces et événements récents. Initialisez-la pour personnaliser les sections, le hero, et l&apos;ordre du contenu.
        </div>
      )}
    </div>
  );
}

export default function GestionPagesClient({ initialPages, homePage }: { initialPages: Page[]; homePage: Page | null }) {
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
      <HomePageCard homePage={homePage} onCreated={(p) => setPages((ps) => [...ps, p])} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#374151", margin: 0 }}>Pages supplémentaires</h2>
        <Link
          href="/gestion/pages/nouveau"
          style={{ padding: "9px 20px", borderRadius: 9, background: "#1e3a8a", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> Créer une page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <FileText size={36} color="#e2e8f0" />
          </div>
          <h3 style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Aucune page supplémentaire</h3>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Créez des pages libres (À propos, Contact, Ministères…) pour enrichir votre site.</p>
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
                          href={`/gestion/pages/${page.id}/sections`}
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
