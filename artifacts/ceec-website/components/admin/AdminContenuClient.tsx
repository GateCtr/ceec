"use client";

import React, { useState } from "react";

type Annonce = {
  id: number;
  titre: string;
  priorite: string;
  publie: boolean;
  datePublication: string;
  categorie?: string | null;
};

type Evenement = {
  id: number;
  titre: string;
  publie: boolean;
  dateDebut: string;
  lieu?: string | null;
  categorie?: string | null;
};

type Page = {
  id: number;
  titre: string;
  slug: string;
  type: string;
  publie: boolean;
  sectionsCount: number;
};

type Video = {
  id: number;
  titre: string;
  urlYoutube: string;
  publie: boolean;
  epingle: boolean;
  estEnDirect: boolean;
  createdAt: string;
};

type Props = {
  egliseSlug: string;
  initialAnnonces: Annonce[];
  initialEvenements: Evenement[];
  initialPages: Page[];
  initialVideos: Video[];
};

const typeLabels: Record<string, string> = {
  accueil: "Accueil", about: "À propos", contact: "Contact", departements: "Ministères", custom: "Page libre",
};

const TABS = ["Pages", "Annonces", "Événements", "Vidéos"] as const;
type Tab = (typeof TABS)[number];

function getYtId(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
  } catch { return null; }
}

export default function AdminContenuClient({ egliseSlug, initialAnnonces, initialEvenements, initialPages, initialVideos }: Props) {
  const [tab, setTab] = useState<Tab>("Pages");
  const [annonces, setAnnonces] = useState<Annonce[]>(initialAnnonces);
  const [evenements, setEvenements] = useState<Evenement[]>(initialEvenements);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [busy, setBusy] = useState<number | null>(null);

  const base = `/api/admin/eglises/${egliseSlug}`;

  async function toggleAnnonce(a: Annonce) {
    setBusy(a.id);
    try {
      const res = await fetch(`${base}/annonces/${a.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !a.publie }),
      });
      if (res.ok) { const u = await res.json(); setAnnonces((p) => p.map((x) => x.id === a.id ? { ...x, publie: u.publie } : x)); }
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

  async function toggleEvenement(e: Evenement) {
    setBusy(e.id);
    try {
      const res = await fetch(`${base}/evenements/${e.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !e.publie }),
      });
      if (res.ok) { const u = await res.json(); setEvenements((p) => p.map((x) => x.id === e.id ? { ...x, publie: u.publie } : x)); }
    } finally { setBusy(null); }
  }
  async function deleteEvenement(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/evenements/${id}`, { method: "DELETE" });
      if (res.ok) setEvenements((p) => p.filter((e) => e.id !== id));
    } finally { setBusy(null); }
  }

  async function togglePage(p: Page) {
    setBusy(p.id);
    try {
      const res = await fetch(`${base}/pages/${p.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !p.publie }),
      });
      if (res.ok) { const u = await res.json(); setPages((prev) => prev.map((x) => x.id === p.id ? { ...x, publie: u.publie } : x)); }
    } finally { setBusy(null); }
  }
  async function deletePage(id: number) {
    if (!confirm("Supprimer cette page et toutes ses sections ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`${base}/pages/${id}`, { method: "DELETE" });
      if (res.ok) setPages((p) => p.filter((x) => x.id !== id));
    } finally { setBusy(null); }
  }

  async function toggleVideo(v: Video, field: "publie" | "epingle") {
    setBusy(v.id);
    try {
      const res = await fetch(`${base}/videos/${v.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !v[field] }),
      });
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

  const badge = (pub: boolean) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: pub ? "#dcfce7" : "#f1f5f9", color: pub ? "#15803d" : "#64748b", flexShrink: 0 }}>
      {pub ? "Publié" : "Brouillon"}
    </span>
  );
  const actionBtn = (label: string, onClick: () => void, s?: React.CSSProperties) => (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", ...s }}>{label}</button>
  );
  const delBtn = (onClick: () => void) => (
    <button onClick={onClick} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, color: "#b91c1c", cursor: "pointer" }}>Supprimer</button>
  );

  const counts: Record<Tab, number> = {
    Pages: pages.length,
    Annonces: annonces.length,
    "Événements": evenements.length,
    Vidéos: videos.length,
  };

  return (
    <>
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#f8fafc", borderRadius: 10, padding: 4 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
            background: tab === t ? "white" : "transparent", color: tab === t ? "#1e3a8a" : "#64748b",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>
            {t} <span style={{ fontSize: 11, fontWeight: 700, color: tab === t ? "#1e3a8a" : "#94a3b8" }}>({counts[t]})</span>
          </button>
        ))}
      </div>

      {tab === "Pages" && (
        pages.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucune page configurée.</p> : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8fafc" }}>
                {["TITRE", "TYPE", "SECTIONS", "STATUT", "ACTIONS"].map((h) => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{p.titre}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>/c/{p.slug}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b" }}>{typeLabels[p.type] ?? p.type}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b" }}>{p.sectionsCount}</td>
                    <td style={{ padding: "10px 14px" }}>{badge(p.publie)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {busy === p.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : <>
                          {actionBtn(p.publie ? "Dépublier" : "Publier", () => togglePage(p), { color: p.publie ? "#b45309" : "#15803d", background: p.publie ? "#fef3c7" : "#f0fdf4" })}
                          {delBtn(() => deletePage(p.id))}
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "Annonces" && (
        annonces.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucune annonce.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {annonces.map((a) => (
              <div key={a.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{a.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(a.datePublication).toLocaleDateString("fr-FR")}{a.categorie && ` · ${a.categorie}`} · Priorité: {a.priorite}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {badge(a.publie)}
                  {busy === a.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : <>
                    {actionBtn(a.publie ? "Dépublier" : "Publier", () => toggleAnnonce(a), { color: a.publie ? "#b45309" : "#15803d", background: a.publie ? "#fef3c7" : "#f0fdf4" })}
                    {delBtn(() => deleteAnnonce(a.id))}
                  </>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "Événements" && (
        evenements.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucun événement.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {evenements.map((e) => (
              <div key={e.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{e.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>📅 {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}{e.lieu && ` · 📍 ${e.lieu}`}{e.categorie && ` · ${e.categorie}`}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {badge(e.publie)}
                  {busy === e.id ? <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span> : <>
                    {actionBtn(e.publie ? "Dépublier" : "Publier", () => toggleEvenement(e), { color: e.publie ? "#b45309" : "#15803d", background: e.publie ? "#fef3c7" : "#f0fdf4" })}
                    {delBtn(() => deleteEvenement(e.id))}
                  </>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "Vidéos" && (
        videos.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucune vidéo.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {videos.map((v) => {
              const ytId = getYtId(v.urlYoutube);
              return (
                <div key={v.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  {ytId && (
                    <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {v.estEnDirect && (
                        <div style={{ position: "absolute", top: 8, left: 8, background: "#dc2626", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>🔴 DIRECT</div>
                      )}
                    </div>
                  )}
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      {badge(v.publie)}
                      {v.epingle && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>📌 Épinglé</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.titre}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{new Date(v.createdAt).toLocaleDateString("fr-FR")}</div>
                    {busy === v.id ? (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span>
                    ) : (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {actionBtn(v.publie ? "Dépublier" : "Publier", () => toggleVideo(v, "publie"), { color: v.publie ? "#b45309" : "#15803d", background: v.publie ? "#fef3c7" : "#f0fdf4" })}
                        {actionBtn(v.epingle ? "Désépingler" : "Épingler", () => toggleVideo(v, "epingle"), { color: "#7c3aed", background: "#f5f3ff" })}
                        {delBtn(() => deleteVideo(v.id))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </>
  );
}
