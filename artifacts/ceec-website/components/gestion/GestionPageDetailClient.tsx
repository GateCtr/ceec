"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutGrid, GripVertical, X, ArrowLeft, ExternalLink, Plus, Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function ConfirmDeleteDialog({
  onConfirm, onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: "2rem", maxWidth: 400, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <AlertTriangle size={36} color="#f59e0b" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", textAlign: "center", marginBottom: 8 }}>
          Supprimer cette section ?
        </h3>
        <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          Cette action est irréversible. La section et sa configuration seront définitivement supprimées.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{ padding: "9px 22px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "#dc2626", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableSectionCard({
  section,
  idx,
  totalCount,
  isExpanded,
  savingSection,
  editingConfig,
  onToggle,
  onSave,
  onDeleteRequest,
  onConfigChange,
}: {
  section: Section;
  idx: number;
  totalCount: number;
  isExpanded: boolean;
  savingSection: number | null;
  editingConfig: Record<string, unknown>;
  onToggle: (s: Section) => void;
  onSave: (id: number) => void;
  onDeleteRequest: (id: number) => void;
  onConfigChange: (c: Record<string, unknown>) => void;
}) {
  const sectionLabel = (type: string) => SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: "white",
    borderRadius: 12,
    border: `2px solid ${isExpanded ? "#1e3a8a" : isDragging ? "#93c5fd" : "#e2e8f0"}`,
    overflow: "hidden",
    cursor: "default",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <div
          {...attributes}
          {...listeners}
          title="Glisser pour réordonner"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            color: "#94a3b8",
            padding: "4px 6px",
            borderRadius: 6,
            userSelect: "none",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <GripVertical size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{sectionLabel(section.type)}</span>
          {(section.config?.titre as string) ? (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8" }}>
              — {String(section.config.titre).slice(0, 40)}
            </span>
          ) : null}
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 99, flexShrink: 0 }}>
          #{idx + 1} / {totalCount}
        </span>
        <button
          onClick={() => onToggle(section)}
          style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #e2e8f0", background: isExpanded ? "#eff6ff" : "white", fontSize: 12, fontWeight: 600, color: "#1e3a8a", cursor: "pointer", flexShrink: 0 }}
        >
          {isExpanded ? "Fermer" : "Configurer"}
        </button>
        <button
          onClick={() => onDeleteRequest(section.id)}
          title="Supprimer cette section"
          style={{ padding: "6px 8px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fee2e2", color: "#b91c1c", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}
        >
          <X size={13} />
        </button>
      </div>

      {isExpanded && (
        <div style={{ borderTop: "1px solid #e2e8f0", padding: "16px 20px", background: "#f8fafc" }}>
          <SectionConfigForm
            type={section.type}
            config={editingConfig}
            onChange={onConfigChange}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button
              onClick={() => onSave(section.id)}
              disabled={savingSection === section.id}
              style={{ padding: "9px 20px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: savingSection === section.id ? 0.7 : 1 }}
            >
              {savingSection === section.id ? "Sauvegarde…" : "Sauvegarder"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GestionPageDetailClient({
  page: initialPage,
  egliseSlug,
}: {
  page: Page;
  egliseSlug: string;
}) {
  const [page, setPage] = useState<Page>(initialPage);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedType, setSelectedType] = useState("hero");
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [savingSection, setSavingSection] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  async function confirmDelete() {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    const res = await fetch(`/api/gestion/sections/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPage((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== id) }));
      if (expandedSection === id) setExpandedSection(null);
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = page.sections.findIndex((s) => s.id === active.id);
      const newIndex = page.sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const previousSections = page.sections;
      const newSections = arrayMove(page.sections, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        ordre: idx + 1,
      }));

      setPage((prev) => ({ ...prev, sections: newSections }));
      setReordering(true);
      setError(null);

      try {
        const res = await fetch(`/api/gestion/pages/${page.id}/sections/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionIds: newSections.map((s) => s.id) }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? `Erreur ${res.status}`);
        }
      } catch (err) {
        setPage((prev) => ({ ...prev, sections: previousSections }));
        setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde de l'ordre");
      } finally {
        setReordering(false);
      }
    },
    [page.id, page.sections]
  );

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

  const previewUrl = `/c/${page.slug}`;

  return (
    <>
      {confirmDeleteId !== null && (
        <ConfirmDeleteDialog
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <Link href="/gestion/pages" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <ArrowLeft size={13} /> Retour aux pages
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ExternalLink size={13} /> Voir la page publique
          </a>
          <button
            onClick={togglePublish}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: page.publie ? "#fef3c7" : "#dcfce7", color: page.publie ? "#b45309" : "#15803d", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {page.publie ? <><EyeOff size={14} /> Dépublier</> : <><Eye size={14} /> Publier</>}
          </button>
          <button
            onClick={() => setShowAddSection(true)}
            style={{ padding: "9px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> Ajouter une section
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      {reordering && (
        <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 14px", borderRadius: 8, marginBottom: 12, fontSize: 12, fontWeight: 600 }}>
          Sauvegarde de l'ordre en cours…
        </div>
      )}

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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <LayoutGrid size={40} color="#e2e8f0" />
          </div>
          <h3 style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Aucune section</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Ajoutez des sections pour composer le contenu de cette page.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
            Faites glisser les sections pour les réordonner. Les modifications sont sauvegardées automatiquement.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={page.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {page.sections.map((section, idx) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    idx={idx}
                    totalCount={page.sections.length}
                    isExpanded={expandedSection === section.id}
                    savingSection={savingSection}
                    editingConfig={expandedSection === section.id ? editingConfig : section.config}
                    onToggle={openSection}
                    onSave={saveSection}
                    onDeleteRequest={(id) => setConfirmDeleteId(id)}
                    onConfigChange={setEditingConfig}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </>
  );
}
