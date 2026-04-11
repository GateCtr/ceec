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
const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Héros", texte: "Texte", texte_image: "Texte + Image", live: "Live/Vidéo",
  annonces: "Annonces", evenements: "Événements", contact: "Contact",
  departements: "Ministères", galerie: "Galerie",
};
const TABS = ["Pages", "Sections", "Annonces", "Événements", "Vidéos"] as const;
type Tab = (typeof TABS)[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ pub }: { pub: boolean }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: pub ? "#dcfce7" : "#f1f5f9", color: pub ? "#15803d" : "#64748b" }}>
      {pub ? "Publié" : "Brouillon"}
    </span>
  );
}

function ActionBtn({ label, onClick, color, bg }: { label: string; onClick: () => void; color?: string; bg?: string }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: bg ?? "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: color ?? "#374151" }}>
      {label}
    </button>
  );
}
function DelBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, color: "#b91c1c", cursor: "pointer" }}>Supprimer</button>;
}

function getYtId(url: string): string | null {
  try { const u = new URL(url); return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v"); }
  catch { return null; }
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
  const [showCreateAnnonce, setShowCreateAnnonce] = useState(false);
  const [showCreateEvt, setShowCreateEvt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const base = `/api/admin/eglises/${egliseSlug}`;

  // --- Pages ---
  async function togglePage(p: Page) {
    setBusy(p.id);
    try {
      const res = await fetch(`${base}/pages/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !p.publie }) });
      if (res.ok) { const u = await res.json(); setPages((prev) => prev.map((x) => x.id === p.id ? { ...x, publie: u.publie } : x)); }
    } finally { setBusy(null); }
  }
  async function deletePage(id: number) {
    if (!confirm("Supprimer cette page et toutes ses sections ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/pages/${id}`, { method: "DELETE" });
      if (res.ok) { setPages((p) => p.filter((x) => x.id !== id)); setSections((s) => s.filter((x) => x.pageId !== id)); }
    } finally { setBusy(null); }
  }

  // --- Sections ---
  async function deleteSection(id: number) {
    if (!confirm("Supprimer cette section ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/sections/${id}`, { method: "DELETE" });
      if (res.ok) setSections((s) => s.filter((x) => x.id !== id));
    } finally { setBusy(null); }
  }

  // --- Annonces ---
  async function toggleAnnonce(a: Annonce) {
    setBusy(a.id);
    try {
      const res = await fetch(`${base}/annonces/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !a.publie }) });
      if (res.ok) { const u = await res.json(); setAnnonces((p) => p.map((x) => x.id === a.id ? { ...x, publie: u.publie } : x)); }
    } finally { setBusy(null); }
  }
  async function saveAnnonce(id: number, data: Partial<Annonce>) {
    setBusy(id);
    try {
      const res = await fetch(`${base}/annonces/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { const u = await res.json(); setAnnonces((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setEditingAnnonce(null); }
    } finally { setBusy(null); }
  }
  async function deleteAnnonce(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/annonces/${id}`, { method: "DELETE" });
      if (res.ok) setAnnonces((p) => p.filter((a) => a.id !== id));
    } finally { setBusy(null); }
  }
  async function createAnnonce(data: Partial<Annonce>) {
    setFormError(null);
    try {
      const res = await fetch(`${base}/annonces`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? "Erreur"); return; }
      const created = await res.json();
      setAnnonces((p) => [created, ...p]);
      setShowCreateAnnonce(false);
    } catch { setFormError("Erreur réseau"); }
  }

  // --- Evenements ---
  async function toggleEvt(e: Evenement) {
    setBusy(e.id);
    try {
      const res = await fetch(`${base}/evenements/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !e.publie }) });
      if (res.ok) { const u = await res.json(); setEvenements((p) => p.map((x) => x.id === e.id ? { ...x, publie: u.publie } : x)); }
    } finally { setBusy(null); }
  }
  async function saveEvt(id: number, data: Partial<Evenement>) {
    setBusy(id);
    try {
      const res = await fetch(`${base}/evenements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { const u = await res.json(); setEvenements((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setEditingEvt(null); }
    } finally { setBusy(null); }
  }
  async function deleteEvt(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/evenements/${id}`, { method: "DELETE" });
      if (res.ok) setEvenements((p) => p.filter((e) => e.id !== id));
    } finally { setBusy(null); }
  }
  async function createEvt(data: Partial<Evenement>) {
    setFormError(null);
    try {
      const res = await fetch(`${base}/evenements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? "Erreur"); return; }
      const created = await res.json();
      setEvenements((p) => [...p, created]);
      setShowCreateEvt(false);
    } catch { setFormError("Erreur réseau"); }
  }

  // --- Videos ---
  async function toggleVideo(v: Video, field: "publie" | "epingle") {
    setBusy(v.id);
    try {
      const res = await fetch(`${base}/videos/${v.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !v[field] }) });
      if (res.ok) { const u = await res.json(); setVideos((p) => p.map((x) => x.id === v.id ? { ...x, [field]: u[field] } : x)); }
    } finally { setBusy(null); }
  }
  async function deleteVideo(id: number) {
    if (!confirm("Supprimer cette vidéo ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/videos/${id}`, { method: "DELETE" });
      if (res.ok) setVideos((p) => p.filter((v) => v.id !== id));
    } finally { setBusy(null); }
  }

  const counts: Record<Tab, number> = {
    Pages: pages.length, Sections: sections.length,
    Annonces: annonces.length, "Événements": evenements.length, Vidéos: videos.length,
  };

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#f8fafc", borderRadius: 10, padding: 4 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12,
            background: tab === t ? "white" : "transparent", color: tab === t ? "#1e3a8a" : "#64748b",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>
            {t} <span style={{ fontSize: 10, color: tab === t ? "#1e3a8a" : "#94a3b8" }}>({counts[t]})</span>
          </button>
        ))}
      </div>

      {/* ─── PAGES TAB ─── */}
      {tab === "Pages" && (
        pages.length === 0
          ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune page configurée.</p>
          : <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8fafc" }}>
                {["TITRE", "TYPE", "SECTIONS", "STATUT", "ACTIONS"].map((h) => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.titre}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>/c/{p.slug}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b" }}>{TYPE_PAGE_LABELS[p.type] ?? p.type}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b" }}>{p.sectionsCount}</td>
                    <td style={{ padding: "10px 14px" }}><Badge pub={p.publie} /></td>
                    <td style={{ padding: "10px 14px" }}>
                      {busy === p.id ? <span style={{ color: "#94a3b8", fontSize: 12 }}>…</span> : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionBtn label={p.publie ? "Dépublier" : "Publier"} onClick={() => togglePage(p)} color={p.publie ? "#b45309" : "#15803d"} bg={p.publie ? "#fef3c7" : "#f0fdf4"} />
                          <DelBtn onClick={() => deletePage(p.id)} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}

      {/* ─── SECTIONS TAB ─── */}
      {tab === "Sections" && (
        sections.length === 0
          ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune section. Configurez des pages avec des sections depuis l'interface de gestion de l'église.</p>
          : (() => {
            const byPage: Record<number, { pageTitre: string; pageSlug: string; sects: Section[] }> = {};
            for (const s of sections) {
              if (!byPage[s.pageId]) byPage[s.pageId] = { pageTitre: s.pageTitre, pageSlug: s.pageSlug, sects: [] };
              byPage[s.pageId].sects.push(s);
            }
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(byPage).map(([pageId, group]) => (
                  <div key={pageId} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{group.pageTitre}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>/c/{group.pageSlug}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>({group.sects.length} section{group.sects.length !== 1 ? "s" : ""})</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>
                        {["ORDRE", "TYPE", "ACTION"].map((h) => <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700 }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {group.sects.map((s) => (
                          <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "8px 14px", fontSize: 12, color: "#64748b" }}>{s.ordre + 1}</td>
                            <td style={{ padding: "8px 14px" }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{SECTION_TYPE_LABELS[s.type] ?? s.type}</span>
                            </td>
                            <td style={{ padding: "8px 14px" }}>
                              {busy === s.id ? <span style={{ color: "#94a3b8", fontSize: 12 }}>…</span> : <DelBtn onClick={() => deleteSection(s.id)} />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            );
          })()
      )}

      {/* ─── ANNONCES TAB ─── */}
      {tab === "Annonces" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => { setShowCreateAnnonce(true); setFormError(null); }} style={{ padding: "8px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Créer une annonce</button>
          </div>
          {showCreateAnnonce && <AnnonceForm onSave={createAnnonce} onCancel={() => setShowCreateAnnonce(false)} error={formError} />}
          {annonces.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune annonce.</p>
            : annonces.map((a) => (
              <div key={a.id} style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.titre}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(a.datePublication).toLocaleDateString("fr-FR")}{a.categorie && ` · ${a.categorie}`} · Priorité: {a.priorite}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge pub={a.publie} />
                    {busy === a.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (
                      <>
                        <ActionBtn label="Éditer" onClick={() => setEditingAnnonce(editingAnnonce === a.id ? null : a.id)} color="#1e3a8a" />
                        <ActionBtn label={a.publie ? "Dépublier" : "Publier"} onClick={() => toggleAnnonce(a)} color={a.publie ? "#b45309" : "#15803d"} bg={a.publie ? "#fef3c7" : "#f0fdf4"} />
                        <DelBtn onClick={() => deleteAnnonce(a.id)} />
                      </>
                    )}
                  </div>
                </div>
                {editingAnnonce === a.id && (
                  <AnnonceForm initial={a} onSave={(d) => saveAnnonce(a.id, d)} onCancel={() => setEditingAnnonce(null)} error={null} />
                )}
              </div>
            ))}
        </>
      )}

      {/* ─── ÉVÉNEMENTS TAB ─── */}
      {tab === "Événements" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => { setShowCreateEvt(true); setFormError(null); }} style={{ padding: "8px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Créer un événement</button>
          </div>
          {showCreateEvt && <EvenementForm onSave={createEvt} onCancel={() => setShowCreateEvt(false)} error={formError} />}
          {evenements.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucun événement.</p>
            : evenements.map((e) => (
              <div key={e.id} style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{e.titre}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>📅 {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}{e.lieu && ` · 📍 ${e.lieu}`}{e.categorie && ` · ${e.categorie}`}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge pub={e.publie} />
                    {busy === e.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (
                      <>
                        <ActionBtn label="Éditer" onClick={() => setEditingEvt(editingEvt === e.id ? null : e.id)} color="#1e3a8a" />
                        <ActionBtn label={e.publie ? "Dépublier" : "Publier"} onClick={() => toggleEvt(e)} color={e.publie ? "#b45309" : "#15803d"} bg={e.publie ? "#fef3c7" : "#f0fdf4"} />
                        <DelBtn onClick={() => deleteEvt(e.id)} />
                      </>
                    )}
                  </div>
                </div>
                {editingEvt === e.id && (
                  <EvenementForm initial={e} onSave={(d) => saveEvt(e.id, d)} onCancel={() => setEditingEvt(null)} error={null} />
                )}
              </div>
            ))}
        </>
      )}

      {/* ─── VIDÉOS TAB ─── */}
      {tab === "Vidéos" && (
        videos.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>Aucune vidéo.</p>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {videos.map((v) => {
              const ytId = getYtId(v.urlYoutube);
              return (
                <div key={v.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  {ytId && <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
                    <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {v.estEnDirect && <div style={{ position: "absolute", top: 8, left: 8, background: "#dc2626", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>🔴 DIRECT</div>}
                  </div>}
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      <Badge pub={v.publie} />
                      {v.epingle && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>📌</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 10 }}>{v.titre}</div>
                    {busy === v.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <ActionBtn label={v.publie ? "Dépublier" : "Publier"} onClick={() => toggleVideo(v, "publie")} color={v.publie ? "#b45309" : "#15803d"} bg={v.publie ? "#fef3c7" : "#f0fdf4"} />
                        <ActionBtn label={v.epingle ? "Désépingler" : "Épingler"} onClick={() => toggleVideo(v, "epingle")} color="#7c3aed" bg="#f5f3ff" />
                        <DelBtn onClick={() => deleteVideo(v.id)} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      )}
    </>
  );
}

// ─── Annonce form ─────────────────────────────────────────────────────────────

function AnnonceForm({ initial, onSave, onCancel, error }: { initial?: Partial<Annonce>; onSave: (d: Partial<Annonce>) => void; onCancel: () => void; error: string | null }) {
  const [form, setForm] = useState({
    titre: initial?.titre ?? "",
    contenu: initial?.contenu ?? "",
    priorite: initial?.priorite ?? "normale",
    publie: initial?.publie ?? false,
    imageUrl: initial?.imageUrl ?? "",
    categorie: initial?.categorie ?? "",
    datePublication: initial?.datePublication ? initial.datePublication.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div style={{ background: "#f8fafc", padding: "16px", borderTop: "1px solid #e2e8f0" }}>
      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Titre *</label>
          <input value={form.titre} onChange={(e) => u("titre", e.target.value)} style={inp} placeholder="Titre de l'annonce" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Priorité</label>
          <select value={form.priorite} onChange={(e) => u("priorite", e.target.value)} style={inp}>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Catégorie</label>
          <input value={form.categorie} onChange={(e) => u("categorie", e.target.value)} style={inp} placeholder="Ex: Jeunesse, Formation…" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Date de publication</label>
          <input type="date" value={form.datePublication} onChange={(e) => u("datePublication", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Image URL</label>
          <input value={form.imageUrl} onChange={(e) => u("imageUrl", e.target.value)} style={inp} placeholder="https://…" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Contenu</label>
          <textarea value={form.contenu} onChange={(e) => u("contenu", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" as const }} placeholder="Description de l'annonce…" />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.publie} onChange={(e) => u("publie", e.target.checked)} /> Publier immédiatement
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <button type="button" onClick={onCancel} style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 13, cursor: "pointer" }}>Annuler</button>
        <button type="button" onClick={() => onSave({ ...form, imageUrl: form.imageUrl || null, categorie: form.categorie || null, datePublication: form.datePublication })}
          style={{ padding: "7px 16px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ─── Evenement form ───────────────────────────────────────────────────────────

function EvenementForm({ initial, onSave, onCancel, error }: { initial?: Partial<Evenement>; onSave: (d: Partial<Evenement>) => void; onCancel: () => void; error: string | null }) {
  const [form, setForm] = useState({
    titre: initial?.titre ?? "",
    description: initial?.description ?? "",
    dateDebut: initial?.dateDebut ? initial.dateDebut.slice(0, 16) : "",
    dateFin: initial?.dateFin ? (initial.dateFin as string).slice(0, 16) : "",
    lieu: initial?.lieu ?? "",
    publie: initial?.publie ?? false,
    imageUrl: initial?.imageUrl ?? "",
    categorie: initial?.categorie ?? "",
    lienInscription: initial?.lienInscription ?? "",
  });
  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div style={{ background: "#f8fafc", padding: "16px", borderTop: "1px solid #e2e8f0" }}>
      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Titre *</label>
          <input value={form.titre} onChange={(e) => u("titre", e.target.value)} style={inp} placeholder="Nom de l'événement" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Date de début *</label>
          <input type="datetime-local" value={form.dateDebut} onChange={(e) => u("dateDebut", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Date de fin</label>
          <input type="datetime-local" value={form.dateFin} onChange={(e) => u("dateFin", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Lieu</label>
          <input value={form.lieu} onChange={(e) => u("lieu", e.target.value)} style={inp} placeholder="Ex: Salle A, Kinshasa…" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Catégorie</label>
          <input value={form.categorie} onChange={(e) => u("categorie", e.target.value)} style={inp} placeholder="Ex: Culte, Formation…" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Image URL</label>
          <input value={form.imageUrl} onChange={(e) => u("imageUrl", e.target.value)} style={inp} placeholder="https://…" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Lien d'inscription</label>
          <input value={form.lienInscription} onChange={(e) => u("lienInscription", e.target.value)} style={inp} placeholder="https://…" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Description</label>
          <textarea value={form.description} onChange={(e) => u("description", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" as const }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.publie} onChange={(e) => u("publie", e.target.checked)} /> Publier immédiatement
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <button type="button" onClick={onCancel} style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 13, cursor: "pointer" }}>Annuler</button>
        <button type="button" onClick={() => onSave({ ...form, dateDebut: form.dateDebut || undefined, dateFin: form.dateFin || null, imageUrl: form.imageUrl || null, categorie: form.categorie || null, lienInscription: form.lienInscription || null, description: form.description || null, lieu: form.lieu || null })}
          style={{ padding: "7px 16px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
