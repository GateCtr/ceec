"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

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
      <Link href="/gestion/pages" className="text-muted-foreground text-[13px] no-underline inline-flex items-center gap-1 mb-5">
        <ArrowLeft size={13} /> Retour aux pages
      </Link>

      <div className="mb-6">
        <h1 className="text-[1.4rem] font-extrabold text-foreground m-0">Nouvelle page</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configurez les informations de base, puis ajoutez des sections pour composer son contenu.</p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="alert alert-danger mb-4 text-[13px]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div className="form-group mb-0!">
            <label className="label text-[13px]">Titre de la page *</label>
            <input
              required value={form.titre}
              onChange={(e) => updateTitre(e.target.value)}
              className="input"
              placeholder="Ex: À propos de notre église"
            />
          </div>

          <div className="form-group mb-0!">
            <label className="label text-[13px]">Slug (URL)</label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-400 shrink-0">/c/</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                className="input flex-1"
                placeholder="a-propos"
              />
            </div>
            <p className="form-hint text-xs mt-1">URL publique de la page. Généré automatiquement depuis le titre.</p>
          </div>

          <div className="form-group mb-0!">
            <label className="label text-[13px]">Type de page</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="input select"
            >
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <p className="form-hint text-xs mt-1">Le type conditionne les sections disponibles (sans impact technique pour les pages libres).</p>
          </div>

          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={form.publie} onChange={(e) => setForm((f) => ({ ...f, publie: e.target.checked }))} />
            <span className="text-slate-700 font-medium">Publier immédiatement</span>
            <span className="text-xs text-slate-400">(si non coché, la page sera en brouillon)</span>
          </label>

          <div className="flex gap-3 justify-end pt-1 border-t border-slate-100">
            <Link
              href="/gestion/pages"
              className="btn btn-outline border-gray-300 text-slate-700"
            >
              Annuler
            </Link>
            <button
              type="submit" disabled={loading}
              className={`btn btn-primary font-bold ${loading ? "opacity-70" : ""}`}
            >
              {loading ? "Création…" : <span className="inline-flex items-center gap-1.5">Créer et configurer les sections <ChevronRight size={14} /></span>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
