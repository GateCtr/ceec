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
  egliseNom: string | null;
  createdAt: string;
}

interface EgliseOption {
  id: number;
  nom: string;
  slug: string;
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

const DATE_RANGES = [
  { value: "", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "30d", label: "30 derniers jours" },
];

export default function AdminLogsClient({
  logs,
  eglises,
  selectedEglise,
  selectedAction,
  selectedDate,
}: {
  logs: LogEntry[];
  eglises: EgliseOption[];
  selectedEglise: string;
  selectedAction: string;
  selectedDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [eglise, setEglise] = useState(selectedEglise);
  const [action, setAction] = useState(selectedAction);
  const [dateRange, setDateRange] = useState(selectedDate);

  function applyFilters(newEglise: string, newAction: string, newDate: string) {
    const params = new URLSearchParams();
    if (newEglise) params.set("eglise", newEglise);
    if (newAction) params.set("action", newAction);
    if (newDate) params.set("date", newDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = eglise || action || dateRange;

  return (
    <div>
      {/* Filters */}
      <div style={{
        background: "white", borderRadius: 12, padding: "1rem 1.25rem",
        border: "1px solid #e2e8f0", marginBottom: 20,
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Église :</label>
          <select
            value={eglise}
            onChange={(e) => { setEglise(e.target.value); applyFilters(e.target.value, action, dateRange); }}
            style={{ fontSize: 13, padding: "5px 10px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "white" }}
          >
            <option value="">Toutes les églises</option>
            {eglises.map((eg) => (
              <option key={eg.id} value={eg.slug}>{eg.nom}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Action :</label>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); applyFilters(eglise, e.target.value, dateRange); }}
            style={{ fontSize: 13, padding: "5px 10px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "white" }}
          >
            <option value="">Toutes les actions</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Période :</label>
          <select
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value); applyFilters(eglise, action, e.target.value); }}
            style={{ fontSize: 13, padding: "5px 10px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "white" }}
          >
            {DATE_RANGES.map((dr) => (
              <option key={dr.value} value={dr.value}>{dr.label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setEglise(""); setAction(""); setDateRange(""); router.push(pathname); }}
            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer" }}
          >
            Réinitialiser
          </button>
        )}

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
          {logs.length} entrée{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log list */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Aucune activité enregistrée pour ces filtres.
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
                    <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.4 }}>
                      <strong>{log.acteurNom}</strong>
                      {" "}
                      <span style={{ ...badgeStyle, background: ac.bg, color: ac.color }}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {" "}
                      <span style={{ color: "#64748b" }}>{log.entiteType}</span>
                      {log.entiteLabel && (
                        <> : <strong style={{ color: "#1e3a8a" }}>{log.entiteLabel}</strong></>
                      )}
                    </div>
                    {log.egliseNom && (
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                        ⛪ {log.egliseNom}
                      </div>
                    )}
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
