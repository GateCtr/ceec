"use client";

import React, { useState } from "react";
import Link from "next/link";

type Section = {
  id: number;
  type: string;
  ordre: number;
  config: Record<string, unknown>;
};

type Page = {
  id: number;
  titre: string;
  slug: string;
  type: string;
  publie: boolean;
  sections: Section[];
};

const SECTION_TYPES = [
  { value: "hero", label: "Bannière principale (Hero)", description: "Grand titre avec image de fond et bouton" },
  { value: "texte_image", label: "Texte + Image", description: "Bloc texte côte à côte avec une image" },
  { value: "annonces", label: "Annonces récentes", description: "Affiche les dernières annonces de l'église" },
  { value: "evenements", label: "Événements à venir", description: "Affiche les prochains événements" },
  { value: "live", label: "Live / Vidéo", description: "Lecteur YouTube épinglé ou en direct" },
  { value: "contact", label: "Contact", description: "Formulaire de contact et carte" },
  { value: "departements", label: "Ministères / Départements", description: "Grille des départements de l'église" },
  { value: "galerie", label: "Galerie photos", description: "Mosaïque d'images" },
];

const SECTION_FIELDS: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string }>> = {
  hero: [
    { key: "titre", label: "Titre principal", type: "text", placeholder: "Bienvenue à notre église" },
    { key: "sousTitre", label: "Sous-titre", type: "text", placeholder: "Venez tel que vous êtes" },
    { key: "imageUrl", label: "Image de fond (URL)", type: "text", placeholder: "https://..." },
    { key: "ctaTexte", label: "Texte du bouton", type: "text", placeholder: "En savoir plus" },
    { key: "ctaLien", label: "Lien du bouton", type: "text", placeholder: "/c/a-propos" },
  ],
  texte_image: [
    { key: "titre", label: "Titre", type: "text", placeholder: "Notre mission" },
    { key: "texte", label: "Texte", type: "textarea", placeholder: "Décrivez ici..." },
    { key: "imageUrl", label: "Image (URL)", type: "text", placeholder: "https://..." },
    { key: "imageGauche", label: "Image à gauche ?", type: "checkbox" },
  ],
  live: [
    { key: "titre", label: "Titre de la section", type: "text", placeholder: "Notre culte en ligne" },
  ],
  contact: [
    { key: "titre", label: "Titre", type: "text", placeholder: "Contactez-nous" },
    { key: "texte", label: "Texte introductif", type: "textarea", placeholder: "" },
    { key: "adresse", label: "Adresse", type: "text", placeholder: "123 rue de l'Église, Kinshasa" },
    { key: "email", label: "Email", type: "text", placeholder: "info@eglise.org" },
    { key: "telephone", label: "Téléphone", type: "text", placeholder: "+243..." },
  ],
  departements: [
    { key: "titre", label: "Titre de la section", type: "text", placeholder: "Nos ministères" },
  ],
  annonces: [
    { key: "titre", label: "Titre de la section", type: "text", placeholder: "Annonces" },
    { key: "limite", label: "Nombre d'annonces affichées", type: "text", placeholder: "3" },
  ],
  evenements: [
    { key: "titre", label: "Titre de la section", type: "text", placeholder: "Événements" },
    { key: "limite", label: "Nombre d'événements affichés", type: "text", placeholder: "3" },
  ],
  galerie: [
    { key: "titre", label: "Titre de la section", type: "text", placeholder: "Galerie" },
    { key: "images", label: "URLs des images (une par ligne)", type: "textarea", placeholder: "https://...\nhttps://..." },
  ],
};

function SectionConfigForm({
  type, config, onChange,
}: { type: string; config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const fields = SECTION_FIELDS[type] ?? [];

  if (fields.length === 0) {
    return <p style={{ color: "#64748b", fontSize: 13 }}>Aucune configuration disponible pour ce type de section.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map((f) => {
        const val = config[f.key];
        if (f.type === "checkbox") {
          return (
            <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={!!val} onChange={(e) => onChange({ ...config, [f.key]: e.target.checked })} />
              {f.label}
            </label>
          );
        }
        if (f.type === "textarea") {
          return (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>{f.label}</label>
              <textarea
                value={(val as string) ?? ""}
                onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={3}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
          );
        }
        return (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>{f.label}</label>
            <input
              value={(val as string) ?? ""}
              onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function GestionPageDetailClient({ page: initialPage }: { page: Page }) {
  const [page, setPage] = useState<Page>(initialPage);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedType, setSelectedType] = useState("hero");
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [savingSection, setSavingSection] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openSection(s: Section) {
    if (expandedSection === s.id) {
      setExpandedSection(null);
    } else {
      setExpandedSection(s.id);
      setEditingConfig({ ...s.config });
    }
  }

  async function handleAddSection() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/gestion/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page.id, type: selectedType, config: {} }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      const created = await res.json();
      setPage((p) => ({ ...p, sections: [...p.sections, { ...created, config: {} }] }));
      setShowAddSection(false);
      setExpandedSection(created.id);
      setEditingConfig({});
    } finally { setLoading(false); }
  }

  async function saveSection(sectionId: number) {
    setSavingSection(sectionId); setError(null);
    try {
      const res = await fetch(`/api/gestion/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: editingConfig }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      const updated = await res.json();
      setPage((p) => ({
        ...p,
        sections: p.sections.map((s) => s.id === sectionId ? { ...s, config: updated.config ?? {} } : s),
      }));
      setExpandedSection(null);
    } finally { setSavingSection(null); }
  }

  async function deleteSection(id: number) {
    if (!confirm("Supprimer cette section ?")) return;
    const res = await fetch(`/api/gestion/sections/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPage((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== id) }));
      if (expandedSection === id) setExpandedSection(null);
    }
  }

  async function moveSection(index: number, direction: "up" | "down") {
    const sections = [...page.sections];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const [a, b] = [sections[index], sections[swapIdx]];
    sections[index] = { ...b, ordre: a.ordre };
    sections[swapIdx] = { ...a, ordre: b.ordre };

    setPage((p) => ({ ...p, sections }));

    await Promise.all([
      fetch(`/api/gestion/sections/${sections[index].id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ordre: sections[index].ordre }),
      }),
      fetch(`/api/gestion/sections/${sections[swapIdx].id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ordre: sections[swapIdx].ordre }),
      }),
    ]);
  }

  async function togglePublish() {
    const res = await fetch(`/api/gestion/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publie: !page.publie }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPage((p) => ({ ...p, publie: updated.publie }));
    }
  }

  const sectionLabel = (type: string) => SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <Link href="/gestion/pages" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            ← Retour aux pages
          </Link>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{page.titre}</h1>
          <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>/c/{page.slug}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
              background: page.publie ? "#dcfce7" : "#f1f5f9",
              color: page.publie ? "#15803d" : "#64748b",
            }}>
              {page.publie ? "Publié" : "Brouillon"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={togglePublish}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: page.publie ? "#fef3c7" : "#dcfce7", color: page.publie ? "#b45309" : "#15803d", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            {page.publie ? "Dépublier" : "Publier"}
          </button>
          <button
            onClick={() => setShowAddSection(true)}
            style={{ padding: "9px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            + Ajouter une section
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {showAddSection && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>Choisir le type de section</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
            {SECTION_TYPES.map((t) => (
              <div
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                style={{
                  padding: "12px 14px", borderRadius: 10, border: `2px solid ${selectedType === t.value ? "#1e3a8a" : "#e2e8f0"}`,
                  background: selectedType === t.value ? "#eff6ff" : "white", cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{t.description}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowAddSection(false)} style={{ padding: "9px 18px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 14, cursor: "pointer" }}>
              Annuler
            </button>
            <button onClick={handleAddSection} disabled={loading} style={{ padding: "9px 18px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {page.sections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧩</div>
          <h3 style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Aucune section</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Ajoutez des sections pour composer le contenu de cette page.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {page.sections.map((section, idx) => (
            <div key={section.id} style={{ background: "white", borderRadius: 12, border: `2px solid ${expandedSection === section.id ? "#1e3a8a" : "#e2e8f0"}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <button onClick={() => moveSection(idx, "up")} disabled={idx === 0}
                    style={{ width: 26, height: 22, border: "1px solid #e2e8f0", borderRadius: 5, background: idx === 0 ? "#f8fafc" : "white", cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 11, color: idx === 0 ? "#94a3b8" : "#374151" }}>
                    ▲
                  </button>
                  <button onClick={() => moveSection(idx, "down")} disabled={idx === page.sections.length - 1}
                    style={{ width: 26, height: 22, border: "1px solid #e2e8f0", borderRadius: 5, background: idx === page.sections.length - 1 ? "#f8fafc" : "white", cursor: idx === page.sections.length - 1 ? "not-allowed" : "pointer", fontSize: 11, color: idx === page.sections.length - 1 ? "#94a3b8" : "#374151" }}>
                    ▼
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{sectionLabel(section.type)}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8" }}>
                    {(section.config?.titre as string) ? `— ${String(section.config.titre).slice(0, 40)}` : ""}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 99 }}>
                  #{idx + 1}
                </span>
                <button
                  onClick={() => openSection(section)}
                  style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #e2e8f0", background: expandedSection === section.id ? "#eff6ff" : "white", fontSize: 12, fontWeight: 600, color: "#1e3a8a", cursor: "pointer" }}
                >
                  {expandedSection === section.id ? "Fermer" : "Configurer"}
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, color: "#b91c1c", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              {expandedSection === section.id && (
                <div style={{ borderTop: "1px solid #e2e8f0", padding: "16px 20px", background: "#f8fafc" }}>
                  <SectionConfigForm
                    type={section.type}
                    config={editingConfig}
                    onChange={setEditingConfig}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                    <button
                      onClick={() => saveSection(section.id)}
                      disabled={savingSection === section.id}
                      style={{ padding: "9px 20px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: savingSection === section.id ? 0.7 : 1 }}
                    >
                      {savingSection === section.id ? "Sauvegarde…" : "Sauvegarder"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
