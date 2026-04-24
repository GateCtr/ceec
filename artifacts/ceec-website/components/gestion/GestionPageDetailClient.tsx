"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutGrid, GripVertical, X, ArrowLeft, ExternalLink, Plus, Eye, EyeOff, Palette } from "lucide-react";
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
import ImagePicker from "@/components/gestion/ImagePicker";

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

type FieldDef = {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
};

const SECTION_FIELDS: Record<string, FieldDef[]> = {
  hero: [
    { key: "titre", label: "Titre principal", type: "text", placeholder: "Bienvenue à notre église" },
    { key: "sousTitre", label: "Sous-titre / lieu", type: "text", placeholder: "Kinshasa, RDC" },
    { key: "description", label: "Description (facultatif)", type: "textarea", placeholder: "Présentation de l'église..." },
    { key: "imageUrl", label: "Image de fond", type: "image" },
    { key: "ctaLabel1", label: "Bouton principal — texte", type: "text", placeholder: "Rejoindre l'église" },
    { key: "ctaHref1", label: "Bouton principal — lien", type: "text", placeholder: "/c/inscription" },
    { key: "ctaLabel2", label: "Bouton secondaire — texte", type: "text", placeholder: "Voir les événements" },
    { key: "ctaHref2", label: "Bouton secondaire — lien", type: "text", placeholder: "/c/evenements" },
  ],
  texte_image: [
    { key: "titre", label: "Titre", type: "text", placeholder: "Notre mission" },
    { key: "texte", label: "Texte", type: "textarea", placeholder: "Décrivez ici..." },
    { key: "imageUrl", label: "Image", type: "image" },
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
  ],
};

const DESIGN_FIELDS: Record<string, FieldDef[]> = {
  hero: [
    { key: "overlayOpacity", label: "Opacité de l'overlay sombre (0–100)", type: "range" },
    {
      key: "textAlign", label: "Alignement du texte", type: "select",
      options: [{ value: "center", label: "Centré" }, { value: "left", label: "À gauche" }],
    },
    { key: "bgColor", label: "Couleur de fond (si pas d'image)", type: "color" },
    { key: "textColor", label: "Couleur du texte", type: "color" },
  ],
  texte_image: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
    { key: "textColor", label: "Couleur du texte", type: "color" },
  ],
  annonces: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
    { key: "textColor", label: "Couleur du titre", type: "color" },
    {
      key: "layout", label: "Disposition", type: "select",
      options: [{ value: "grid", label: "Grille" }, { value: "list", label: "Liste" }],
    },
  ],
  evenements: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
    { key: "textColor", label: "Couleur du titre", type: "color" },
    {
      key: "layout", label: "Disposition", type: "select",
      options: [{ value: "grid", label: "Grille" }, { value: "list", label: "Liste" }],
    },
  ],
  contact: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
    { key: "textColor", label: "Couleur du texte", type: "color" },
  ],
  departements: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
    { key: "textColor", label: "Couleur du titre", type: "color" },
  ],
  galerie: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
  ],
  live: [
    { key: "bgColor", label: "Couleur de fond", type: "color" },
  ],
};

function FieldRenderer({
  f, config, onChange, egliseId,
}: { f: FieldDef; config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; egliseId?: number }) {
  const val = config[f.key];

  if (f.type === "checkbox") {
    return (
      <label key={f.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
        <input type="checkbox" checked={!!val} onChange={(e) => onChange({ ...config, [f.key]: e.target.checked })} />
        {f.label}
      </label>
    );
  }
  if (f.type === "image") {
    return (
      <ImagePicker
        key={f.key}
        label={f.label}
        value={(val as string) ?? ""}
        onChange={(url) => onChange({ ...config, [f.key]: url })}
        egliseId={egliseId}
      />
    );
  }
  if (f.type === "color") {
    return (
      <div key={f.key} className="flex items-center gap-2.5">
        <label className="label flex-1 text-[13px]! mb-0!">{f.label}</label>
        <input
          type="color"
          value={(val as string) || "#ffffff"}
          onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
          className="w-10 h-8 rounded-md border border-gray-300 cursor-pointer p-0.5"
        />
        {!!val && (
          <button
            type="button"
            onClick={() => onChange({ ...config, [f.key]: "" })}
            className="text-[11px] text-slate-400 bg-transparent border-none cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>
    );
  }
  if (f.type === "range") {
    const numVal = val !== undefined && val !== "" ? Number(val) : 50;
    return (
      <div key={f.key}>
        <label className="label text-[13px]! mb-1!">
          {f.label}: <strong>{numVal}%</strong>
        </label>
        <input
          type="range"
          min={0} max={100} step={5}
          value={numVal}
          onChange={(e) => onChange({ ...config, [f.key]: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>
    );
  }
  if (f.type === "select") {
    return (
      <div key={f.key}>
        <label className="label text-[13px]! mb-1!">{f.label}</label>
        <select
          value={(val as string) ?? ""}
          onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
          className="input select"
        >
          {(f.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  if (f.type === "textarea") {
    return (
      <div key={f.key}>
        <label className="label text-[13px]! mb-1!">{f.label}</label>
        <textarea
          value={(val as string) ?? ""}
          onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
          placeholder={f.placeholder}
          rows={3}
          className="input textarea"
        />
      </div>
    );
  }
  return (
    <div key={f.key}>
      <label className="label text-[13px]! mb-1!">{f.label}</label>
      <input
        value={(val as string) ?? ""}
        onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
        placeholder={f.placeholder}
        className="input"
      />
    </div>
  );
}

function GalerieImagesList({
  config, onChange, egliseId,
}: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; egliseId?: number }) {
  const images = (config.images as string[] | undefined) ?? [];

  function addImage(url: string) {
    onChange({ ...config, images: [...images, url] });
  }

  function removeImage(idx: number) {
    onChange({ ...config, images: images.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <label className="label text-[13px]! mb-2">
        Images de la galerie ({images.length})
      </label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((src, idx) => (
            <div key={idx} className="relative">
              <img src={src} alt="" className="w-20 h-15 object-cover rounded-md border border-border" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-500 border-2 border-white text-white text-[10px] font-bold cursor-pointer flex items-center justify-center p-0"
              >×</button>
            </div>
          ))}
        </div>
      )}
      <ImagePicker
        label="Ajouter une image"
        value=""
        onChange={addImage}
        egliseId={egliseId}
      />
    </div>
  );
}

function SectionConfigForm({
  type, config, onChange, egliseId,
}: { type: string; config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; egliseId?: number }) {
  const [showDesign, setShowDesign] = useState(false);
  const contentFields = SECTION_FIELDS[type] ?? [];
  const designFields = DESIGN_FIELDS[type] ?? [];

  return (
    <div className="flex flex-col gap-3">
      {contentFields.map((f) => (
        <FieldRenderer key={f.key} f={f} config={config} onChange={onChange} egliseId={egliseId} />
      ))}

      {type === "galerie" && (
        <GalerieImagesList config={config} onChange={onChange} egliseId={egliseId} />
      )}

      {designFields.length > 0 && (
        <div className="border-t border-border pt-3 mt-1">
          <button
            type="button"
            onClick={() => setShowDesign((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 bg-transparent border-none cursor-pointer p-0"
          >
            <Palette size={14} />
            {showDesign ? "Masquer les options de design" : "Options de design"}
          </button>
          {showDesign && (
            <div className="flex flex-col gap-3 mt-3">
              {designFields.map((f) => (
                <FieldRenderer key={f.key} f={f} config={config} onChange={onChange} egliseId={egliseId} />
              ))}
            </div>
          )}
        </div>
      )}

      {contentFields.length === 0 && designFields.length === 0 && (
        <p className="text-muted-foreground text-[13px]">Aucune configuration disponible pour ce type de section.</p>
      )}
    </div>
  );
}

function ConfirmDeleteDialog({
  onConfirm, onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-1000 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full shadow-xl">
        <div className="flex justify-center mb-3">
          <AlertTriangle size={36} className="text-amber-500" />
        </div>
        <h3 className="font-extrabold text-[1.1rem] text-foreground text-center mb-2">
          Supprimer cette section ?
        </h3>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Cette action est irréversible. La section et sa configuration seront définitivement supprimées.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button onClick={onCancel} className="btn btn-outline">
            Annuler
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
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
  egliseId,
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
  egliseId?: number;
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

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`bg-white rounded-xl border-2 overflow-hidden ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isExpanded ? "border-primary" : isDragging ? "border-blue-300" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          title="Glisser pour réordonner"
          className={`${isDragging ? "cursor-grabbing" : "cursor-grab"} text-slate-400 p-1 px-1.5 rounded-md select-none shrink-0 flex items-center`}
        >
          <GripVertical size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-foreground text-sm">{sectionLabel(section.type)}</span>
          {(section.config?.titre as string) ? (
            <span className="ml-2 text-xs text-slate-400">
              — {String(section.config.titre).slice(0, 40)}
            </span>
          ) : null}
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
          #{idx + 1} / {totalCount}
        </span>
        <button
          onClick={() => onToggle(section)}
          className={`btn btn-sm shrink-0 ${isExpanded ? "btn-primary" : "btn-outline"}`}
        >
          {isExpanded ? "Fermer" : "Configurer"}
        </button>
        <button
          onClick={() => onDeleteRequest(section.id)}
          title="Supprimer cette section"
          className="px-2 py-1.5 rounded-lg border border-red-300 bg-red-100 text-red-700 cursor-pointer shrink-0 flex items-center"
        >
          <X size={13} />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-border px-5 py-4 bg-slate-50">
          <SectionConfigForm
            type={section.type}
            config={editingConfig}
            onChange={onConfigChange}
            egliseId={egliseId}
          />
          <div className="flex justify-end mt-3.5">
            <button
              onClick={() => onSave(section.id)}
              disabled={savingSection === section.id}
              className={`btn btn-primary ${savingSection === section.id ? "opacity-70" : ""}`}
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
  egliseId,
}: {
  page: Page;
  egliseSlug: string;
  egliseId?: number;
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

  const previewUrl = page.type === "accueil" ? "/c" : `/c/${page.slug}`;

  return (
    <>
      {confirmDeleteId !== null && (
        <ConfirmDeleteDialog
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <Link href="/gestion/pages" className="text-muted-foreground text-[13px] no-underline inline-flex items-center gap-1 mb-2">
            <ArrowLeft size={13} /> Retour aux pages
          </Link>
          <h1 className="text-[1.4rem] font-extrabold text-foreground m-0">{page.titre}</h1>
          <div className="flex gap-2.5 mt-1.5 items-center">
            <span className="text-xs text-slate-400">/c/{page.slug}</span>
            <span className={`badge ${page.publie ? "badge-success" : "badge-muted"}`}>
              {page.publie ? "Publié" : "Brouillon"}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <ExternalLink size={13} /> Voir la page publique
          </a>
          <button
            onClick={togglePublish}
            className={`btn ${page.publie ? "bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200" : "bg-green-100 border-green-200 text-green-700 hover:bg-green-200"}`}
          >
            {page.publie ? <><EyeOff size={14} /> Dépublier</> : <><Eye size={14} /> Publier</>}
          </button>
          <button
            onClick={() => setShowAddSection(true)}
            className="btn btn-primary"
          >
            <Plus size={15} /> Ajouter une section
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}
      {reordering && (
        <div className="bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-lg mb-3 text-xs font-semibold">
          Sauvegarde de l'ordre en cours…
        </div>
      )}

      {showAddSection && (
        <div className="card p-6 mb-5 shadow-md">
          <h3 className="font-bold text-[15px] text-foreground mb-4">Choisir le type de section</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 mb-4">
            {SECTION_TYPES.map((t) => (
              <div
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`p-3 px-3.5 rounded-[10px] border-2 cursor-pointer ${
                  selectedType === t.value
                    ? "border-primary bg-primary-50"
                    : "border-border bg-white"
                }`}
              >
                <div className="font-bold text-[13px] text-foreground mb-1">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 justify-end">
            <button onClick={() => setShowAddSection(false)} className="btn btn-outline">
              Annuler
            </button>
            <button onClick={handleAddSection} disabled={loading} className={`btn btn-primary ${loading ? "opacity-70" : ""}`}>
              {loading ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {page.sections.length === 0 ? (
        <div className="text-center py-16 px-8 bg-white rounded-xl border border-dashed border-border">
          <div className="flex justify-center mb-3">
            <LayoutGrid size={40} className="text-border" />
          </div>
          <h3 className="text-foreground font-bold mb-2">Aucune section</h3>
          <p className="text-muted-foreground text-sm">Ajoutez des sections pour composer le contenu de cette page.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-2.5">
            Faites glisser les sections pour les réordonner. Les modifications sont sauvegardées automatiquement.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={page.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
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
                    egliseId={egliseId}
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
