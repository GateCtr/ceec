"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, Users, Lock, Plus, CheckCircle, LogIn } from "lucide-react";

const PRIMARY = "#1e3a8a";

interface MarathonItem {
  id: number; titre: string; theme: string | null;
  dateDebut: string; nombreJours: number; statut: string;
  nbParticipants: number; inscrit: boolean;
}

export default function MembreMarathonsClient({
  marathons, egliseId, isConnected, isMembre,
}: { marathons: MarathonItem[]; egliseId: number; isConnected: boolean; isMembre: boolean }) {
  const router = useRouter();
  const [participationLoading, setParticipationLoading] = useState<number | null>(null);
  const [statuts, setStatuts] = useState<Record<number, boolean>>(
    Object.fromEntries(marathons.map((m) => [m.id, m.inscrit]))
  );
  const [counts, setCounts] = useState<Record<number, number>>(
    Object.fromEntries(marathons.map((m) => [m.id, m.nbParticipants]))
  );

  const handleParticiper = async (marathonId: number) => {
    setParticipationLoading(marathonId);
    const res = await fetch(`/api/membre/marathons/${marathonId}/inscrire`, { method: "POST" });
    if (res.ok) {
      setStatuts((s) => ({ ...s, [marathonId]: true }));
      setCounts((c) => ({ ...c, [marathonId]: (c[marathonId] ?? 0) + 1 }));
    }
    setParticipationLoading(null);
  };

  if (marathons.length === 0) {
    return (
      <div style={{ padding: "3rem 2rem", textAlign: "center", background: "#f9fafb", minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <Trophy size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p style={{ color: "#6b7280", fontSize: 15 }}>Aucun marathon disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2.5rem 1rem 4rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 16 }}>
        {marathons.map((m) => {
          const participant = statuts[m.id];
          const nb = counts[m.id] ?? m.nbParticipants;
          return (
            <div
              key={m.id}
              style={{ background: "white", border: `1.5px solid ${participant ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}
              onClick={() => router.push(`/c/marathons/${m.id}`)}
            >
              <div style={{ height: 6, background: m.statut === "ouvert" ? PRIMARY : "#d1d5db" }} />
              <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: m.statut === "ouvert" ? "#eff6ff" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trophy size={22} color={m.statut === "ouvert" ? PRIMARY : "#9ca3af"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{m.titre}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: m.statut === "ouvert" ? "#dcfce7" : "#f3f4f6", color: m.statut === "ouvert" ? "#15803d" : "#6b7280" }}>
                      {m.statut === "ouvert" ? "Ouvert" : "Clos"}
                    </span>
                    {participant && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "#eff6ff", color: PRIMARY, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle size={11} /> Participant
                      </span>
                    )}
                  </div>
                  {m.theme && <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{m.theme}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} /> {new Date(m.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {m.nombreJours} jours
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} /> {nb} participant{nb > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {m.statut === "ouvert" && !participant ? (
                    !isConnected ? (
                      // Visiteur non connecté → invitation à se connecter
                      <button
                        onClick={() => router.push("/c/connexion")}
                        style={{ padding: "8px 14px", background: "transparent", color: PRIMARY, border: `1.5px solid ${PRIMARY}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                      >
                        <LogIn size={14} /> Se connecter
                      </button>
                    ) : isMembre ? (
                      // Membre connecté → peut participer
                      <button
                        onClick={() => handleParticiper(m.id)}
                        disabled={participationLoading === m.id}
                        style={{ padding: "8px 16px", background: PRIMARY, color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: participationLoading === m.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                      >
                        <Plus size={14} /> {participationLoading === m.id ? "..." : "Participer"}
                      </button>
                    ) : null // Connecté mais pas membre de cette église → pas de bouton
                  ) : participant ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                      <CheckCircle size={15} /> Participant
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#9ca3af" }}>
                      <Lock size={14} /> Clos
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
