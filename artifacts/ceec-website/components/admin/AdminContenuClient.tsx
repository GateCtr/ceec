"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Annonce = {
  id: number; titre: string; contenu: string; priorite: string;
  publie: boolean; datePublication: string; categorie?: string | null; imageUrl?: string | null;
};
type Evenement = {
  id: number; titre: string; description?: string | null; publie: boolean;
  dateDebut: string; dateFin?: string | null; lieu?: string | null;
  categorie?: string | null; imageUrl?: string | null; lienInscription?: string | null;
};
type Page = {
  id: number; titre: string; slug: string; type: string; publie: boolean; sectionsCount: number;
};
type Video = {
  id: number; titre: string; urlYoutube: string; publie: boolean; epingle: boolean;
  estEnDirect: boolean; createdAt: string;
};
type Section = {
  id: number; type: string; ordre: number; pageId: number; pageTitre: string; pageSlug: string;
};

type Props = {
  egliseSlug: string;
  initialAnnonces: Annonce[];
  initialEvenements: Evenement[];
  initialPages: Page[];
  initialVideos: Video[];
  initialSections: Section[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_PAGE_LABELS: Record<string, string> = {
  accueil: "Accueil", about: "À propos", contact: "Contact", departements: "Ministères", custom: "Page libre",
};
const TYPE_PAGE_OPTIONS = Object.entries(TYPE_PAGE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Héros", texte: "Texte", texte_image: "Texte + Image", live: "Live/Vidéo",
  annonces: "Annonces récentes", evenements: "Événements à venir", contact: "Contact",
  departements: "Ministères", galerie: "Galerie",
};
const TABS = ["Pages", "Sections", "Annonces", "Événements", "Vidéos"] as const;
type Tab = (typeof TABS)[number];

const inp: React.CSSProperties = { width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box", background: "white" };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const full: React.CSSProperties = { gridColumn: "1 / -1" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ pub }: { pub: boolean }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: pub ? "#dcfce7" : "#f1f5f9", color: pub ? "#15803d" : "#64748b" }}>{pub ? "Publié" : "Brouillon"}</span>;
}
function ActionBtn({ label, onClick, color, bg }: { label: string; onClick: () => void; color?: string; bg?: string }) {
  return <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: bg ?? "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: color ?? "#374151" }}>{label}</button>;
}
function DelBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, color: "#b91c1c", cursor: "pointer" }}>Supprimer</button>;
}
function CreateBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ padding: "8px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{label}</button>;
}
function SaveBtn({ onClick, label = "Sauvegarder" }: { onClick: () => void; label?: string }) {
  return <button type="button" onClick={onClick} style={{ padding: "7px 16px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{label}</button>;
}
function CancelBtn({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 13, cursor: "pointer" }}>Annuler</button>;
}
function ErrBox({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{msg}</div>;
}
function FormBox({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#f8fafc", padding: "16px", borderTop: "1px solid #e2e8f0" }}>{children}</div>;
}
function Lbl({ text }: { text: string }) {
  return <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>{text}</label>;
}

function getYtId(url: string): string | null {
  try { const u = new URL(url); return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v"); } catch { return null; }
}
function slugify(s: string) { return s.toLowerCase().replace(/[àâäá]/g, "a").replace(/[éèêë]/g, "e").replace(/[îïí]/g, "i").replace(/[ôöó]/g, "o").replace(/[ûüú]/g, "u").replace(/[ñ]/g, "n").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, ""); }

// ─── Page form ────────────────────────────────────────────────────────────────

function PageForm({ initial, onSave, onCancel, error }: { initial?: Partial<Page>; onSave: (d: Partial<Page>) => void; onCancel: () => void; error: string | null }) {
  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState(initial?.type ?? "custom");
  const [publie, setPublie] = useState(initial?.publie ?? false);
  return (
    <FormBox>
      <ErrBox msg={error} />
      <div style={grid2}>
        <div style={full}><Lbl text="Titre *" /><input value={titre} onChange={(e) => { setTitre(e.target.value); if (!initial?.id) setSlug(slugify(e.target.value)); }} style={inp} placeholder="Titre de la page" /></div>
        <div><Lbl text="Slug *" /><input value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} placeholder="slug-de-la-page" /></div>
        <div><Lbl text="Type" /><select value={type} onChange={(e) => setType(e.target.value)} style={inp}>{TYPE_PAGE_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div><label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginTop: 20 }}><input type="checkbox" checked={publie} onChange={(e) => setPublie(e.target.checked)} /> Publier immédiatement</label></div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}><CancelBtn onClick={onCancel} /><SaveBtn onClick={() => onSave({ titre, slug, type, publie })} /></div>
    </FormBox>
  );
}

// ─── Video form ───────────────────────────────────────────────────────────────

function VideoForm({ initial, onSave, onCancel, error }: { initial?: Partial<Video>; onSave: (d: Partial<Video>) => void; onCancel: () => void; error: string | null }) {
  const [form, setForm] = useState({ titre: initial?.titre ?? "", urlYoutube: initial?.urlYoutube ?? "", publie: initial?.publie ?? false, epingle: initial?.epingle ?? false, estEnDirect: initial?.estEnDirect ?? false });
  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormBox>
      <ErrBox msg={error} />
      <div style={grid2}>
        <div style={full}><Lbl text="Titre *" /><input value={form.titre} onChange={(e) => u("titre", e.target.value)} style={inp} placeholder="Titre de la vidéo/diffusion" /></div>
        <div style={full}><Lbl text="URL YouTube *" /><input value={form.urlYoutube} onChange={(e) => u("urlYoutube", e.target.value)} style={inp} placeholder="https://youtube.com/watch?v=..." /></div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={form.publie} onChange={(e) => u("publie", e.target.checked)} /> Publier</label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={form.epingle} onChange={(e) => u("epingle", e.target.checked)} /> Épingler</label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={form.estEnDirect} onChange={(e) => u("estEnDirect", e.target.checked)} /> Marquer comme DIRECT</label>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}><CancelBtn onClick={onCancel} /><SaveBtn onClick={() => onSave(form)} /></div>
    </FormBox>
  );
}

// ─── Section form ─────────────────────────────────────────────────────────────

function SectionForm({ pages, onSave, onCancel, error, initial }: {
  pages: Page[]; initial?: Partial<Section & { config?: Record<string, string> }>;
  onSave: (d: { pageId: number; type: string; config: Record<string, string> }) => void;
  onCancel: () => void; error: string | null;
}) {
  const [pageId, setPageId] = useState<number>(initial?.pageId ?? (pages[0]?.id ?? 0));
  const [type, setType] = useState(initial?.type ?? "hero");
  const [titre, setTitre] = useState((initial?.config as Record<string, string> | undefined)?.titre ?? "");
  const [sousTitre, setSousTitre] = useState((initial?.config as Record<string, string> | undefined)?.sousTitre ?? "");
  const [texte, setTexte] = useState((initial?.config as Record<string, string> | undefined)?.texte ?? "");
  const [imageUrl, setImageUrl] = useState((initial?.config as Record<string, string> | undefined)?.imageUrl ?? "");
  return (
    <FormBox>
      <ErrBox msg={error} />
      <div style={grid2}>
        <div><Lbl text="Page cible *" />
          <select value={pageId} onChange={(e) => setPageId(Number(e.target.value))} style={inp}>
            {pages.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
          </select>
        </div>
        <div><Lbl text="Type de section *" />
          <select value={type} onChange={(e) => setType(e.target.value)} style={inp}>
            {Object.entries(SECTION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={full}><Lbl text="Titre" /><input value={titre} onChange={(e) => setTitre(e.target.value)} style={inp} placeholder="Titre de la section" /></div>
        <div style={full}><Lbl text="Sous-titre" /><input value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} style={inp} placeholder="Sous-titre ou accroche" /></div>
        <div style={full}><Lbl text="Texte / Description" /><textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" as const }} /></div>
        <div style={full}><Lbl text="Image URL" /><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={inp} placeholder="https://…" /></div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <CancelBtn onClick={onCancel} />
        <SaveBtn onClick={() => onSave({ pageId, type, config: { ...(titre && { titre }), ...(sousTitre && { sousTitre }), ...(texte && { texte }), ...(imageUrl && { imageUrl }) } })} />
      </div>
    </FormBox>
  );
}

// ─── Annonce form ─────────────────────────────────────────────────────────────

function AnnonceForm({ initial, onSave, onCancel, error }: { initial?: Partial<Annonce>; onSave: (d: Partial<Annonce>) => void; onCancel: () => void; error: string | null }) {
  const [form, setForm] = useState({ titre: initial?.titre ?? "", contenu: initial?.contenu ?? "", priorite: initial?.priorite ?? "normale", publie: initial?.publie ?? false, imageUrl: initial?.imageUrl ?? "", categorie: initial?.categorie ?? "", datePublication: initial?.datePublication ? initial.datePublication.slice(0, 10) : new Date().toISOString().slice(0, 10) });
  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormBox>
      <ErrBox msg={error} />
      <div style={grid2}>
        <div style={full}><Lbl text="Titre *" /><input value={form.titre} onChange={(e) => u("titre", e.target.value)} style={inp} placeholder="Titre de l'annonce" /></div>
        <div><Lbl text="Priorité" /><select value={form.priorite} onChange={(e) => u("priorite", e.target.value)} style={inp}><option value="normale">Normale</option><option value="haute">Haute</option><option value="urgente">Urgente</option></select></div>
        <div><Lbl text="Catégorie" /><input value={form.categorie} onChange={(e) => u("categorie", e.target.value)} style={inp} placeholder="Ex: Jeunesse…" /></div>
        <div><Lbl text="Date de publication" /><input type="date" value={form.datePublication} onChange={(e) => u("datePublication", e.target.value)} style={inp} /></div>
        <div><Lbl text="Image URL" /><input value={form.imageUrl} onChange={(e) => u("imageUrl", e.target.value)} style={inp} placeholder="https://…" /></div>
        <div style={full}><Lbl text="Contenu" /><textarea value={form.contenu} onChange={(e) => u("contenu", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" as const }} /></div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={form.publie} onChange={(e) => u("publie", e.target.checked)} /> Publier immédiatement</label>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}><CancelBtn onClick={onCancel} /><SaveBtn onClick={() => onSave({ ...form, imageUrl: form.imageUrl || null, categorie: form.categorie || null })} /></div>
    </FormBox>
  );
}

// ─── Evenement form ───────────────────────────────────────────────────────────

function EvenementForm({ initial, onSave, onCancel, error }: { initial?: Partial<Evenement>; onSave: (d: Partial<Evenement>) => void; onCancel: () => void; error: string | null }) {
  const [form, setForm] = useState({ titre: initial?.titre ?? "", description: initial?.description ?? "", dateDebut: initial?.dateDebut ? initial.dateDebut.slice(0, 16) : "", dateFin: initial?.dateFin ? (initial.dateFin as string).slice(0, 16) : "", lieu: initial?.lieu ?? "", publie: initial?.publie ?? false, imageUrl: initial?.imageUrl ?? "", categorie: initial?.categorie ?? "", lienInscription: initial?.lienInscription ?? "" });
  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormBox>
      <ErrBox msg={error} />
      <div style={grid2}>
        <div style={full}><Lbl text="Titre *" /><input value={form.titre} onChange={(e) => u("titre", e.target.value)} style={inp} placeholder="Nom de l'événement" /></div>
        <div><Lbl text="Date de début *" /><input type="datetime-local" value={form.dateDebut} onChange={(e) => u("dateDebut", e.target.value)} style={inp} /></div>
        <div><Lbl text="Date de fin" /><input type="datetime-local" value={form.dateFin} onChange={(e) => u("dateFin", e.target.value)} style={inp} /></div>
        <div><Lbl text="Lieu" /><input value={form.lieu} onChange={(e) => u("lieu", e.target.value)} style={inp} placeholder="Ex: Kinshasa…" /></div>
        <div><Lbl text="Catégorie" /><input value={form.categorie} onChange={(e) => u("categorie", e.target.value)} style={inp} placeholder="Ex: Culte…" /></div>
        <div><Lbl text="Image URL" /><input value={form.imageUrl} onChange={(e) => u("imageUrl", e.target.value)} style={inp} placeholder="https://…" /></div>
        <div><Lbl text="Lien d'inscription" /><input value={form.lienInscription} onChange={(e) => u("lienInscription", e.target.value)} style={inp} placeholder="https://…" /></div>
        <div style={full}><Lbl text="Description" /><textarea value={form.description} onChange={(e) => u("description", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" as const }} /></div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={form.publie} onChange={(e) => u("publie", e.target.checked)} /> Publier immédiatement</label>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <CancelBtn onClick={onCancel} />
        <SaveBtn onClick={() => onSave({ ...form, dateDebut: form.dateDebut || undefined, dateFin: form.dateFin || null, imageUrl: form.imageUrl || null, categorie: form.categorie || null, lienInscription: form.lienInscription || null, description: form.description || null, lieu: form.lieu || null })} />
      </div>
    </FormBox>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminContenuClient({ egliseSlug, initialAnnonces, initialEvenements, initialPages, initialVideos, initialSections }: Props) {
  const [tab, setTab] = useState<Tab>("Pages");
  const [annonces, setAnnonces] = useState<Annonce[]>(initialAnnonces);
  const [evenements, setEvenements] = useState<Evenement[]>(initialEvenements);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [busy, setBusy] = useState<number | null>(null);
  const [editingAnnonce, setEditingAnnonce] = useState<number | null>(null);
  const [editingEvt, setEditingEvt] = useState<number | null>(null);
  const [editingPage, setEditingPage] = useState<number | null>(null);
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [showCreateAnnonce, setShowCreateAnnonce] = useState(false);
  const [showCreateEvt, setShowCreateEvt] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const base = `/api/admin/eglises/${egliseSlug}`;

  // ── Pages ──────────────────────────────────────────────────────────────────
  async function togglePage(p: Page) {
    setBusy(p.id);
    try { const r = await fetch(`${base}/pages/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !p.publie }) }); if (r.ok) { const u = await r.json(); setPages((prev) => prev.map((x) => x.id === p.id ? { ...x, publie: u.publie } : x)); } } finally { setBusy(null); }
  }
  async function savePage(id: number, data: Partial<Page>) {
    setBusy(id);
    try { const r = await fetch(`${base}/pages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (r.ok) { const u = await r.json(); setPages((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setEditingPage(null); } } finally { setBusy(null); }
  }
  async function deletePage(id: number) {
    if (!confirm("Supprimer cette page et toutes ses sections ?")) return;
    setBusy(id);
    try { const r = await fetch(`${base}/pages/${id}`, { method: "DELETE" }); if (r.ok) { setPages((p) => p.filter((x) => x.id !== id)); setSections((s) => s.filter((x) => x.pageId !== id)); } } finally { setBusy(null); }
  }
  async function createPage(data: Partial<Page>) {
    setFormError(null);
    try { const r = await fetch(`${base}/pages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!r.ok) { const d = await r.json(); setFormError(d.error ?? "Erreur"); return; } const c = await r.json(); setPages((p) => [...p, { ...c, sectionsCount: 0 }]); setShowCreatePage(false); } catch { setFormError("Erreur réseau"); }
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  async function deleteSection(id: number) {
    if (!confirm("Supprimer cette section ?")) return;
    setBusy(id);
    try { const r = await fetch(`${base}/sections/${id}`, { method: "DELETE" }); if (r.ok) setSections((s) => s.filter((x) => x.id !== id)); } finally { setBusy(null); }
  }
  async function createSection(data: { pageId: number; type: string; config: Record<string, string> }) {
    setFormError(null);
    try {
      const r = await fetch(`${base}/sections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) { const d = await r.json(); setFormError(d.error ?? "Erreur"); return; }
      const c = await r.json();
      const page = pages.find((p) => p.id === data.pageId);
      setSections((s) => [...s, { id: c.id, type: c.type, ordre: c.ordre, pageId: c.pageId, pageTitre: page?.titre ?? "", pageSlug: page?.slug ?? "" }]);
      setPages((p) => p.map((x) => x.id === data.pageId ? { ...x, sectionsCount: x.sectionsCount + 1 } : x));
      setShowCreateSection(false);
    } catch { setFormError("Erreur réseau"); }
  }
  async function saveSection(id: number, data: { type: string; config: Record<string, string> }) {
    setBusy(id);
    try {
      const r = await fetch(`${base}/sections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (r.ok) { const u = await r.json(); setSections((s) => s.map((x) => x.id === id ? { ...x, type: u.type ?? x.type } : x)); setEditingSection(null); }
    } finally { setBusy(null); }
  }

  // ── Annonces ───────────────────────────────────────────────────────────────
  async function toggleAnnonce(a: Annonce) {
    setBusy(a.id);
    try { const r = await fetch(`${base}/annonces/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !a.publie }) }); if (r.ok) { const u = await r.json(); setAnnonces((p) => p.map((x) => x.id === a.id ? { ...x, publie: u.publie } : x)); } } finally { setBusy(null); }
  }
  async function saveAnnonce(id: number, data: Partial<Annonce>) {
    setBusy(id);
    try { const r = await fetch(`${base}/annonces/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (r.ok) { const u = await r.json(); setAnnonces((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setEditingAnnonce(null); } } finally { setBusy(null); }
  }
  async function deleteAnnonce(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    setBusy(id);
    try { const r = await fetch(`${base}/annonces/${id}`, { method: "DELETE" }); if (r.ok) setAnnonces((p) => p.filter((a) => a.id !== id)); } finally { setBusy(null); }
  }
  async function createAnnonce(data: Partial<Annonce>) {
    setFormError(null);
    try { const r = await fetch(`${base}/annonces`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!r.ok) { const d = await r.json(); setFormError(d.error ?? "Erreur"); return; } const c = await r.json(); setAnnonces((p) => [c, ...p]); setShowCreateAnnonce(false); } catch { setFormError("Erreur réseau"); }
  }

  // ── Evenements ─────────────────────────────────────────────────────────────
  async function toggleEvt(e: Evenement) {
    setBusy(e.id);
    try { const r = await fetch(`${base}/evenements/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !e.publie }) }); if (r.ok) { const u = await r.json(); setEvenements((p) => p.map((x) => x.id === e.id ? { ...x, publie: u.publie } : x)); } } finally { setBusy(null); }
  }
  async function saveEvt(id: number, data: Partial<Evenement>) {
    setBusy(id);
    try { const r = await fetch(`${base}/evenements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (r.ok) { const u = await r.json(); setEvenements((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setEditingEvt(null); } } finally { setBusy(null); }
  }
  async function deleteEvt(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    setBusy(id);
    try { const r = await fetch(`${base}/evenements/${id}`, { method: "DELETE" }); if (r.ok) setEvenements((p) => p.filter((e) => e.id !== id)); } finally { setBusy(null); }
  }
  async function createEvt(data: Partial<Evenement>) {
    setFormError(null);
    try { const r = await fetch(`${base}/evenements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!r.ok) { const d = await r.json(); setFormError(d.error ?? "Erreur"); return; } const c = await r.json(); setEvenements((p) => [...p, c]); setShowCreateEvt(false); } catch { setFormError("Erreur réseau"); }
  }

  // ── Videos ─────────────────────────────────────────────────────────────────
  async function toggleVideo(v: Video, field: "publie" | "epingle") {
    setBusy(v.id);
    try { const r = await fetch(`${base}/videos/${v.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !v[field] }) }); if (r.ok) { const u = await r.json(); setVideos((p) => p.map((x) => x.id === v.id ? { ...x, [field]: u[field] } : x)); } } finally { setBusy(null); }
  }
  async function saveVideo(id: number, data: Partial<Video>) {
    setBusy(id);
    try { const r = await fetch(`${base}/videos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (r.ok) { const u = await r.json(); setVideos((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setEditingVideo(null); } } finally { setBusy(null); }
  }
  async function deleteVideo(id: number) {
    if (!confirm("Supprimer cette vidéo ?")) return;
    setBusy(id);
    try { const r = await fetch(`${base}/videos/${id}`, { method: "DELETE" }); if (r.ok) setVideos((p) => p.filter((v) => v.id !== id)); } finally { setBusy(null); }
  }
  async function createVideo(data: Partial<Video>) {
    setFormError(null);
    try { const r = await fetch(`${base}/videos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!r.ok) { const d = await r.json(); setFormError(d.error ?? "Erreur"); return; } const c = await r.json(); setVideos((p) => [...p, c]); setShowCreateVideo(false); } catch { setFormError("Erreur réseau"); }
  }

  const counts: Record<Tab, number> = { Pages: pages.length, Sections: sections.length, Annonces: annonces.length, "Événements": evenements.length, Vidéos: videos.length };

  const tabBarStyle: React.CSSProperties = { display: "flex", gap: 2, marginBottom: 24, background: "#f8fafc", borderRadius: 10, padding: 4 };
  const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
  const thStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700 };
  const tdStyle: React.CSSProperties = { padding: "10px 14px" };
  const rowStyle: React.CSSProperties = { borderTop: "1px solid #f1f5f9" };
  const tableWrap: React.CSSProperties = { background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" };
  const topBar: React.CSSProperties = { display: "flex", justifyContent: "flex-end", marginBottom: 12 };

  return (
    <>
      {/* Tab bar */}
      <div style={tabBarStyle}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, background: tab === t ? "white" : "transparent", color: tab === t ? "#1e3a8a" : "#64748b", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {t} <span style={{ fontSize: 10, color: tab === t ? "#1e3a8a" : "#94a3b8" }}>({counts[t]})</span>
          </button>
        ))}
      </div>

      {/* ─── PAGES ─── */}
      {tab === "Pages" && (<>
        <div style={topBar}><CreateBtn label="+ Créer une page" onClick={() => { setShowCreatePage(true); setFormError(null); }} /></div>
        {showCreatePage && <div style={{ ...tableWrap, marginBottom: 12 }}><PageForm onSave={createPage} onCancel={() => setShowCreatePage(false)} error={formError} /></div>}
        {pages.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune page.</p> : (
          <div style={tableWrap}>
            <table style={tableStyle}>
              <thead><tr style={{ background: "#f8fafc" }}>{["TITRE", "TYPE", "SECTIONS", "STATUT", "ACTIONS"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {pages.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr style={rowStyle}>
                      <td style={tdStyle}><div style={{ fontWeight: 600, fontSize: 13 }}>{p.titre}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>/c/{p.slug}</div></td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "#64748b" }}>{TYPE_PAGE_LABELS[p.type] ?? p.type}</td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "#64748b" }}>{p.sectionsCount}</td>
                      <td style={tdStyle}><Badge pub={p.publie} /></td>
                      <td style={tdStyle}>{busy === p.id ? <span style={{ color: "#94a3b8", fontSize: 12 }}>…</span> : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionBtn label="Éditer" onClick={() => { setEditingPage(editingPage === p.id ? null : p.id); setFormError(null); }} color="#1e3a8a" />
                          <ActionBtn label={p.publie ? "Dépublier" : "Publier"} onClick={() => togglePage(p)} color={p.publie ? "#b45309" : "#15803d"} bg={p.publie ? "#fef3c7" : "#f0fdf4"} />
                          <DelBtn onClick={() => deletePage(p.id)} />
                        </div>
                      )}</td>
                    </tr>
                    {editingPage === p.id && <tr style={rowStyle}><td colSpan={5} style={{ padding: 0 }}><PageForm initial={p} onSave={(d) => savePage(p.id, d)} onCancel={() => setEditingPage(null)} error={formError} /></td></tr>}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {/* ─── SECTIONS ─── */}
      {tab === "Sections" && (<>
        <div style={topBar}><CreateBtn label="+ Ajouter une section" onClick={() => { setShowCreateSection(true); setFormError(null); }} /></div>
        {showCreateSection && <div style={{ ...tableWrap, marginBottom: 12 }}><SectionForm pages={pages} onSave={createSection} onCancel={() => setShowCreateSection(false)} error={formError} /></div>}
        {sections.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune section configurée.</p> : (() => {
          const byPage: Record<number, { pageTitre: string; pageSlug: string; sects: Section[] }> = {};
          for (const s of sections) { if (!byPage[s.pageId]) byPage[s.pageId] = { pageTitre: s.pageTitre, pageSlug: s.pageSlug, sects: [] }; byPage[s.pageId].sects.push(s); }
          return Object.entries(byPage).map(([pid, group]) => (
            <div key={pid} style={{ ...tableWrap, marginBottom: 16 }}>
              <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{group.pageTitre}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>/c/{group.pageSlug} · {group.sects.length} section{group.sects.length !== 1 ? "s" : ""}</span>
              </div>
              <table style={tableStyle}>
                <thead><tr>{["ORDRE", "TYPE", "ACTIONS"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {group.sects.map((s) => (
                    <React.Fragment key={s.id}>
                      <tr style={rowStyle}>
                        <td style={{ ...tdStyle, fontSize: 12, color: "#64748b" }}>{s.ordre + 1}</td>
                        <td style={tdStyle}><span style={{ fontSize: 12, fontWeight: 600 }}>{SECTION_TYPE_LABELS[s.type] ?? s.type}</span></td>
                        <td style={tdStyle}>{busy === s.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (
                          <div style={{ display: "flex", gap: 6 }}>
                            <ActionBtn label="Éditer" onClick={() => { setEditingSection(editingSection === s.id ? null : s.id); setFormError(null); }} color="#1e3a8a" />
                            <DelBtn onClick={() => deleteSection(s.id)} />
                          </div>
                        )}</td>
                      </tr>
                      {editingSection === s.id && <tr style={rowStyle}><td colSpan={3} style={{ padding: 0 }}><SectionForm pages={pages} initial={{ ...s }} onSave={(d) => saveSection(s.id, d)} onCancel={() => setEditingSection(null)} error={formError} /></td></tr>}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ));
        })()}
      </>)}

      {/* ─── ANNONCES ─── */}
      {tab === "Annonces" && (<>
        <div style={topBar}><CreateBtn label="+ Créer une annonce" onClick={() => { setShowCreateAnnonce(true); setFormError(null); }} /></div>
        {showCreateAnnonce && <div style={{ ...tableWrap, marginBottom: 12 }}><AnnonceForm onSave={createAnnonce} onCancel={() => setShowCreateAnnonce(false)} error={formError} /></div>}
        {annonces.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune annonce.</p> : annonces.map((a) => (
          <div key={a.id} style={{ ...tableWrap, marginBottom: 8 }}>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.titre}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(a.datePublication).toLocaleDateString("fr-FR")}{a.categorie && ` · ${a.categorie}`} · Priorité: {a.priorite}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge pub={a.publie} />
                {busy === a.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (<>
                  <ActionBtn label="Éditer" onClick={() => { setEditingAnnonce(editingAnnonce === a.id ? null : a.id); setFormError(null); }} color="#1e3a8a" />
                  <ActionBtn label={a.publie ? "Dépublier" : "Publier"} onClick={() => toggleAnnonce(a)} color={a.publie ? "#b45309" : "#15803d"} bg={a.publie ? "#fef3c7" : "#f0fdf4"} />
                  <DelBtn onClick={() => deleteAnnonce(a.id)} />
                </>)}
              </div>
            </div>
            {editingAnnonce === a.id && <AnnonceForm initial={a} onSave={(d) => saveAnnonce(a.id, d)} onCancel={() => setEditingAnnonce(null)} error={null} />}
          </div>
        ))}
      </>)}

      {/* ─── ÉVÉNEMENTS ─── */}
      {tab === "Événements" && (<>
        <div style={topBar}><CreateBtn label="+ Créer un événement" onClick={() => { setShowCreateEvt(true); setFormError(null); }} /></div>
        {showCreateEvt && <div style={{ ...tableWrap, marginBottom: 12 }}><EvenementForm onSave={createEvt} onCancel={() => setShowCreateEvt(false)} error={formError} /></div>}
        {evenements.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucun événement.</p> : evenements.map((e) => (
          <div key={e.id} style={{ ...tableWrap, marginBottom: 8 }}>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{e.titre}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}{e.lieu && ` · ${e.lieu}`}{e.categorie && ` · ${e.categorie}`}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge pub={e.publie} />
                {busy === e.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (<>
                  <ActionBtn label="Éditer" onClick={() => { setEditingEvt(editingEvt === e.id ? null : e.id); setFormError(null); }} color="#1e3a8a" />
                  <ActionBtn label={e.publie ? "Dépublier" : "Publier"} onClick={() => toggleEvt(e)} color={e.publie ? "#b45309" : "#15803d"} bg={e.publie ? "#fef3c7" : "#f0fdf4"} />
                  <DelBtn onClick={() => deleteEvt(e.id)} />
                </>)}
              </div>
            </div>
            {editingEvt === e.id && <EvenementForm initial={e} onSave={(d) => saveEvt(e.id, d)} onCancel={() => setEditingEvt(null)} error={null} />}
          </div>
        ))}
      </>)}

      {/* ─── VIDÉOS ─── */}
      {tab === "Vidéos" && (<>
        <div style={topBar}><CreateBtn label="+ Ajouter une vidéo" onClick={() => { setShowCreateVideo(true); setFormError(null); }} /></div>
        {showCreateVideo && <div style={{ ...tableWrap, marginBottom: 12 }}><VideoForm onSave={createVideo} onCancel={() => setShowCreateVideo(false)} error={formError} /></div>}
        {videos.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune vidéo.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {videos.map((v) => {
              const ytId = getYtId(v.urlYoutube);
              return (
                <div key={v.id} style={tableWrap}>
                  {ytId && <div style={{ aspectRatio: "16/9", overflow: "hidden" }}><img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      <Badge pub={v.publie} />
                      {v.epingle && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>📌</span>}
                      {v.estEnDirect && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#fee2e2", color: "#dc2626" }}>🔴 DIRECT</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 8 }}>{v.titre}</div>
                    {busy === v.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <ActionBtn label="Éditer" onClick={() => { setEditingVideo(editingVideo === v.id ? null : v.id); setFormError(null); }} color="#1e3a8a" />
                        <ActionBtn label={v.publie ? "Dépublier" : "Publier"} onClick={() => toggleVideo(v, "publie")} color={v.publie ? "#b45309" : "#15803d"} bg={v.publie ? "#fef3c7" : "#f0fdf4"} />
                        <ActionBtn label={v.epingle ? "Désépingler" : "Épingler"} onClick={() => toggleVideo(v, "epingle")} color="#7c3aed" bg="#f5f3ff" />
                        <DelBtn onClick={() => deleteVideo(v.id)} />
                      </div>
                    )}
                    {editingVideo === v.id && <VideoForm initial={v} onSave={(d) => saveVideo(v.id, d)} onCancel={() => setEditingVideo(null)} error={formError} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>)}
    </>
  );
}
