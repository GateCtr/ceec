"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, ArrowLeft, CheckCircle, XCircle, Download, Plus, Calendar } from "lucide-react";
import QRCode from "qrcode";

const PRIMARY = "#1e3a8a";
const GOLD = "#c59b2e";

interface Marathon {
  id: number; titre: string; theme: string | null; referenceBiblique: string | null;
  dateDebut: string; dateFin: string; nombreJours: number; statut: string;
  denomination: string; logoUrl: string | null; joursExclus: string[];
}
interface Participant {
  id: number; nom: string; prenom: string; email: string | null; numeroId: string; qrToken: string;
  presences: { numeroJour: number; statut: string; date: string }[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function MembreMarathonDetailClient({
  marathon, participant, membreId,
}: { marathon: Marathon; participant: Participant | null; membreId: number }) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [inscrit, setInscrit] = useState(!!participant);
  const [currentParticipant, setCurrentParticipant] = useState(participant);
  const [inscribing, setInscribing] = useState(false);
  const [printingBadge, setPrintingBadge] = useState(false);

  useEffect(() => {
    if (currentParticipant?.qrToken) {
      QRCode.toDataURL(currentParticipant.qrToken, {
        width: 200, margin: 1,
        color: { dark: PRIMARY, light: "#ffffff" },
      }).then(setQrDataUrl);
    }
  }, [currentParticipant]);

  const handleInscrire = async () => {
    setInscribing(true);
    const res = await fetch(`/api/membre/marathons/${marathon.id}/inscrire`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setInscrit(true);
      setCurrentParticipant({ ...data, presences: [] });
    }
    setInscribing(false);
  };

  const handlePrintBadge = async () => {
    if (!currentParticipant || !qrDataUrl) return;
    setPrintingBadge(true);
    const win = window.open("", "_blank", "width=600,height=750");
    if (!win) { setPrintingBadge(false); return; }
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Badge ${currentParticipant.prenom} ${currentParticipant.nom}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Georgia,serif;background:#f5f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh}
      .card{width:86mm;background:white;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
      .header{background:${PRIMARY};color:white;padding:20px 16px;text-align:center}
      .header h1{font-size:12px;font-weight:400;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;opacity:0.8}
      .header h2{font-size:18px;font-weight:700;margin-bottom:4px}
      .header p{font-size:10px;opacity:0.7}
      .body{padding:20px;display:flex;flex-direction:column;align-items:center;gap:14px}
      .name{font-size:19px;font-weight:700;color:${PRIMARY};text-align:center}
      .qr-wrap{border:3px solid ${GOLD};border-radius:8px;padding:6px}
      .num{font-size:15px;font-weight:700;color:${GOLD};letter-spacing:3px;border-top:1px solid #e5e7eb;padding-top:12px;width:100%;text-align:center}
      .ref{font-size:9px;color:#6b7280;text-align:center;font-style:italic;padding:0 10px}
      @media print{body{background:white}.card{box-shadow:none}}
    </style></head><body>
    <div class="card">
      <div class="header">
        ${marathon.logoUrl ? `<img src="${marathon.logoUrl}" style="height:36px;margin-bottom:8px;object-fit:contain" alt="">` : ""}
        <h1>${marathon.denomination}</h1>
        <h2>${marathon.titre}</h2>
        ${marathon.theme ? `<p>${marathon.theme}</p>` : ""}
        <p style="margin-top:4px;font-size:9px">${formatDate(marathon.dateDebut)} – ${formatDate(marathon.dateFin)}</p>
      </div>
      <div class="body">
        <div class="name">${currentParticipant.prenom} ${currentParticipant.nom}</div>
        <div class="qr-wrap"><img src="${qrDataUrl}" alt="QR" style="width:130px;height:130px;display:block"></div>
        <div class="num">${currentParticipant.numeroId}</div>
        ${marathon.referenceBiblique ? `<div class="ref">${marathon.referenceBiblique}</div>` : ""}
      </div>
    </div>
    <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    setPrintingBadge(false);
  };

  const presents = currentParticipant?.presences.filter((p) => p.statut === "present").length ?? 0;
  const total = currentParticipant?.presences.length ?? 0;

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => router.push("/c/marathons")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: PRIMARY, fontWeight: 600, fontSize: 13.5, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={15} /> Retour aux marathons
      </button>

      {/* Marathon header */}
      <div style={{ background: PRIMARY, borderRadius: 16, padding: "1.75rem", marginBottom: "1.5rem", color: "white" }}>
        {marathon.logoUrl && <img src={marathon.logoUrl} alt="" style={{ height: 40, objectFit: "contain", marginBottom: 12 }} />}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, marginBottom: 6 }}>{marathon.titre}</h1>
            {marathon.theme && <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>{marathon.theme}</p>}
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, opacity: 0.7, display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={13} /> {formatDate(marathon.dateDebut)} – {formatDate(marathon.dateFin)}
              </span>
              <span style={{ fontSize: 12.5, opacity: 0.7 }}>{marathon.nombreJours} jours</span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 100, background: marathon.statut === "ouvert" ? "#dcfce7" : "rgba(255,255,255,0.15)", color: marathon.statut === "ouvert" ? "#15803d" : "rgba(255,255,255,0.7)", flexShrink: 0 }}>
            {marathon.statut === "ouvert" ? "Inscriptions ouvertes" : "Clos"}
          </span>
        </div>
        {marathon.referenceBiblique && (
          <p style={{ marginTop: 14, fontSize: 12, fontStyle: "italic", opacity: 0.65, borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 12 }}>
            &ldquo;{marathon.referenceBiblique}&rdquo;
          </p>
        )}
      </div>

      {/* Inscription / Carte */}
      {!inscrit ? (
        <div style={{ background: "white", border: "2px dashed #e5e7eb", borderRadius: 16, padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <Trophy size={40} color="#d1d5db" style={{ marginBottom: 14 }} />
          <h3 style={{ color: PRIMARY, marginBottom: 8 }}>Participez au marathon</h3>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Inscrivez-vous pour recevoir votre carte de participant avec QR code.</p>
          {marathon.statut === "ouvert" ? (
            <button onClick={handleInscrire} disabled={inscribing} style={{ padding: "11px 24px", background: PRIMARY, color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: inscribing ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} /> {inscribing ? "Inscription..." : "S'inscrire au marathon"}
            </button>
          ) : (
            <span style={{ color: "#9ca3af", fontSize: 14 }}>Les inscriptions sont closes.</span>
          )}
        </div>
      ) : currentParticipant && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: "1.5rem" }}>
          {/* Card */}
          <div style={{ background: "white", border: `2px solid ${GOLD}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(197,155,46,0.15)" }}>
            <div style={{ background: PRIMARY, padding: "1rem", textAlign: "center", color: "white" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: 4 }}>Carte de participant</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{marathon.titre}</div>
            </div>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: PRIMARY }}>{currentParticipant.prenom} {currentParticipant.nom}</div>
              {qrDataUrl && (
                <div style={{ border: `3px solid ${GOLD}`, borderRadius: 10, padding: 6 }}>
                  <img src={qrDataUrl} alt="QR Code" style={{ width: 120, height: 120, display: "block" }} />
                </div>
              )}
              <div style={{ fontWeight: 700, letterSpacing: "3px", color: GOLD, fontSize: 14 }}>{currentParticipant.numeroId}</div>
              <button onClick={handlePrintBadge} disabled={printingBadge || !qrDataUrl} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "#f0fdf4", color: "#15803d", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                <Download size={14} /> {printingBadge ? "..." : "Imprimer ma carte"}
              </button>
            </div>
          </div>

          {/* Présences */}
          <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "1.25rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: PRIMARY, marginBottom: 14 }}>Mes présences</h3>
            {total === 0 ? (
              <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "1rem" }}>Aucune journée enregistrée</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{presents}/{total} journées</span>
                  <div style={{ height: 6, width: 100, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: total > 0 ? `${(presents / total) * 100}%` : "0%", background: presents === total ? "#16a34a" : PRIMARY }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(44px,1fr))", gap: 6 }}>
                  {currentParticipant.presences.map((p) => (
                    <div key={p.numeroJour} title={`Jour ${p.numeroJour} – ${p.statut}`} style={{ background: p.statut === "present" ? "#dcfce7" : "#fee2e2", borderRadius: 8, padding: "6px 4px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 9, color: p.statut === "present" ? "#15803d" : "#b91c1c", fontWeight: 600 }}>J{p.numeroJour}</span>
                      {p.statut === "present" ? <CheckCircle size={14} color="#15803d" /> : <XCircle size={14} color="#b91c1c" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
