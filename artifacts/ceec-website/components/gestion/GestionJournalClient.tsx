"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Megaphone, Calendar, FileText, User, Church, Lock, Tag, Pin } from "lucide-react";

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

function EntityIcon({ type, color }: { type: string; color: string }) {
  const props = { size: 16, color };
  switch (type) {
    case "annonce":   return <Megaphone {...props} />;
    case "evenement": return <Calendar {...props} />;
    case "page":      return <FileText {...props} />;
    case "membre":    return <User {...props} />;
    case "eglise":    return <Church {...props} />;
    case "admin":     return <Lock {...props} />;
    case "role":      return <Tag {...props} />;
    default:          return <Pin {...props} />;
  }
}

const ACTION_COLORS: Record<string, { bg: string; color: string; badgeCls: string }> = {
  creer:     { bg: "bg-green-100",  color: "#15803d", badgeCls: "badge badge-success" },
  modifier:  { bg: "bg-blue-100",   color: "#1d4ed8", badgeCls: "badge badge-primary" },
  supprimer: { bg: "bg-red-100",    color: "#b91c1c", badgeCls: "badge badge-danger" },
  suspendre: { bg: "bg-red-100",    color: "#b91c1c", badgeCls: "badge badge-danger" },
  reactiver: { bg: "bg-green-100",  color: "#15803d", badgeCls: "badge badge-success" },
  inviter:   { bg: "bg-indigo-100", color: "#4338ca", badgeCls: "badge badge-primary" },
  revoquer:  { bg: "bg-amber-100",  color: "#b45309", badgeCls: "badge badge-warning" },
  publier:   { bg: "bg-green-100",  color: "#15803d", badgeCls: "badge badge-success" },
  depublier: { bg: "bg-slate-100",  color: "#64748b", badgeCls: "badge badge-muted" },
};

const ALL_ACTIONS = ["creer", "modifier", "supprimer", "suspendre", "reactiver", "inviter", "revoquer"];

const DATE_RANGES = [
  { value: "", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "30d", label: "30 derniers jours" },
];

export default function GestionJournalClient({
  logs,
  selectedAction,
  selectedDate,
}: {
  logs: LogEntry[];
  selectedAction: string;
  selectedDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [action, setAction] = useState(selectedAction);
  const [dateRange, setDateRange] = useState(selectedDate);

  function applyFilters(newAction: string, newDate: string) {
    const params = new URLSearchParams();
    if (newAction) params.set("action", newAction);
    if (newDate) params.set("date", newDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = action || dateRange;

  return (
    <div>
      {/* Filter bar */}
      <div className="card flex flex-wrap items-center gap-3 p-4 px-5 mb-5">
        {/* Action filter pills */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          <button
            onClick={() => { setAction(""); applyFilters("", dateRange); }}
            className={`btn btn-xs cursor-pointer ${
              action === "" ? "btn-primary" : "btn-outline border-border text-slate-700"
            }`}
          >
            Toutes
          </button>
          {ALL_ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => { setAction(a); applyFilters(a, dateRange); }}
              className={`btn btn-xs cursor-pointer ${
                action === a ? "btn-primary" : "btn-outline border-border text-slate-700"
              }`}
            >
              {ACTION_LABELS[a] ?? a}
            </button>
          ))}
        </div>

        {/* Date range filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-semibold">Période :</label>
          <select
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value); applyFilters(action, e.target.value); }}
            className="input select text-[13px] py-1.5 px-2.5 w-auto!"
          >
            {DATE_RANGES.map((dr) => (
              <option key={dr.value} value={dr.value}>{dr.label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setAction(""); setDateRange(""); applyFilters("", ""); }}
            className="btn btn-xs btn-ghost bg-primary-50 text-muted-foreground cursor-pointer"
          >
            Réinitialiser
          </button>
        )}

        <span className="text-xs text-slate-400 shrink-0">
          {logs.length} entrée{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log list */}
      <div className="card overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Aucune activité enregistrée.
            <div className="mt-2 text-xs">Les actions comme créer ou modifier une annonce apparaîtront ici.</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {logs.map((log, i) => {
              const ac = ACTION_COLORS[log.action] ?? { bg: "bg-slate-100", color: "#64748b", badgeCls: "badge badge-muted" };
              return (
                <div
                  key={log.id}
                  className={`flex gap-3 items-start py-3.5 px-5 ${
                    i < logs.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full shrink-0 ${ac.bg} flex items-center justify-center`}>
                    <EntityIcon type={log.entiteType} color={ac.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-foreground leading-relaxed">
                      <strong>{log.acteurNom}</strong>
                      {" "}
                      <span className={ac.badgeCls}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {" "}
                      <span className="text-muted-foreground">{log.entiteType}</span>
                      {log.entiteLabel && (
                        <> : <span className="font-semibold text-primary">{log.entiteLabel}</span></>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 shrink-0 text-right">
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
