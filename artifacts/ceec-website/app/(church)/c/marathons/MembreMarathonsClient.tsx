"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, Users, Lock, Plus, CheckCircle } from "lucide-react";

const PRIMARY = "#1e3a8a";
const GOLD = "#c59b2e";

interface MarathonItem {
  id: number; titre: string; theme: string | null;
  dateDebut: string; nombreJours: number; statut: string;
  nbParticipants: number; inscrit: boolean;
}

export default function MembreMarathonsClient({
  marathons, egliseId,
}: { marathons: MarathonItem[]; egliseId: number }) {
  const router = useRouter();
  const [inscriptionLoading, setInscriptionLoading] = useState<number | null>(null);
  const [statuts, setStatuts] = useState<Record<number, boolean>>(
    Object.fromEntries(marathons.map((m) => [m.id, m.inscrit]))
  );
  const [counts, setCounts] = useState<Record<number, number>>(
    Object.fromEntries(marathons.map((m) => [m.id, m.nbParticipants]))
  );

  const handleInscrire = async (marathonId: number, currentlyInscrit: boolean) => {
    if (currentlyInscrit) return;
    setInscriptionLoading(marathonId);
    const res = await fetch(`/api/membre/marathons/${marathonId}/inscrire`, { method: "POST" });
    if (res.ok) {
      setStatuts((s) => ({ ...s, [marathonId]: true }));
      setCounts((c) => ({ ...c, [marathonId]: (c[marathonId] ?? 0) + 1 }));
    }
    setInscriptionLoading(null);
  };

  if (marathons.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
          <Trophy size={24} color={PRIMARY} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: PRIMARY }}>Marathons de prière</h1>
        </div>
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#f9fafb", borderRadius: 16 }}>
          <Trophy size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p style={{ color: "#6b7280" }}>Aucun marathon disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={20} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: PRIMARY }}>Marathons de prière</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Retraites spirituelles de votre église</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {marathons.map((m) => {
          const inscrit = statuts[m.id];
          const nb = counts[m.id] ?? m.nbParticipants;
          return (
            <div
              key={m.id}
              style={{ background: "white", border: `1.5px solid ${inscrit ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}
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
                    {inscrit && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "#eff6ff", color: PRIMARY, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={11} /> Inscrit</span>}
                  </div>
                  {m.theme && <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{m.theme}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} /> {new Date(m.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {m.nombreJours} jours
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} /> {nb} inscrit{nb > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {m.statut === "ouvert" && !inscrit ? (
                    <button
                      onClick={() => handleInscrire(m.id, inscrit)}
                      disabled={inscriptionLoading === m.id}
                      style={{ padding: "8px 16px", background: PRIMARY, color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: inscriptionLoading === m.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                    >
                      <Plus size={14} /> {inscriptionLoading === m.id ? "..." : "S'inscrire"}
                    </button>
                  ) : inscrit ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                      <CheckCircle size={15} /> Inscrit
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
