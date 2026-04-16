"use client";

import React, { useState } from "react";
import { CheckCircle, CalendarDays } from "lucide-react";

type ContenuEnAttente = {
  id: number;
  type: "annonce" | "evenement";
  titre: string;
  egliseNom: string | null;
  createdAt: string;
  contenu?: string | null;
  dateDebut?: string | null;
};

interface Props {
  items: ContenuEnAttente[];
}

function itemKey(type: "annonce" | "evenement", id: number) {
  return `${type}-${id}`;
}

export default function AdminValidationQueue({ items: initialItems }: Props) {
  const [items, setItems] = useState<ContenuEnAttente[]>(initialItems);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectKey, setRejectKey] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState("");

  async function handleAction(
    id: number,
    type: "annonce" | "evenement",
    action: "approuver" | "rejeter",
    comment?: string
  ) {
    setLoading(itemKey(type, id));
    try {
      const res = await fetch(`/api/admin/contenus/${id}/valider`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action, commentaire: comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erreur");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id || item.type !== type));
      setRejectKey(null);
      setCommentaire("");
    } finally {
      setLoading(null);
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "2rem", textAlign: "center" }}>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><CheckCircle size={36} style={{ color: "#15803d" }} /></div>
        <p style={{ color: "#64748b", fontSize: 14 }}>Aucun contenu en attente de validation.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => {
        const isLoading = loading === itemKey(item.type, item.id);
        const typeLabel = item.type === "annonce" ? "Annonce" : "Événement";
        const typeColor = item.type === "annonce" ? { bg: "#eff6ff", color: "#1e40af" } : { bg: "#f0fdf4", color: "#15803d" };

        return (
          <div key={`${item.type}-${item.id}`} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" as const }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: typeColor.bg, color: typeColor.color }}>
                    {typeLabel}
                  </span>
                  {item.egliseNom && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {item.egliseNom}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>{item.titre}</div>
                {item.contenu && (
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                    {item.contenu}
                  </p>
                )}
                {item.dateDebut && (
                  <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarDays size={13} /> {new Date(item.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                <button
                  onClick={() => { setRejectKey(itemKey(item.type, item.id)); setCommentaire(""); }}
                  disabled={isLoading}
                  style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handleAction(item.id, item.type, "approuver")}
                  disabled={isLoading}
                  style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#16a34a", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  {isLoading ? "…" : "Approuver"}
                </button>
              </div>
            </div>

            {rejectKey === itemKey(item.type, item.id) && (
              <div style={{ marginTop: 14, padding: "1rem", background: "#fff7ed", borderRadius: 10, border: "1px solid #fed7aa" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Motif du rejet (facultatif)
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={2}
                  placeholder="Ex: Le contenu ne respecte pas les guidelines..."
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setRejectKey(null); setCommentaire(""); }}
                    style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleAction(item.id, item.type, "rejeter", commentaire || undefined)}
                    disabled={isLoading}
                    style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#dc2626", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    {isLoading ? "…" : "Confirmer le rejet"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
