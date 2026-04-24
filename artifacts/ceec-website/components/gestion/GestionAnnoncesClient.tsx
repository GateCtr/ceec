"use client";

import React, { useState } from "react";
import type { Annonce } from "@prisma/client";
import { Megaphone, Pencil, Trash2, Send, Eye, EyeOff, Download, Plus, Globe, Users, Lock } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";
import VideoPicker from "@/components/gestion/VideoPicker";
import { useConfirm } from "@/components/ui/useConfirm";

interface Props {
  initialAnnonces: Annonce[];
  canAutoPublish: boolean;
  egliseId: number;
}

const prioriteLabels: Record<string, { label: string; className: string }> = {
  haute:   { label: "Haute",   className: "badge badge-danger" },
  normale: { label: "Normale", className: "badge badge-primary" },
  basse:   { label: "Basse",   className: "badge badge-muted" },
};

const statutLabels: Record<string, { label: string; className: string }> = {
  publie:     { label: "Publié",      className: "badge badge-success" },
  brouillon:  { label: "Brouillon",   className: "badge badge-muted" },
  en_attente: { label: "En attente",  className: "badge badge-warning" },
  rejete:     { label: "Rejeté",      className: "badge badge-danger" },
};

const visibiliteConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  public:     { label: "Public",       className: "badge bg-green-50 text-green-700", icon: <Globe size={11} /> },
  communaute: { label: "Communauté",   className: "badge bg-blue-50 text-blue-800",   icon: <Users size={11} /> },
  prive:      { label: "Privé",        className: "badge bg-purple-50 text-purple-600", icon: <Lock size={11} /> },
};

const CATEGORIES = ["", "Culte", "Formation", "Prière", "Mission", "Social", "Jeunesse", "Femmes", "Hommes", "Autre"];

type FormData = {
  titre: string;
  contenu: string;
  priorite: string;
  publie: boolean;
  dateExpiration: string;
  imageUrl: string;
  videoUrl: string;
  categorie: string;
  visibilite: string;
};

const emptyForm: FormData = { titre: "", contenu: "", priorite: "normale", publie: true, dateExpiration: "", imageUrl: "", videoUrl: "", categorie: "", visibilite: "public" };

export default function GestionAnnoncesClient({ initialAnnonces, canAutoPublish, egliseId }: Props) {
  const [ConfirmDialog, confirm] = useConfirm();
  const [annonces, setAnnonces] = useState<Annonce[]>(initialAnnonces);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Annonce | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(a: Annonce) {
    setEditing(a);
    setForm({
      titre: a.titre,
      contenu: a.contenu,
      priorite: a.priorite,
      publie: a.publie,
      dateExpiration: a.dateExpiration ? new Date(a.dateExpiration).toISOString().slice(0, 10) : "",
      imageUrl: a.imageUrl ?? "",
      videoUrl: a.videoUrl ?? "",
      categorie: a.categorie ?? "",
      visibilite: (a as Annonce & { visibilite?: string }).visibilite ?? "public",
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        ...form,
        dateExpiration: form.dateExpiration || null,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        categorie: form.categorie || null,
      };
      let res;
      if (editing) {
        res = await fetch(`/api/gestion/annonces/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/gestion/annonces", {
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
        setAnnonces((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        setAnnonces((prev) => [updated, ...prev]);
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({ title: "Supprimer cette annonce ?", description: "Cette action est irréversible.", confirmLabel: "Supprimer", variant: "danger" });
    if (!ok) return;
    const res = await fetch(`/api/gestion/annonces/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function handleStatut(id: number, action: "soumettre" | "depublier" | "publier") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/gestion/annonces/${id}/statut`, {
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
      setAnnonces((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } finally {
      setActionLoading(null);
    }
  }

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
            href="/api/gestion/annonces/export"
            download
            className="btn btn-outline text-slate-700 border-border bg-white text-[13px]"
          >
            <Download size={14} /> Exporter CSV
          </a>
          <button onClick={openCreate} className="btn btn-primary font-bold">
            <Plus size={16} /> Nouvelle annonce
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 shadow-md">
          <h2 className="mb-4 text-[17px] font-bold text-foreground">
            {editing ? "Modifier l\u2019annonce" : "Nouvelle annonce"}
          </h2>
          {!canAutoPublish && !editing && (
            <div className="alert alert-warning mb-3 text-[13px]">
              Cette annonce sera créée en brouillon. Soumettez-la pour qu&apos;elle soit examinée et publiée.
            </div>
          )}
          {error && <div className="alert alert-danger mb-3 text-[13px]">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="form-group mb-0">
              <label className="label">Titre *</label>
              <input className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div className="form-group mb-0">
              <label className="label">Contenu *</label>
              <textarea className="input textarea" value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="form-group mb-0">
                <label className="label">Catégorie</label>
                <select className="input select" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c || "— Aucune —"}</option>)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="label">Priorité</label>
                <select className="input select" value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })}>
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                </select>
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
                        selected
                          ? v === "public"
                            ? "border-green-700 bg-green-50 text-green-700"
                            : v === "communaute"
                              ? "border-blue-800 bg-blue-50 text-blue-800"
                              : "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-border bg-white text-muted-foreground"
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
            <div className="flex gap-4">
              <div className="flex-1 form-group mb-0">
                <label className="label">Date d&apos;expiration</label>
                <input type="date" className="input" value={form.dateExpiration} onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })} />
              </div>
              {canAutoPublish && (
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.publie} onChange={(e) => setForm({ ...form, publie: e.target.checked })} />
                    Publier immédiatement
                  </label>
                </div>
              )}
            </div>
            <div className="flex gap-2.5 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline text-slate-700 border-border bg-white">Annuler</button>
              <button type="submit" className="btn btn-primary font-bold" disabled={loading}>
                {loading ? "Enregistrement…" : (editing ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </form>
        </div>
      )}

      {annonces.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="flex justify-center mb-3">
            <Megaphone size={40} className="text-slate-300" />
          </div>
          <p className="text-muted-foreground">Aucune annonce pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {annonces.map((a) => {
            const pr = prioriteLabels[a.priorite] ?? prioriteLabels.normale;
            const statut = statutLabels[a.statutContenu as string] ?? statutLabels.brouillon;
            const visib = visibiliteConfig[(a as Annonce & { visibilite?: string }).visibilite ?? "public"] ?? visibiliteConfig.public;
            const isLoading = actionLoading === a.id;
            return (
              <div key={a.id} className="card flex overflow-hidden">
                {a.imageUrl && (
                  <div className="w-[100px] shrink-0 bg-slate-100">
                    <img src={a.imageUrl} alt="" className="w-full h-full object-cover block" />
                  </div>
                )}
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-[15px] text-foreground">{a.titre}</span>
                        <span className={pr.className}>{pr.label}</span>
                        <span className={statut.className}>{statut.label}</span>
                        <span className={`${visib.className} inline-flex items-center gap-1`}>{visib.icon}{visib.label}</span>
                        {a.categorie && <span className="badge badge-success">{a.categorie}</span>}
                      </div>
                      <p className="text-muted-foreground text-[13px] m-0 overflow-hidden line-clamp-2">{a.contenu}</p>
                      <div className="mt-1.5 text-xs text-slate-400">
                        {new Date(a.datePublication).toLocaleDateString("fr-FR")}
                        {a.dateExpiration && <> — expire le {new Date(a.dateExpiration).toLocaleDateString("fr-FR")}</>}
                      </div>
                      {(a.statutContenu as string) === "rejete" && (a as Annonce & { commentaireRejet?: string | null }).commentaireRejet && (
                        <div className="mt-1.5 bg-red-100 rounded-md px-2.5 py-1 text-xs text-red-700">
                          Motif : {(a as Annonce & { commentaireRejet?: string | null }).commentaireRejet}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(a)} className="btn btn-outline btn-sm text-primary border-border bg-white" disabled={isLoading} title="Modifier">
                          <Pencil size={13} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm" disabled={isLoading} title="Supprimer">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {(a.statutContenu as string) !== "en_attente" && (a.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(a.id, "soumettre")}
                            disabled={isLoading}
                            className="btn btn-xs bg-yellow-100 text-yellow-700 border-yellow-300"
                          >
                            {isLoading ? "…" : <><Send size={11} className="mr-1" />Soumettre</>}
                          </button>
                        )}
                        {(a.statutContenu as string) === "publie" && (
                          <button
                            onClick={() => handleStatut(a.id, "depublier")}
                            disabled={isLoading}
                            className="btn btn-xs bg-slate-100 text-muted-foreground border-border"
                          >
                            {isLoading ? "…" : <><EyeOff size={11} className="mr-1" />Dépublier</>}
                          </button>
                        )}
                        {(a.statutContenu as string) === "en_attente" && (
                          <button
                            onClick={() => handleStatut(a.id, "depublier")}
                            disabled={isLoading}
                            className="btn btn-xs bg-slate-100 text-muted-foreground border-border"
                          >
                            {isLoading ? "…" : <><EyeOff size={11} className="mr-1" />Retirer</>}
                          </button>
                        )}
                        {canAutoPublish && (a.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(a.id, "publier")}
                            disabled={isLoading}
                            className="btn btn-xs bg-green-100 text-green-700 border-green-200"
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
