"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface LogEntry {
  id: number;
  acteurNom: string;
  action: string;
  entiteType: string;
  entiteId: number | null;
  entiteLabel: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  creer: "a créé",
  modifier: "a modifié",
  supprimer: "a supprimé",
  suspendre: "a suspendu",
  reactiver: "a réactivé",
  inviter: "a invité",
  revoquer: "a révoqué",
  publier: "a publié",
  depublier: "a dépublié",
};

const ENTITY_ICONS: Record<string, string> = {
  annonce: "📢",
  evenement: "🗓️",
  page: "📄",
  membre: "👤",
  eglise: "⛪",
  admin: "🔐",
  role: "🏷️",
};

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  creer: { bg: "#dcfce7", color: "#15803d" },
  modifier: { bg: "#dbeafe", color: "#1d4ed8" },
  supprimer: { bg: "#fee2e2", color: "#b91c1c" },
  suspendre: { bg: "#fee2e2", color: "#b91c1c" },
  reactiver: { bg: "#dcfce7", color: "#15803d" },
  inviter: { bg: "#e0e7ff", color: "#4338ca" },
  revoquer: { bg: "#fef3c7", color: "#b45309" },
  publier: { bg: "#dcfce7", color: "#15803d" },
  depublier: { bg: "#f1f5f9", color: "#64748b" },
};

const ALL_ACTIONS = ["creer", "modifier", "supprimer", "suspendre", "reactiver", "inviter", "revoquer"];

export default function GestionJournalClient({
  logs,
  selectedAction,
}: {
  logs: LogEntry[];
  selectedAction: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [action, setAction] = useState(selectedAction);

  function applyFilter(newAction: string) {
    const params = new URLSearchParams();
    if (newAction) params.set("action", newAction);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        background: "white", borderRadius: 12, padding: "1rem 1.25rem",
        border: "1px solid #e2e8f0", marginBottom: 20,
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
      }}>
        <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Filtrer par action :</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => { setAction(""); applyFilter(""); }}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: action === "" ? "none" : "1.5px solid #e2e8f0",
              background: action === "" ? "#1e3a8a" : "white",
              color: action === "" ? "white" : "#374151",
              fontWeight: action === "" ? 700 : 400,
            }}
          >
            Toutes
          </button>
          {ALL_ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => { setAction(a); applyFilter(a); }}
              style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                border: action === a ? "none" : "1.5px solid #e2e8f0",
                background: action === a ? "#1e3a8a" : "white",
                color: action === a ? "white" : "#374151",
                fontWeight: action === a ? 700 : 400,
              }}
            >
              {ACTION_LABELS[a] ?? a}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
          {logs.length} entrée{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log list */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Aucune activité enregistrée.
            <div style={{ marginTop: 8, fontSize: 12 }}>Les actions comme créer ou modifier une annonce apparaîtront ici.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {logs.map((log, i) => {
              const ac = ACTION_COLORS[log.action] ?? { bg: "#f1f5f9", color: "#64748b" };
              const icon = ENTITY_ICONS[log.entiteType] ?? "📌";
              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "14px 20px",
                    borderBottom: i < logs.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: ac.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5 }}>
                      <strong>{log.acteurNom}</strong>
                      {" "}
                      <span style={{ ...badgeStyle, background: ac.bg, color: ac.color }}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {" "}
                      <span style={{ color: "#64748b" }}>{log.entiteType}</span>
                      {log.entiteLabel && (
                        <> : <span style={{ fontWeight: 600, color: "#1e3a8a" }}>{log.entiteLabel}</span></>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, textAlign: "right" }}>
                    {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                    <div>{new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block", padding: "1px 7px", borderRadius: 100, fontSize: 11, fontWeight: 700,
};
