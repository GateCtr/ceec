"use client";

import React, { useState } from "react";
import type { LiveStream } from "@prisma/client";
import { Play, Pin, Radio, Plus, X } from "lucide-react";
import { useConfirm } from "@/components/ui/useConfirm";

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch { return null; }
}

type FormData = {
  titre: string;
  urlYoutube: string;
  description: string;
  dateStream: string;
  estEnDirect: boolean;
  epingle: boolean;
  publie: boolean;
};

const emptyForm: FormData = {
  titre: "", urlYoutube: "", description: "", dateStream: "",
  estEnDirect: false, epingle: false, publie: true,
};

export default function GestionVideosClient({ initialVideos }: { initialVideos: LiveStream[] }) {
  const [ConfirmDialog, confirm] = useConfirm();
  const [videos, setVideos] = useState<LiveStream[]>(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LiveStream | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toDateInput(d: Date | string | null | undefined): string {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 16);
  }

  function openCreate() {
    setEditing(null); setForm(emptyForm); setShowForm(true); setError(null);
  }

  function openEdit(v: LiveStream) {
    setEditing(v);
    setForm({
      titre: v.titre,
      urlYoutube: v.urlYoutube,
      description: v.description ?? "",
      dateStream: toDateInput(v.dateStream),
      estEnDirect: v.estEnDirect,
      epingle: v.epingle,
      publie: v.publie,
    });
    setShowForm(true); setError(null);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const body = {
        ...form,
        description: form.description || null,
        dateStream: form.dateStream || null,
      };
      let res;
      if (editing) {
        res = await fetch(`/api/gestion/videos/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/gestion/videos", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      }
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      const saved = await res.json();
      if (editing) {
        setVideos((vs) => vs.map((v) => (v.id === saved.id ? saved : v)));
      } else {
        setVideos((vs) => [saved, ...vs]);
      }
      setShowForm(false);
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({ title: "Supprimer cette vidéo ?", description: "Cette action est irréversible.", confirmLabel: "Supprimer", variant: "danger" });
    if (!ok) return;
    const res = await fetch(`/api/gestion/videos/${id}`, { method: "DELETE" });
    if (res.ok) setVideos((vs) => vs.filter((v) => v.id !== id));
  }

  async function togglePin(v: LiveStream) {
    const res = await fetch(`/api/gestion/videos/${v.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ epingle: !v.epingle }),
    });
    if (res.ok) {
      const updated = await res.json();
      setVideos((vs) => vs.map((x) => (x.id === v.id ? updated : x)));
    }
  }

  return (
    <>
      <ConfirmDialog />
      <div className="flex justify-end mb-5">
        <button
          onClick={openCreate}
          className="btn btn-primary font-bold text-sm"
        >
          <Plus size={16} /> Ajouter une vidéo
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 shadow-md">
          <h3 className="font-bold text-[15px] text-foreground mb-4">
            {editing ? "Modifier la vidéo" : "Nouvelle vidéo YouTube"}
          </h3>
          {error && <div className="alert alert-danger mb-3 text-[13px]">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="form-group mb-0!">
              <label className="label">Titre *</label>
              <input required value={form.titre} onChange={(e) => updateField("titre", e.target.value)}
                className="input"
                placeholder="Ex: Culte du dimanche 12 janvier" />
            </div>
            <div className="form-group mb-0!">
              <label className="label">URL YouTube *</label>
              <input required value={form.urlYoutube} onChange={(e) => updateField("urlYoutube", e.target.value)}
                className="input"
                placeholder="https://youtube.com/watch?v=..." />
            </div>
            {form.urlYoutube && getYoutubeId(form.urlYoutube) && (
              <div className="rounded-lg overflow-hidden max-w-xs">
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeId(form.urlYoutube)}/hqdefault.jpg`}
                  alt="Miniature YouTube"
                  className="w-full block"
                />
              </div>
            )}
            <div className="form-group mb-0!">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={2}
                className="input textarea" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group mb-0!">
                <label className="label">Date du stream</label>
                <input type="datetime-local" value={form.dateStream} onChange={(e) => updateField("dateStream", e.target.value)}
                  className="input" />
              </div>
              <div className="flex flex-col gap-2.5 pt-[22px]">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.estEnDirect} onChange={(e) => updateField("estEnDirect", e.target.checked)} />
                  <span className="text-red-700 font-semibold flex items-center gap-1"><Radio size={13} className="text-red-700" /> En direct</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.epingle} onChange={(e) => updateField("epingle", e.target.checked)} />
                  Épingler en haut
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.publie} onChange={(e) => updateField("publie", e.target.checked)} />
                  Publié
                </label>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="btn btn-outline text-slate-700 border-border bg-white">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className={`btn btn-primary font-bold ${loading ? "opacity-70" : ""}`}>
                {loading ? "Enregistrement…" : (editing ? "Mettre à jour" : "Ajouter")}
              </button>
            </div>
          </form>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-xl border border-dashed border-border">
          <div className="flex justify-center mb-3">
            <Play size={40} className="text-border" />
          </div>
          <h3 className="text-foreground font-bold mb-2">Aucune vidéo</h3>
          <p className="text-muted-foreground text-sm">Ajoutez vos lives et replays YouTube pour les afficher sur votre site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {videos.map((v) => {
            const ytId = getYoutubeId(v.urlYoutube);
            return (
              <div key={v.id} className="card overflow-hidden">
                {ytId ? (
                  <div className="aspect-video bg-foreground overflow-hidden">
                    <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.titre} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    <Play size={32} className="text-slate-400" />
                  </div>
                )}
                <div className="px-3.5 py-3">
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {v.epingle && <span className="badge bg-amber-100 text-amber-700 inline-flex items-center gap-1"><Pin size={9} className="text-amber-700" /> Épinglé</span>}
                    {v.estEnDirect && <span className="badge bg-red-100 text-red-700 inline-flex items-center gap-1"><Radio size={9} className="text-red-700" /> En direct</span>}
                    {!v.publie && <span className="badge badge-muted">Brouillon</span>}
                  </div>
                  <div className="font-bold text-foreground text-sm mb-1 leading-tight">{v.titre}</div>
                  {v.description && <div className="text-xs text-muted-foreground mb-2.5 leading-snug">{v.description.slice(0, 100)}{v.description.length > 100 ? "…" : ""}</div>}
                  {v.dateStream && (
                    <div className="text-[11px] text-slate-400 mb-2.5">
                      {new Date(v.dateStream).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => openEdit(v)}
                      className="btn btn-outline btn-sm flex-1 text-slate-700 border-border bg-white">
                      Modifier
                    </button>
                    <button onClick={() => togglePin(v)}
                      className={`btn btn-sm border-border text-amber-700 ${v.epingle ? "bg-amber-100" : "bg-white"}`}>
                      {v.epingle ? "Désépingler" : "Épingler"}
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      title="Supprimer"
                      className="btn btn-sm bg-red-100 text-red-700 border-red-300 flex items-center">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
