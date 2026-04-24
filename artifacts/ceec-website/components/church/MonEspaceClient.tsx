"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Megaphone, MapPin, CheckCircle, ChevronRight, Pencil, X } from "lucide-react";
import { CHURCH_ROLE_LABELS } from "@/lib/membre-role-constants";

interface ProfilData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: string;
  statut: string;
  dateAdhesion: string | null;
  createdAt: string;
  photoUrl: string | null;
}

interface EventInscrit {
  id: number;
  titre: string;
  dateDebut: string;
  lieu: string | null;
  imageUrl: string | null;
  aVenir: boolean;
}

interface AnnonceData {
  id: number;
  titre: string;
  contenu: string;
  priorite: string;
  datePublication: string;
  imageUrl: string | null;
  categorie: string | null;
}

interface Props {
  profil: ProfilData;
  evenementsInscrits: EventInscrit[];
  annonces: AnnonceData[];
  eglise: { nom: string; slug: string };
}

const ROLE_FR: Record<string, string> = {
  fidele: "Fidèle", diacre: "Diacre", pasteur: "Pasteur",
  secretaire: "Secrétaire", tresorier: "Trésorier",
  admin_eglise: "Administrateur", super_admin: "Super Admin",
  admin_plateforme: "Admin Plateforme", moderateur_plateforme: "Modérateur",
};

type Tab = "profil" | "evenements" | "annonces";

export default function MonEspaceClient({ profil, evenementsInscrits, annonces, eglise }: Props) {
  const [tab, setTab] = useState<Tab>("profil");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom: profil.nom, prenom: profil.prenom, telephone: profil.telephone ?? "" });
  const [currentProfil, setCurrentProfil] = useState(profil);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const aVenir = evenementsInscrits.filter((e) => e.aVenir);
  const passes = evenementsInscrits.filter((e) => !e.aVenir);

  async function handleSave() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      setFormError("Nom et prénom requis.");
      return;
    }
    setSaving(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await fetch("/api/membre/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentProfil((p) => ({ ...p, ...updated }));
        setEditMode(false);
        setFormSuccess("Profil mis à jour !");
        setTimeout(() => setFormSuccess(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Erreur lors de la sauvegarde.");
      }
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "profil", label: "Profil" },
    { key: "evenements", label: "Événements", count: aVenir.length || undefined },
    { key: "annonces", label: "Annonces", count: annonces.length || undefined },
  ];

  const roleInfo = CHURCH_ROLE_LABELS[currentProfil.role];

  return (
    <div className="min-h-[80vh] bg-primary-50 py-8 px-4 pb-16">
      <div className="max-w-[900px] mx-auto">

        {/* ── Header profil ────────────────────────────── */}
        <div
          className="rounded-2xl p-6 sm:p-8 text-white mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
          style={{ background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), color-mix(in srgb, var(--church-primary, #1e3a8a) 80%, black))" }}
        >
          {/* Avatar */}
          {currentProfil.photoUrl ? (
            <img
              src={currentProfil.photoUrl}
              alt={`${currentProfil.prenom} ${currentProfil.nom}`}
              className="w-[72px] h-[72px] rounded-full object-cover shrink-0 border-[3px]"
              style={{ borderColor: "var(--church-accent, #c59b2e)" }}
            />
          ) : (
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-black text-[28px] shrink-0"
              style={{ background: "var(--church-accent, #c59b2e)", color: "var(--church-primary, #1e3a8a)" }}
            >
              {currentProfil.prenom.charAt(0)}{currentProfil.nom.charAt(0)}
            </div>
          )}

          {/* Infos */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="font-extrabold text-xl sm:text-2xl leading-tight">
              {currentProfil.prenom} {currentProfil.nom}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              {roleInfo ? (
                <span
                  className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: roleInfo.bg, color: roleInfo.color }}
                >
                  {roleInfo.label}
                </span>
              ) : (
                <span className="text-[13px] text-white/80">{ROLE_FR[currentProfil.role] ?? currentProfil.role}</span>
              )}
              <span className="text-[13px] text-white/75">{eglise.nom}</span>
            </div>
            <p className="text-xs text-white/60 mt-1.5">
              Membre depuis{" "}
              {new Date(currentProfil.dateAdhesion ?? currentProfil.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Badge statut */}
          <div className="bg-white/15 rounded-lg px-3.5 py-1.5 text-xs font-bold shrink-0">
            {currentProfil.statut === "actif" ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle size={13} /> Actif
              </span>
            ) : (
              currentProfil.statut
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border border-border w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none ${
                tab === t.key
                  ? "text-white shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-slate-50"
              }`}
              style={tab === t.key ? { background: "var(--church-primary, #1e3a8a)" } : undefined}
            >
              {t.label}
              {t.count != null && (
                <span className={`ml-1.5 text-xs ${tab === t.key ? "text-white/70" : "text-slate-400"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab : Profil ─────────────────────────────── */}
        {tab === "profil" && (
          <div className="card card-body">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-extrabold text-lg text-foreground m-0">Mes informations</h2>
              {!editMode && (
                <button
                  onClick={() => { setEditMode(true); setForm({ nom: currentProfil.nom, prenom: currentProfil.prenom, telephone: currentProfil.telephone ?? "" }); }}
                  className="btn btn-outline btn-sm"
                >
                  <Pencil size={14} /> Modifier
                </button>
              )}
            </div>

            {formSuccess && <div className="alert alert-success mb-4">{formSuccess}</div>}

            {editMode ? (
              <div className="flex flex-col gap-4">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label">Prénom <span className="required">*</span></label>
                    <input className="input" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Nom <span className="required">*</span></label>
                    <input className="input" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Téléphone</label>
                  <input className="input" value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} placeholder="+243 xxx xxx xxx" />
                </div>
                <div className="flex gap-3 mt-1">
                  <button onClick={() => setEditMode(false)} className="btn btn-ghost flex-1">
                    <X size={14} /> Annuler
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-2">
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {[
                  { label: "Prénom", value: currentProfil.prenom },
                  { label: "Nom", value: currentProfil.nom },
                  { label: "Email", value: currentProfil.email },
                  { label: "Téléphone", value: currentProfil.telephone ?? "—" },
                  { label: "Rôle", value: ROLE_FR[currentProfil.role] ?? currentProfil.role },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="overline text-slate-400">{label}</span>
                    <p className="text-[15px] text-foreground font-medium mt-1 m-0">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab : Événements ─────────────────────────── */}
        {tab === "evenements" && (
          <div className="flex flex-col gap-6">
            {aVenir.length > 0 && (
              <div>
                <h3 className="font-bold text-base text-foreground mb-3">À venir ({aVenir.length})</h3>
                <div className="flex flex-col gap-3">
                  {aVenir.map((evt) => <EventCard key={evt.id} evt={evt} />)}
                </div>
              </div>
            )}
            {passes.length > 0 && (
              <div>
                <h3 className="font-bold text-base text-muted-foreground mb-3">Passés</h3>
                <div className="flex flex-col gap-3 opacity-70">
                  {passes.map((evt) => <EventCard key={evt.id} evt={evt} />)}
                </div>
              </div>
            )}
            {evenementsInscrits.length === 0 && (
              <div className="card card-body text-center py-12">
                <Calendar size={40} className="mx-auto mb-3 text-slate-400" strokeWidth={1.5} />
                <p className="text-muted-foreground text-[15px] mb-4">
                  Vous n&apos;êtes inscrit à aucun événement pour le moment.
                </p>
                <Link
                  href="/c/evenements"
                  className="btn btn-primary btn-sm mx-auto"
                >
                  Voir les événements <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Tab : Annonces ───────────────────────────── */}
        {tab === "annonces" && (
          <div className="flex flex-col gap-3">
            {annonces.length === 0 ? (
              <div className="card card-body text-center py-12">
                <Megaphone size={40} className="mx-auto mb-3 text-slate-400" strokeWidth={1.5} />
                <p className="text-muted-foreground text-[15px]">Aucune annonce pour le moment.</p>
              </div>
            ) : (
              annonces.map((a) => (
                <Link key={a.id} href={`/c/annonces/${a.id}`} className="no-underline">
                  <div className="card card-hover p-5 flex gap-4 items-start">
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt={a.titre} className="w-[72px] h-[72px] rounded-lg object-cover shrink-0 hidden sm:block" />
                    )}
                    <div className="flex-1 min-w-0">
                      {a.priorite === "urgente" && (
                        <span className="badge badge-danger text-[10px] mb-1.5">URGENT</span>
                      )}
                      <h4 className="font-bold text-foreground text-[15px] leading-snug mb-1">{a.titre}</h4>
                      <p className="text-[13px] text-muted-foreground m-0 line-clamp-2">{a.contenu}</p>
                      <span className="text-[11px] text-slate-400 mt-1.5 block">
                        {new Date(a.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── EventCard ──────────────────────────────────────── */
function EventCard({ evt }: { evt: EventInscrit }) {
  const date = new Date(evt.dateDebut);
  return (
    <Link href={`/c/evenements/${evt.id}`} className="no-underline">
      <div className="card card-hover flex overflow-hidden">
        <div
          className="w-[72px] shrink-0 flex flex-col items-center justify-center text-white py-3 px-2"
          style={{ background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), color-mix(in srgb, var(--church-primary, #1e3a8a) 80%, black))" }}
        >
          <span className="text-xl font-black leading-none">{date.getDate()}</span>
          <span className="text-[10px] opacity-80 mt-0.5">{date.toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</span>
          <span className="text-[10px] opacity-65">{date.getFullYear()}</span>
        </div>
        <div className="p-3.5 sm:p-4 flex-1 min-w-0">
          <h4 className="font-bold text-foreground text-sm">{evt.titre}</h4>
          {evt.lieu && (
            <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
              <MapPin size={11} /> {evt.lieu}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
