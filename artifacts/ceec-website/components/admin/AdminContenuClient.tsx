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

type Props = {
  egliseSlug: string;
  initialAnnonces: Annonce[];
  initialEvenements: Evenement[];
  initialPages: Page[];
};

const typeLabels: Record<string, string> = {
  accueil: "Accueil", about: "À propos", contact: "Contact", departements: "Ministères", custom: "Page libre",
};

const TABS = ["Pages", "Annonces", "Événements"] as const;
type Tab = (typeof TABS)[number];

export default function AdminContenuClient({ egliseSlug, initialAnnonces, initialEvenements, initialPages }: Props) {
  const [tab, setTab] = useState<Tab>("Pages");
  const [annonces, setAnnonces] = useState<Annonce[]>(initialAnnonces);
  const [evenements, setEvenements] = useState<Evenement[]>(initialEvenements);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [busy, setBusy] = useState<number | null>(null);

  async function toggleAnnonce(a: Annonce) {
    setBusy(a.id);
    try {
      const res = await fetch(`/api/admin/eglises/${egliseSlug}/annonces/${a.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !a.publie }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAnnonces((prev) => prev.map((x) => (x.id === a.id ? { ...x, publie: updated.publie } : x)));
      }
    } finally { setBusy(null); }
  }

  async function deleteAnnonce(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/eglises/${egliseSlug}/annonces/${id}`, { method: "DELETE" });
      if (res.ok) setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } finally { setBusy(null); }
  }

  async function toggleEvenement(e: Evenement) {
    setBusy(e.id);
    try {
      const res = await fetch(`/api/admin/eglises/${egliseSlug}/evenements/${e.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !e.publie }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvenements((prev) => prev.map((x) => (x.id === e.id ? { ...x, publie: updated.publie } : x)));
      }
    } finally { setBusy(null); }
  }

  async function deleteEvenement(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/eglises/${egliseSlug}/evenements/${id}`, { method: "DELETE" });
      if (res.ok) setEvenements((prev) => prev.filter((e) => e.id !== id));
    } finally { setBusy(null); }
  }

  async function togglePage(p: Page) {
    setBusy(p.id);
    try {
      const res = await fetch(`/api/admin/eglises/${egliseSlug}/pages/${p.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publie: !p.publie }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPages((prev) => prev.map((x) => (x.id === p.id ? { ...x, publie: updated.publie } : x)));
      }
    } finally { setBusy(null); }
  }

  async function deletePage(id: number) {
    if (!confirm("Supprimer cette page et toutes ses sections ?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/eglises/${egliseSlug}/pages/${id}`, { method: "DELETE" });
      if (res.ok) setPages((prev) => prev.filter((p) => p.id !== id));
    } finally { setBusy(null); }
  }

  const publishedBadge = (pub: boolean) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: pub ? "#dcfce7" : "#f1f5f9", color: pub ? "#15803d" : "#64748b", flexShrink: 0 }}>
      {pub ? "Publié" : "Brouillon"}
    </span>
  );

  const actionBtn = (label: string, onClick: () => void, style?: React.CSSProperties) => (
    <button
      onClick={onClick}
      style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", ...style }}
    >
      {label}
    </button>
  );

  const deleteBtn = (onClick: () => void) => (
    <button
      onClick={onClick}
      style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", fontSize: 12, color: "#b91c1c", cursor: "pointer" }}
    >
      Supprimer
    </button>
  );

  return (
    <>
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#f8fafc", borderRadius: 10, padding: 4 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "#1e3a8a" : "#64748b",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: tab === t ? "#1e3a8a" : "#94a3b8" }}>
              ({t === "Pages" ? pages.length : t === "Annonces" ? annonces.length : evenements.length})
            </span>
          </button>
        ))}
      </div>

      {tab === "Pages" && (
        pages.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucune page configurée.</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["TITRE", "TYPE", "SECTIONS", "STATUT", "ACTIONS"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{p.titre}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>/c/{p.slug}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b" }}>{typeLabels[p.type] ?? p.type}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b" }}>{p.sectionsCount}</td>
                    <td style={{ padding: "10px 14px" }}>{publishedBadge(p.publie)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {busy === p.id ? (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span>
                        ) : (
                          <>
                            {actionBtn(p.publie ? "Dépublier" : "Publier", () => togglePage(p), { color: p.publie ? "#b45309" : "#15803d", background: p.publie ? "#fef3c7" : "#f0fdf4" })}
                            {deleteBtn(() => deletePage(p.id))}
                          </>
                        )}
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
        annonces.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucune annonce.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {annonces.map((a) => (
              <div key={a.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{a.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {new Date(a.datePublication).toLocaleDateString("fr-FR")}
                    {a.categorie && ` · ${a.categorie}`}
                    {" · "}Priorité: {a.priorite}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {publishedBadge(a.publie)}
                  {busy === a.id ? (
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span>
                  ) : (
                    <>
                      {actionBtn(a.publie ? "Dépublier" : "Publier", () => toggleAnnonce(a), { color: a.publie ? "#b45309" : "#15803d", background: a.publie ? "#fef3c7" : "#f0fdf4" })}
                      {deleteBtn(() => deleteAnnonce(a.id))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "Événements" && (
        evenements.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "3rem" }}>Aucun événement.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {evenements.map((e) => (
              <div key={e.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{e.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    📅 {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {e.lieu && ` · 📍 ${e.lieu}`}
                    {e.categorie && ` · ${e.categorie}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {publishedBadge(e.publie)}
                  {busy === e.id ? (
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>…</span>
                  ) : (
                    <>
                      {actionBtn(e.publie ? "Dépublier" : "Publier", () => toggleEvenement(e), { color: e.publie ? "#b45309" : "#15803d", background: e.publie ? "#fef3c7" : "#f0fdf4" })}
                      {deleteBtn(() => deleteEvenement(e.id))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}
