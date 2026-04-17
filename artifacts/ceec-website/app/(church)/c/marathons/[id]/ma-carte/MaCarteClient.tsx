"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

const PRIMARY = "#1e3a8a";
const GOLD = "#c59b2e";

interface Props {
  marathonId: number;
  marathon: {
    titre: string;
    theme: string | null;
    referenceBiblique: string | null;
    denomination: string;
    logoUrl: string | null;
    dateDebut: string;
    dateFin: string;
  };
  participant: {
    id: number;
    nom: string;
    prenom: string;
    email: string | null;
    numeroId: string;
    qrToken: string;
  };
}

export default function MaCarteClient({ marathonId, marathon, participant }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(participant.qrToken, {
      width: 180,
      margin: 1,
      color: { dark: PRIMARY, light: "#ffffff" },
    }).then(setQrDataUrl).catch(() => {});
  }, [participant.qrToken]);

  const handleDownloadPdf = () => {
    window.open(`/api/membre/marathons/${marathonId}/badge`, "_blank");
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const win = window.open("", "_blank", "width=500,height=380");
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ma carte – ${marathon.titre}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Georgia,serif;background:white;display:flex;align-items:center;justify-content:center;min-height:100vh}
      .card{width:86mm;border:1px solid #1e3a8a;border-radius:6px;overflow:hidden;page-break-inside:avoid}
      .header{background:#1e3a8a;color:white;padding:12px;text-align:center}
      .denom{font-size:9px;letter-spacing:1px;opacity:0.8;text-transform:uppercase}
      .titre{font-size:13px;font-weight:700;margin:3px 0}
      .theme{font-size:9px;opacity:0.75}
      .dates{font-size:8px;opacity:0.6;margin-top:3px}
      .body{padding:12px;display:flex;align-items:center;gap:10px}
      .info{flex:1}
      .name{font-size:14px;font-weight:700;color:#1e3a8a}
      .id{font-size:11px;font-weight:700;color:#c59b2e;margin:3px 0}
      .ref{font-size:8px;color:#6b7280;font-style:italic}
      .qr-wrap{border:2px solid #c59b2e;border-radius:5px;padding:4px;flex-shrink:0}
      @media print{body{background:white}.card{box-shadow:none}}
    </style></head><body>
    <div class="card">
      <div class="header">
        ${marathon.logoUrl ? `<img src="${marathon.logoUrl}" style="height:28px;margin-bottom:4px;object-fit:contain" alt="">` : ""}
        <div class="denom">${marathon.denomination}</div>
        <div class="titre">${marathon.titre}</div>
        ${marathon.theme ? `<div class="theme">${marathon.theme}</div>` : ""}
        <div class="dates">${marathon.dateDebut} – ${marathon.dateFin}</div>
      </div>
      <div class="body">
        <div class="info">
          <div class="name">${participant.prenom} ${participant.nom}</div>
          <div class="id">${participant.numeroId}</div>
          ${marathon.referenceBiblique ? `<div class="ref">${marathon.referenceBiblique}</div>` : ""}
        </div>
        <div class="qr-wrap"><img src="${qrDataUrl}" alt="QR" style="width:90px;height:90px;display:block"></div>
      </div>
    </div>
    <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
      <Link
        href={`/c/marathons/${marathonId}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, color: PRIMARY, fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Retour au marathon
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Trophy size={22} color={GOLD} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY }}>Ma carte de présence</h1>
      </div>

      {/* Badge Card */}
      <div style={{ background: "white", border: `2px solid ${PRIMARY}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(30,58,138,0.12)", marginBottom: 24 }}>
        <div style={{ background: PRIMARY, padding: "20px 18px", textAlign: "center" }}>
          {marathon.logoUrl && (
            <img src={marathon.logoUrl} alt="" style={{ height: 36, objectFit: "contain", marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
          )}
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {marathon.denomination}
          </div>
          <div style={{ color: "white", fontSize: 17, fontWeight: 700, marginBottom: marathon.theme ? 4 : 0 }}>
            {marathon.titre}
          </div>
          {marathon.theme && (
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>{marathon.theme}</div>
          )}
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 6 }}>
            {marathon.dateDebut} – {marathon.dateFin}
          </div>
        </div>

        <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY }}>
              {participant.prenom} {participant.nom}
            </div>
            {participant.email && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{participant.email}</div>
            )}
            <div style={{ marginTop: 10, display: "inline-block", background: "#fef9c3", border: `1.5px solid ${GOLD}`, borderRadius: 8, padding: "5px 14px" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: GOLD, letterSpacing: 2 }}>
                {participant.numeroId}
              </span>
            </div>
            {marathon.referenceBiblique && (
              <div style={{ marginTop: 10, fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>
                {marathon.referenceBiblique}
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0 }}>
            {qrDataUrl ? (
              <div style={{ border: `3px solid ${GOLD}`, borderRadius: 10, padding: 8, background: "white" }}>
                <img src={qrDataUrl} alt="QR Code" style={{ width: 110, height: 110, display: "block" }} />
              </div>
            ) : (
              <div style={{ width: 126, height: 126, border: `3px solid ${GOLD}`, borderRadius: 10, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db" }}>
                QR…
              </div>
            )}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, textAlign: "center" }}>
        Présentez ce code QR à l'entrée de chaque journée du marathon.
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={handleDownloadPdf}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: PRIMARY, color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          <Download size={16} /> Télécharger en PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={!qrDataUrl}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#f0fdf4", color: "#166534", border: "1.5px solid #bbf7d0", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: qrDataUrl ? "pointer" : "not-allowed" }}
        >
          🖨️ Imprimer
        </button>
      </div>
    </div>
  );
}
