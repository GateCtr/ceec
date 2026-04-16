"use client";

import { useState } from "react";
import { Church, MapPin } from "lucide-react";

type Eglise = {
  id: number;
  nom: string;
  slug: string | null;
  ville: string;
  pasteur: string | null;
  inscriptionUrl: string | null;
};

export default function ChurchPickerClient({ eglises }: { eglises: Eglise[] }) {
  const [query, setQuery] = useState("");

  const filtered = eglises.filter((e) => {
    const q = query.toLowerCase();
    return (
      e.nom.toLowerCase().includes(q) ||
      e.ville.toLowerCase().includes(q) ||
      (e.pasteur ?? "").toLowerCase().includes(q)
    );
  });

  if (eglises.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "2rem 1rem",
        background: "#f8fafc",
        borderRadius: 10,
        border: "1.5px dashed #cbd5e1",
        color: "#64748b",
        fontSize: 14,
      }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><Church size={32} style={{ color: "#94a3b8" }} /></div>
        <p style={{ margin: 0, fontWeight: 600 }}>Aucune paroisse disponible pour le moment.</p>
        <p style={{ margin: "6px 0 0", fontSize: 13 }}>Contactez la CEEC pour rejoindre une paroisse.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Barre de recherche */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 16,
            height: 16,
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une paroisse ou une ville…"
          style={{
            width: "100%",
            padding: "10px 14px 10px 38px",
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
            color: "#0f172a",
          }}
          autoFocus
        />
      </div>

      {/* Liste */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxHeight: 340,
        overflowY: "auto",
        paddingRight: 2,
      }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: 14 }}>
            Aucune paroisse trouvée pour &laquo;&nbsp;{query}&nbsp;&raquo;
          </div>
        ) : (
          filtered.map((eglise) => (
            eglise.inscriptionUrl ? (
              <a
                key={eglise.id}
                href={eglise.inscriptionUrl}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  textDecoration: "none",
                  background: "white",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1e3a8a";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(30,58,138,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Avatar initiale */}
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 17,
                  flexShrink: 0,
                }}>
                  {eglise.nom.charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {eglise.nom}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} />{eglise.ville}
                    {eglise.pasteur && (
                      <span style={{ marginLeft: 6 }}>· Pst. {eglise.pasteur}</span>
                    )}
                  </div>
                </div>

                {/* Flèche */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  style={{ width: 16, height: 16, flexShrink: 0 }}
                >
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <div
                key={eglise.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #f1f5f9",
                  background: "#f8fafc",
                  opacity: 0.6,
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 17,
                  flexShrink: 0,
                }}>
                  {eglise.nom.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#64748b" }}>{eglise.nom}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} />{eglise.ville} · Portail non configuré
                  </div>
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* Compteur */}
      {filtered.length > 0 && (
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
          {filtered.length} paroisse{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
          {query && ` pour « ${query} »`}
        </p>
      )}
    </div>
  );
}
