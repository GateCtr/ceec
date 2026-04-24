"use client";

import React, { useState } from "react";
import type { Evenement } from "@prisma/client";
import { Calendar as CalendarIcon, MapPin, Pencil, Trash2, Send, Eye, EyeOff, Download, Plus, Globe, Users, Lock } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";
import VideoPicker from "@/components/gestion/VideoPicker";
import { useConfirm } from "@/components/ui/useConfirm";

interface Props {
  initialEvenements: Evenement[];
  canAutoPublish: boolean;
  egliseId: number;
}

const statutLabels: Record<string, { label: string; classes: string }> = {
  publie:     { label: "Publié",     classes: "badge badge-success" },
  brouillon:  { label: "Brouillon",  classes: "badge badge-muted" },
  en_attente: { label: "En attente", classes: "badge badge-warning" },
  rejete:     { label: "Rejeté",     classes: "badge badge-danger" },
};

const visibiliteConfig: Record<string, { label: string; classes: string; selectedClasses: string; icon: React.ReactNode }> = {
  public:     { label: "Public",       classes: "badge bg-green-50 text-green-700",   selectedClasses: "border-green-700 bg-green-50 text-green-700",   icon: <Globe size={11} /> },
  communaute: { label: "Communauté",   classes: "badge bg-blue-50 text-blue-800",     selectedClasses: "border-blue-800 bg-blue-50 text-blue-800",     icon: <Users size={11} /> },
  prive:      { label: "Privé",        classes: "badge bg-purple-50 text-purple-600", selectedClasses: "border-purple-600 bg-purple-50 text-purple-600", icon: <Lock size={11} /> },
};

const CATEGORIES_EVT = ["", "Culte", "Conférence", "Retraite", "Formation", "Mission", "Social", "Jeunesse", "Femmes", "Hommes", "Concert", "Autre"];

type FormData = {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  publie: boolean;
  imageUrl: string;
  videoUrl: string;
  categorie: string;
  lienInscription: string;
  visibilite: string;
};

const emptyForm: FormData = {
  titre: "", description: "", dateDebut: "", dateFin: "", lieu: "", publie: true,
  imageUrl: "", videoUrl: "", categorie: "", lienInscription: "", visibilite: "public",
};

export default function GestionEvenementsClient({ initialEvenements, canAutoPublish, egliseId }: Props) {
  const [ConfirmDialog, confirm] = useConfirm();
  const [evenements, setEvenements] = useState<Evenement[]>(initialEvenements);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  function toDateInput(d: Date | string | null | undefined): string {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 16);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(e: Evenement) {
    setEditing(e);
    setForm({
      titre: e.titre,
      description: e.description ?? "",
      dateDebut: toDateInput(e.dateDebut),
      dateFin: toDateInput(e.dateFin),
      lieu: e.lieu ?? "",
      publie: e.publie,
      imageUrl: e.imageUrl ?? "",
      videoUrl: e.videoUrl ?? "",
      categorie: e.categorie ?? "",
      lienInscription: e.lienInscription ?? "",
      visibilite: (e as Evenement & { visibilite?: string }).visibilite ?? "public",
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        ...form,
        dateFin: form.dateFin || null,
        description: form.description || null,
        lieu: form.lieu || null,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        categorie: form.categorie || null,
        lienInscription: form.lienInscription || null,
      };
      let res;
      if (editing) {
        res = await fetch(`/api/gestion/evenements/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/gestion/evenements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }
      const updated = await res.json();
      if (editing) {
        setEvenements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        setEvenements((prev) => [...prev, updated].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()));
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({ title: "Supprimer cet événement ?", description: "Cette action est irréversible.", confirmLabel: "Supprimer", variant: "danger" });
    if (!ok) return;
    const res = await fetch(`/api/gestion/evenements/${id}`, { method: "DELETE" });
    if (res.ok) setEvenements((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleStatut(id: number, action: "soumettre" | "depublier" | "publier") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/gestion/evenements/${id}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erreur");
        return;
      }
      const updated = await res.json();
      setEvenements((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } finally {
      setActionLoading(null);
    }
  }

  const isPast = (d: Date | string) => new Date(d) < new Date();

  return (
    <div>
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2.5">
        {!canAutoPublish && (
          <div className="text-[13px] text-muted-foreground bg-slate-50 border border-border rounded-lg px-3 py-1.5">
            Votre contenu sera soumis pour validation avant publication.
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <a
            href="/api/gestion/evenements/export"
            download
            className="btn btn-outline text-slate-700 border-border bg-white text-[13px]"
          >
            <Download size={14} /> Exporter CSV
          </a>
          <button onClick={openCreate} className="btn btn-primary font-bold text-sm">
            <Plus size={16} /> Nouvel événement
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 shadow-md">
          <h2 className="mb-4 text-[17px] font-bold text-foreground">
            {editing ? "Modifier l\u2019événement" : "Nouvel événement"}
          </h2>
          {!canAutoPublish && !editing && (
            <div className="alert alert-warning mb-3 text-[13px]">
              Cet événement sera créé en brouillon. Soumettez-le pour qu&apos;il soit examiné et publié.
            </div>
          )}
          {error && <div className="alert alert-danger mb-3 text-[13px]">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="form-group mb-0!">
              <label className="label">Titre *</label>
              <input className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div className="form-group mb-0!">
              <label className="label">Description</label>
              <textarea className="input textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="form-group mb-0!">
                <label className="label">Catégorie</label>
                <select className="input select" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                  {CATEGORIES_EVT.map((c) => <option key={c} value={c}>{c || "— Aucune —"}</option>)}
                </select>
              </div>
              <div className="form-group mb-0!">
                <label className="label">Lieu</label>
                <input className="input" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder="Ex: Salle principale, Kinshasa" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="form-group mb-0!">
                <label className="label">Date de début *</label>
                <input type="datetime-local" className="input" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required />
              </div>
              <div className="form-group mb-0!">
                <label className="label">Date de fin</label>
                <input type="datetime-local" className="input" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Visibilité</label>
              <div className="flex gap-2 flex-wrap">
                {(["public", "communaute", "prive"] as const).map((v) => {
                  const cfg = visibiliteConfig[v];
                  const selected = form.visibilite === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, visibilite: v })}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-2 transition-all duration-150 ${
                        selected ? cfg.selectedClasses : "border-border bg-white text-muted-foreground"
                      }`}
                    >
                      {cfg.icon}
                      {v === "public" ? "Public" : v === "communaute" ? "Communauté CEEC" : "Membres de l\u2019église"}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {form.visibilite === "public" && "Visible par tous les visiteurs du site."}
                {form.visibilite === "communaute" && "Visible uniquement par les membres connectés de la CEEC."}
                {form.visibilite === "prive" && "Visible uniquement par les membres de cette église."}
              </p>
            </div>
            <ImagePicker
              label="Image"
              value={form.imageUrl}
              egliseId={egliseId}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
            <VideoPicker
              label="Vidéo (optionnel)"
              value={form.videoUrl}
              egliseId={egliseId}
              onChange={(url) => setForm({ ...form, videoUrl: url })}
            />
            <div className="form-group mb-0!">
              <label className="label">Lien d&apos;inscription (URL externe)</label>
              <input className="input" value={form.lienInscription} onChange={(e) => setForm({ ...form, lienInscription: e.target.value })} placeholder="https://forms.google.com/..." />
            </div>
            {canAutoPublish && (
              <div className="flex items-center gap-2.5">
                <input type="checkbox" id="publie-evt" checked={form.publie} onChange={(e) => setForm({ ...form, publie: e.target.checked })} />
                <label htmlFor="publie-evt" className="text-sm text-slate-700">Publier immédiatement</label>
              </div>
            )}
            <div className="flex gap-2.5 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline text-slate-700 border-border bg-white">Annuler</button>
              <button type="submit" className="btn btn-primary font-bold" disabled={loading}>
                {loading ? "Enregistrement…" : (editing ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </form>
        </div>
      )}

      {evenements.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="flex justify-center mb-3">
            <CalendarIcon size={40} className="text-slate-300" />
          </div>
          <p className="text-muted-foreground">Aucun événement pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {evenements.map((e) => {
            const past = isPast(e.dateDebut);
            const statut = statutLabels[e.statutContenu as string] ?? statutLabels.brouillon;
            const visib = visibiliteConfig[(e as Evenement & { visibilite?: string }).visibilite ?? "public"] ?? visibiliteConfig.public;
            const isLoading = actionLoading === e.id;
            return (
              <div key={e.id} className={`card flex overflow-hidden ${past ? "opacity-85" : ""}`}>
                {e.imageUrl && (
                  <div className="w-[100px] shrink-0 bg-slate-100">
                    <img src={e.imageUrl} alt="" className="w-full h-full object-cover block" />
                  </div>
                )}
                <div className="flex-1 px-5 py-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-[15px] text-foreground">{e.titre}</span>
                        <span className={statut.classes}>{statut.label}</span>
                        <span className={`${visib.classes} inline-flex items-center gap-1`}>{visib.icon}{visib.label}</span>
                        {e.categorie && <span className="badge bg-blue-50 text-blue-800">{e.categorie}</span>}
                        {past && <span className="badge badge-muted">Passé</span>}
                      </div>
                      <div className="text-[13px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <CalendarIcon size={13} className="text-slate-400" />
                        {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {e.lieu && <><span className="text-slate-300">—</span><MapPin size={13} className="text-slate-400" />{e.lieu}</>}
                      </div>
                      {e.description && <p className="text-muted-foreground text-[13px] mt-1 overflow-hidden line-clamp-2">{e.description}</p>}
                      {(e.statutContenu as string) === "rejete" && (e as Evenement & { commentaireRejet?: string | null }).commentaireRejet && (
                        <div className="mt-1.5 bg-red-100 rounded-md px-2.5 py-1 text-xs text-red-700">
                          Motif : {(e as Evenement & { commentaireRejet?: string | null }).commentaireRejet}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(e)} className="btn btn-outline btn-sm text-primary border-border bg-white" disabled={isLoading} title="Modifier">
                          <Pencil size={13} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="btn btn-sm bg-red-100 text-red-700 border-transparent hover:bg-red-200" disabled={isLoading} title="Supprimer">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {(e.statutContenu as string) !== "en_attente" && (e.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(e.id, "soumettre")}
                            disabled={isLoading}
                            className="btn btn-xs bg-yellow-100 text-yellow-700 border-yellow-300"
                          >
                            {isLoading ? "…" : <><Send size={11} className="mr-1" />Soumettre</>}
                          </button>
                        )}
                        {(e.statutContenu as string) === "publie" && (
                          <button
                            onClick={() => handleStatut(e.id, "depublier")}
                            disabled={isLoading}
                            className="btn btn-xs bg-slate-100 text-muted-foreground border-border"
                          >
                            {isLoading ? "…" : <><EyeOff size={11} className="mr-1" />Dépublier</>}
                          </button>
                        )}
                        {(e.statutContenu as string) === "en_attente" && (
                          <button
                            onClick={() => handleStatut(e.id, "depublier")}
                            disabled={isLoading}
                            className="btn btn-xs bg-slate-100 text-muted-foreground border-border"
                          >
                            {isLoading ? "…" : <><EyeOff size={11} className="mr-1" />Retirer</>}
                          </button>
                        )}
                        {canAutoPublish && (e.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(e.id, "publier")}
                            disabled={isLoading}
                            className="btn btn-xs bg-green-100 text-green-700 border-green-300"
                          >
                            {isLoading ? "…" : <><Eye size={11} className="mr-1" />Publier</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
