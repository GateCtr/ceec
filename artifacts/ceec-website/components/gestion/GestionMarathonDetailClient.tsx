"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, ArrowLeft, Users, BarChart3, Upload, Settings,
  Plus, Search, Download, CheckCircle, XCircle, X,
  Calendar, Link as LinkIcon, Copy, ClipboardList, Star, Play,
  Radio, UserCheck, UserX, Clock, RefreshCw, Mail, Send
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PRIMARY = "#1e3a8a";
const GOLD = "#c59b2e";

interface Marathon {
  id: number; titre: string; theme: string | null; referenceBiblique: string | null;
  dateDebut: string; nombreJours: number; statut: string; denomination: string | null;
  alerteSeuil: number; alerteHeure: string | null;
  eglise: { nom: string; logoUrl: string | null }; _count: { participants: number; presences: number };
}
interface AlerteRecord { id: number; numeroJour: number; taux: number; envoyeAt: string }
interface Participant {
  id: number; nom: string; prenom: string; email: string | null; numeroId: string;
  qrToken: string; dateInscription: string;
  presences: { id: number; numeroJour: number; statut: string; date: string }[];
  membre: { id: number; prenom: string; nom: string; email: string } | null;
}
interface Stat { jour: number; date: string; presents: number; absents: number; tauxPresence: number; isPast: boolean }
interface StatsData { totalParticipants: number; joursTotal: number; joursEcoules: number; byDay: Stat[]; sansFaute: { id: number; nom: string; prenom: string; numeroId: string }[]; todayDayNum: number | null }
interface ScanEntry { participantNom: string; participantPrenom: string; participantNumeroId: string; scanneParNom: string | null; scannedAt: string | null }
interface LiveData { liveToday: { scanned: number; expected: number; dayNum: number | null }; recentScans: ScanEntry[]; notYetScannedToday: { id: number; nom: string; prenom: string; numeroId: string }[] }

function formatDate(d: string) { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
function btn(extra?: object): React.CSSProperties { return { padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, ...extra }; }

export default function GestionMarathonDetailClient({ marathonId, egliseId }: { marathonId: number; egliseId: number }) {
  const router = useRouter();
  const [marathon, setMarathon] = useState<Marathon | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [tab, setTab] = useState<"participants" | "stats" | "import" | "config" | "live">("participants");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddPart, setShowAddPart] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ nom: "", prenom: "", email: "" });
  const [addError, setAddError] = useState("");
  const [csvResult, setCsvResult] = useState<{ added: number; skipped: number } | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [closingDay, setClosingDay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({ titre: "", theme: "", referenceBiblique: "", denomination: "", statut: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [openingSession, setOpeningSession] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<{ text: string; color: string; code?: string } | null>(null);
  const [selectedJour, setSelectedJour] = useState<number | null>(null);
  const [absentsDuJour, setAbsentsDuJour] = useState<{ id: number; nom: string; prenom: string; numeroId: string }[]>([]);
  const [loadingAbsents, setLoadingAbsents] = useState(false);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [alerteSeuil, setAlerteSeuil] = useState(60);
  const [alerteSeuilInput, setAlerteSeuilInput] = useState("60");
  const [alerteHeure, setAlerteHeure] = useState<string>("");
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSendResult, setAlertSendResult] = useState<string | null>(null);
  const [alertHistory, setAlertHistory] = useState<AlerteRecord[]>([]);
  const alertSentRef = useRef(false);
  const alerteSeuilRef = useRef(60);
  const [sendingBadge, setSendingBadge] = useState<number | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ text: string; color: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const headers = useCallback(() => ({ "x-eglise-id": String(egliseId) }), [egliseId]);

  const fetchAlertHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/gestion/marathons/${marathonId}/alert`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setAlertHistory(data.alertes ?? []);
      }
    } catch { }
  }, [marathonId, headers]);

  const callAlertEndpoint = useCallback(async (force = false): Promise<{ sent: boolean; alreadySent?: boolean; reason?: string; recipients?: number; scanned?: number; expected?: number; taux?: number; error?: string }> => {
    const res = await fetch(`/api/gestion/marathons/${marathonId}/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ force }),
    });
    return res.json().catch(() => ({ sent: false, error: "Erreur réseau" }));
  }, [marathonId, headers]);

  const handleSendAlert = useCallback(async () => {
    setSendingAlert(true);
    setAlertSendResult(null);
    try {
      const data = await callAlertEndpoint(true);
      if (data.sent) {
        setAlertSendResult(`Alerte envoyée à ${data.recipients} coordinateur(s). (${data.scanned}/${data.expected} scannés — ${data.taux}%)`);
        fetchAlertHistory();
      } else {
        setAlertSendResult(data.reason ?? data.error ?? "Alerte non envoyée");
      }
    } catch {
      setAlertSendResult("Erreur réseau");
    } finally {
      setSendingAlert(false);
    }
  }, [callAlertEndpoint, fetchAlertHistory]);

  const fetchLive = useCallback(async () => {
    setLiveLoading(true);
    try {
      const res = await fetch(`/api/gestion/marathons/${marathonId}/stats?live=true`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setLiveData({ liveToday: data.liveToday, recentScans: data.recentScans, notYetScannedToday: data.notYetScannedToday });
        if (data.byDay) {
          setStats((prev) => prev ? { ...prev, byDay: data.byDay, todayDayNum: data.todayDayNum ?? prev.todayDayNum, totalParticipants: data.totalParticipants ?? prev.totalParticipants } : prev);
        }
        setLastRefreshed(new Date());
        if (data.liveToday) {
          const { scanned, expected } = data.liveToday;
          if (expected > 0) {
            const taux = Math.round((scanned / expected) * 100);
            const seuil = alerteSeuilRef.current;
            if (taux < seuil && !alertSentRef.current) {
              alertSentRef.current = true;
              setAlertBanner(`Taux de présence (${taux}%) en dessous du seuil d'alerte (${seuil}%). ${scanned}/${expected} participants scannés.`);
              callAlertEndpoint(false).then((d) => {
                if (d.sent) {
                  setAlertSendResult(`Alerte automatique envoyée à ${d.recipients} coordinateur(s). (${d.scanned}/${d.expected} scannés — ${d.taux}%)`);
                  fetchAlertHistory();
                } else if (d.alreadySent) {
                  setAlertSendResult("Une alerte a déjà été envoyée automatiquement par le système de scan aujourd'hui.");
                  fetchAlertHistory();
                }
              }).catch(() => { });
            }
          }
        }
      }
    } catch {
    } finally {
      setLiveLoading(false);
    }
  }, [marathonId, headers]);

  useEffect(() => {
    if (tab === "live") {
      fetchLive();
      fetchAlertHistory();
      liveIntervalRef.current = setInterval(fetchLive, 30000);
    } else {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    }
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    };
  }, [tab, fetchLive]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [mRes, pRes, sRes] = await Promise.all([
      fetch(`/api/gestion/marathons/${marathonId}`, { headers: headers() }),
      fetch(`/api/gestion/marathons/${marathonId}/participants`, { headers: headers() }),
      fetch(`/api/gestion/marathons/${marathonId}/stats`, { headers: headers() }),
    ]);
    if (mRes.ok) {
      const m = await mRes.json();
      setMarathon(m);
      setEditForm({ titre: m.titre, theme: m.theme ?? "", referenceBiblique: m.referenceBiblique ?? "", denomination: m.denomination ?? "", statut: m.statut });
      const seuil = m.alerteSeuil ?? 60;
      setAlerteSeuil(seuil);
      alerteSeuilRef.current = seuil;
      setAlerteSeuilInput(String(seuil));
      setAlerteHeure(m.alerteHeure ?? "");
    }
    if (pRes.ok) setParticipants(await pRes.json());
    if (sRes.ok) setStats(await sRes.json());
    setLoading(false);
  }, [marathonId, headers]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddParticipant = async () => {
    if (!addForm.nom || !addForm.prenom) { setAddError("Nom et prénom requis"); return; }
    setAdding(true); setAddError("");
    const res = await fetch(`/api/gestion/marathons/${marathonId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      setShowAddPart(false);
      setAddForm({ nom: "", prenom: "", email: "" });
      fetchAll();
    } else {
      const d = await res.json();
      setAddError(d.error ?? "Erreur");
    }
    setAdding(false);
  };

  const handlePrintBadge = (p: Participant) => {
    window.open(`/api/gestion/marathons/${marathonId}/badge/${p.id}`, "_blank");
  };

  const handlePrintAllBadges = () => {
    if (participants.length === 0) return;
    window.open(`/api/gestion/marathons/${marathonId}/badges-planche?egliseId=${egliseId}`, "_blank");
  };

  const handleCsvUpload = async (file: File) => {
    setCsvLoading(true); setCsvResult(null);
    const text = await file.text();
    const res = await fetch(`/api/gestion/marathons/${marathonId}/import-csv`, {
      method: "POST",
      headers: { "Content-Type": "text/csv", ...headers() },
      body: text,
    });
    if (res.ok) {
      setCsvResult(await res.json());
      fetchAll();
    }
    setCsvLoading(false);
  };

  const handleCloseDay = async () => {
    if (!stats?.todayDayNum) return;
    if (!confirm(`Clôturer la présence du jour ${stats.todayDayNum} ? Les absents seront marqués définitivement.`)) return;
    setClosingDay(true);
    await fetch(`/api/gestion/marathons/${marathonId}/cloturer-journee`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ numeroJour: stats.todayDayNum }),
    });
    await fetchAll();
    setClosingDay(false);
  };

  const handleSaveConfig = async () => {
    setSaving(true); setSaveMsg("");
    const res = await fetch(`/api/gestion/marathons/${marathonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    setSaveMsg(res.ok ? "Enregistré !" : "Erreur lors de la sauvegarde");
    if (res.ok) fetchAll();
  };

  const copyScanLink = () => {
    const url = `${window.location.origin}/marathon-scan/${marathonId}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const fetchAbsentsDuJour = async (jour: number) => {
    setSelectedJour(jour); setLoadingAbsents(true);
    const res = await fetch(`/api/gestion/marathons/${marathonId}/stats?jour=${jour}`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setAbsentsDuJour(data.absentsDuJour ?? []);
    }
    setLoadingAbsents(false);
  };

  const handleOpenSession = async () => {
    setOpeningSession(true); setSessionMsg(null);
    const res = await fetch(`/api/gestion/marathons/${marathonId}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (res.ok) {
      const code = data.session?.codeAcces ?? "";
      const msg = data.alreadyExists
        ? `Session du jour déjà ouverte (J${data.numeroJour}). Code : ${code}`
        : `Session du jour J${data.numeroJour} ouverte ! Code : ${code}`;
      setSessionMsg({ text: msg, color: "#15803d", code });
    } else {
      setSessionMsg({ text: data.error ?? "Impossible d'ouvrir la session", color: "#b91c1c" });
    }
    setOpeningSession(false);
  };

  const handleSendBadge = async (p: Participant) => {
    if (!p.email) {
      setEmailMsg({ text: `${p.prenom} ${p.nom} n'a pas d'adresse email.`, color: "#b91c1c" });
      setTimeout(() => setEmailMsg(null), 4000);
      return;
    }
    setSendingBadge(p.id);
    setEmailMsg(null);
    const res = await fetch(`/api/gestion/marathons/${marathonId}/send-badge/${p.id}`, {
      method: "POST",
      headers: headers(),
    });
    const data = await res.json();
    if (res.ok) {
      setEmailMsg({ text: `Badge envoyé à ${data.sentTo} ✓`, color: "#15803d" });
    } else {
      setEmailMsg({ text: data.error ?? "Erreur lors de l'envoi", color: "#b91c1c" });
    }
    setSendingBadge(null);
    setTimeout(() => setEmailMsg(null), 5000);
  };

  const handleSendAllBadges = async () => {
    const withEmail = participants.filter((p) => p.email).length;
    if (withEmail === 0) {
      setEmailMsg({ text: "Aucun participant n'a d'adresse email.", color: "#b91c1c" });
      setTimeout(() => setEmailMsg(null), 4000);
      return;
    }
    if (!confirm(`Envoyer le badge par email à ${withEmail} participant(s) ?`)) return;
    setSendingAll(true);
    setEmailMsg(null);
    const res = await fetch(`/api/gestion/marathons/${marathonId}/send-badges-all`, {
      method: "POST",
      headers: headers(),
    });
    const data = await res.json();
    if (res.ok) {
      const parts = [`${data.sent} envoyé(s)`];
      if (data.failed > 0) parts.push(`${data.failed} échec(s)`);
      if (data.noEmail > 0) parts.push(`${data.noEmail} sans email`);
      setEmailMsg({ text: parts.join(" · ") + " ✓", color: data.failed > 0 ? "#92400e" : "#15803d" });
    } else {
      setEmailMsg({ text: data.error ?? "Erreur lors de l'envoi", color: "#b91c1c" });
    }
    setSendingAll(false);
    setTimeout(() => setEmailMsg(null), 7000);
  };

  const filtered = participants.filter((p) =>
    `${p.prenom} ${p.nom} ${p.numeroId}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>Chargement...</div>;
  if (!marathon) return <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>Marathon introuvable</div>;

  const TABS = [
    ...(marathon.statut === "ouvert" ? [{ id: "live" as const, label: "Suivi en direct", icon: Radio }] : []),
    { id: "participants" as const, label: "Participants", icon: Users },
    { id: "stats" as const, label: "Statistiques", icon: BarChart3 },
    { id: "import" as const, label: "Import CSV", icon: Upload },
    { id: "config" as const, label: "Configuration", icon: Settings },
  ];

  const scanUrl = typeof window !== "undefined" ? `${window.location.origin}/marathon-scan/${marathonId}` : "";

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button onClick={() => router.push("/gestion/marathons")} style={{ ...btn({ background: "transparent", color: PRIMARY, padding: "6px 0" }), marginBottom: 12, border: "none" }}>
          <ArrowLeft size={15} /> Retour aux marathons
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: PRIMARY }}>{marathon.titre}</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: marathon.statut === "ouvert" ? "#dcfce7" : "#fee2e2", color: marathon.statut === "ouvert" ? "#15803d" : "#b91c1c" }}>
                {marathon.statut === "ouvert" ? "Ouvert" : "Clos"}
              </span>
            </div>
            {marathon.theme && <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{marathon.theme}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={13} /> {formatDate(marathon.dateDebut)} · {marathon.nombreJours} jours
              </span>
              <span style={{ fontSize: 12.5, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
                <Users size={13} /> {marathon._count.participants} participants
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {marathon.statut === "ouvert" && (
              <button onClick={handleOpenSession} disabled={openingSession} style={{ ...btn({ background: openingSession ? "#e5e7eb" : "#7c3aed", color: "white" }) }}>
                <Play size={14} /> {openingSession ? "..." : "Ouvrir session du jour"}
              </button>
            )}
            <button onClick={copyScanLink} style={{ ...btn({ background: "#f0fdf4", color: "#15803d" }) }}>
              <LinkIcon size={14} /> {copied ? "Copié !" : "Lien scan"}
            </button>
            <a href={`/marathon-scan/${marathonId}`} target="_blank" rel="noopener" style={{ ...btn({ background: PRIMARY, color: "white", textDecoration: "none" }) }}>
              <Trophy size={14} /> Ouvrir scanner
            </a>
          </div>
        </div>
        {sessionMsg && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: sessionMsg.color === "#15803d" ? "#f0fdf4" : "#fef2f2", color: sessionMsg.color, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {sessionMsg.text}
            {sessionMsg.code && (
              <button onClick={() => { navigator.clipboard.writeText(sessionMsg.code!); }} style={{ padding: "3px 10px", background: "#e0e7ff", color: "#4338ca", border: "none", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                <Copy size={11} style={{ display: "inline", marginRight: 4 }} />{sessionMsg.code}
              </button>
            )}
            <button onClick={() => setSessionMsg(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Stats mini-cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: "1.5rem" }}>
          {[
            { label: "Participants", value: stats.totalParticipants, color: PRIMARY },
            { label: "Jours écoulés", value: `${stats.joursEcoules}/${stats.joursTotal}`, color: GOLD },
            { label: "Sans faute", value: stats.sansFaute.length, color: "#15803d" },
            { label: "Jour actuel", value: stats.todayDayNum ? `J${stats.todayDayNum}` : "–", color: "#7c3aed" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f3f4f6", marginBottom: "1.5rem" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === id ? 700 : 400, color: tab === id ? PRIMARY : "#6b7280", borderBottom: tab === id ? `2px solid ${PRIMARY}` : "2px solid transparent", marginBottom: -2, display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Suivi en direct Tab ── */}
      {tab === "live" && (
        <div>
          {/* Refresh header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PRIMARY, display: "flex", alignItems: "center", gap: 8 }}>
              <Radio size={16} color="#dc2626" /> Suivi en direct
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {lastRefreshed && (
                <span style={{ fontSize: 11.5, color: "#9ca3af", display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={12} /> Actualisé à {lastRefreshed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
              <button
                onClick={() => window.open(`/api/gestion/marathons/${marathonId}/liste-attente-pdf?egliseId=${egliseId}`, "_blank")}
                style={{ ...btn({ background: "#eff6ff", color: PRIMARY, padding: "6px 12px", border: "1px solid #bfdbfe" }) }}
              >
                <Download size={13} /> Télécharger liste d&apos;attente
              </button>
              <button
                onClick={handleSendAlert}
                disabled={sendingAlert}
                style={{ ...btn({ background: sendingAlert ? "#e5e7eb" : "#fef3c7", color: "#b45309", padding: "6px 12px", border: "1px solid #fcd34d" }) }}
              >
                {sendingAlert ? "Envoi..." : "⚠ Envoyer alerte"}
              </button>
              <button
                onClick={fetchLive}
                disabled={liveLoading}
                style={{ ...btn({ background: "#f0fdf4", color: "#15803d", padding: "6px 12px" }) }}
              >
                <RefreshCw size={13} style={{ animation: liveLoading ? "spin 1s linear infinite" : undefined }} />
                {liveLoading ? "..." : "Actualiser"}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
            Actualisation automatique toutes les 30 secondes
          </p>

          {/* Alert threshold config */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>⚠ Configuration des alertes</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#92400e", whiteSpace: "nowrap" }}>Seuil :</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={alerteSeuilInput}
                  onChange={(e) => setAlerteSeuilInput(e.target.value)}
                  style={{ width: 60, padding: "4px 8px", border: "1.5px solid #fcd34d", borderRadius: 6, fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }}
                />
                <span style={{ fontSize: 13, color: "#92400e" }}>%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#92400e", whiteSpace: "nowrap" }}>Déclencher après :</label>
                <input
                  type="time"
                  value={alerteHeure}
                  onChange={(e) => setAlerteHeure(e.target.value)}
                  style={{ padding: "4px 8px", border: "1.5px solid #fcd34d", borderRadius: 6, fontSize: 13, outline: "none" }}
                />
                <span style={{ fontSize: 11, color: "#92400e" }}>(heure min.)</span>
              </div>
              <button
                onClick={async () => {
                  const val = Math.min(100, Math.max(0, parseInt(alerteSeuilInput) || 60));
                  setAlerteSeuil(val);
                  alerteSeuilRef.current = val;
                  setAlerteSeuilInput(String(val));
                  alertSentRef.current = false;
                  setAlertBanner(null);
                  setAlertSendResult(null);
                  await fetch(`/api/gestion/marathons/${marathonId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", ...headers() },
                    body: JSON.stringify({ alerteSeuil: val, alerteHeure: alerteHeure || null }),
                  });
                }}
                style={{ ...btn({ background: "#b45309", color: "white", padding: "5px 12px" }), fontSize: 12, whiteSpace: "nowrap" }}
              >
                Enregistrer
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#b45309", margin: "8px 0 0", lineHeight: 1.5 }}>
              L&apos;alerte est envoyée automatiquement après chaque scan si le taux est en dessous du seuil
              {alerteHeure ? ` et qu'il est plus de ${alerteHeure}` : ""}.
              Les coordinateurs reçoivent un email avec le lien vers ce tableau de bord.
            </p>
            {alertHistory.length > 0 && (
              <div style={{ marginTop: 8, padding: "6px 10px", background: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }}>
                Dernière alerte envoyée : J{alertHistory[0].numeroJour} — {alertHistory[0].taux}% de présence —{" "}
                {new Date(alertHistory[0].envoyeAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>

          {/* Alert banner */}
          {alertBanner && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#b91c1c", fontSize: 13.5, marginBottom: 4 }}>Alerte présence</div>
                <div style={{ fontSize: 13, color: "#7f1d1d" }}>{alertBanner}</div>
                <button
                  onClick={handleSendAlert}
                  disabled={sendingAlert}
                  style={{ marginTop: 8, ...btn({ background: "#b91c1c", color: "white", padding: "5px 12px" }), fontSize: 12 }}
                >
                  {sendingAlert ? "Envoi en cours..." : "Envoyer alerte par email"}
                </button>
              </div>
              <button onClick={() => setAlertBanner(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", flexShrink: 0, padding: 0 }}><X size={14} /></button>
            </div>
          )}

          {/* Alert send result */}
          {alertSendResult && (
            <div style={{ background: alertSendResult.includes("Erreur") || alertSendResult.includes("non envoyée") ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${alertSendResult.includes("Erreur") || alertSendResult.includes("non envoyée") ? "#fca5a5" : "#bbf7d0"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: alertSendResult.includes("Erreur") || alertSendResult.includes("non envoyée") ? "#b91c1c" : "#166534", fontWeight: 600 }}>{alertSendResult}</span>
              <button onClick={() => setAlertSendResult(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", flexShrink: 0, padding: 0 }}><X size={14} /></button>
            </div>
          )}


          {liveLoading && !liveData ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>Chargement...</div>
          ) : liveData ? (
            <>
              {/* Today's scan counter */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#15803d" }}>{liveData.liveToday.scanned}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>scannés</div>
                </div>
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: PRIMARY }}>{liveData.liveToday.expected}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>attendus</div>
                </div>
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: liveData.liveToday.expected > 0 ? (liveData.liveToday.scanned / liveData.liveToday.expected >= 0.8 ? "#15803d" : liveData.liveToday.scanned / liveData.liveToday.expected >= 0.5 ? GOLD : "#dc2626") : "#9ca3af" }}>
                    {liveData.liveToday.expected > 0 ? Math.round((liveData.liveToday.scanned / liveData.liveToday.expected) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>taux présence</div>
                </div>
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#b91c1c" }}>{liveData.notYetScannedToday.length}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>non encore scannés</div>
                </div>
              </div>

              {/* Progress bar */}
              {liveData.liveToday.expected > 0 && (
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    <span>{liveData.liveToday.dayNum ? `Jour ${liveData.liveToday.dayNum}` : "Aujourd'hui"}</span>
                    <span>{liveData.liveToday.scanned} / {liveData.liveToday.expected}</span>
                  </div>
                  <div style={{ height: 10, background: "#f3f4f6", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, liveData.liveToday.expected > 0 ? (liveData.liveToday.scanned / liveData.liveToday.expected) * 100 : 0)}%`, background: "#15803d", borderRadius: 5, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Recent scan feed */}
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                    <UserCheck size={15} color="#15803d" />
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: PRIMARY }}>Derniers scans ({liveData.recentScans.length})</span>
                  </div>
                  {liveData.recentScans.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Aucun scan enregistré aujourd&apos;hui</div>
                  ) : (
                    <div style={{ maxHeight: 340, overflowY: "auto" }}>
                      {liveData.recentScans.map((s, i) => (
                        <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", gap: 10 }}>
                          <CheckCircle size={14} color="#15803d" style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.participantPrenom} {s.participantNom}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontFamily: "monospace" }}>{s.participantNumeroId}</span>
                              {s.scanneParNom && <span>· par {s.scanneParNom}</span>}
                            </div>
                          </div>
                          {s.scannedAt && (
                            <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0, whiteSpace: "nowrap" }}>
                              {new Date(s.scannedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Not yet scanned */}
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                    <UserX size={15} color="#dc2626" />
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: PRIMARY }}>En attente ({liveData.notYetScannedToday.length})</span>
                  </div>
                  {liveData.notYetScannedToday.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#15803d", fontSize: 13, fontWeight: 600 }}>Tout le monde est scanné !</div>
                  ) : (
                    <div style={{ maxHeight: 340, overflowY: "auto" }}>
                      {liveData.notYetScannedToday.map((p, i) => (
                        <div key={p.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", gap: 10, background: i % 2 === 0 ? "white" : "#fafafa" }}>
                          <XCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{p.prenom} {p.nom}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>{p.numeroId}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Per-session breakdown */}
              {stats && stats.byDay.filter((d) => d.isPast).length > 0 && (
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: PRIMARY }}>Récapitulatif par séance</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["Séance", "Date", "Présents", "Absents", "Taux"].map((h) => (
                            <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byDay.filter((d) => d.isPast).map((d, i) => (
                          <tr key={d.jour} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                            <td style={{ padding: "8px 14px", fontWeight: 700, color: PRIMARY }}>J{d.jour}</td>
                            <td style={{ padding: "8px 14px", color: "#6b7280", fontSize: 12 }}>{formatDate(d.date)}</td>
                            <td style={{ padding: "8px 14px", color: "#15803d", fontWeight: 600 }}>{d.presents}</td>
                            <td style={{ padding: "8px 14px", color: d.absents > 0 ? "#b91c1c" : "#9ca3af" }}>{d.absents}</td>
                            <td style={{ padding: "8px 14px" }}>
                              <span style={{ fontWeight: 600, color: d.tauxPresence >= 80 ? "#15803d" : d.tauxPresence >= 50 ? GOLD : "#dc2626" }}>{d.tauxPresence}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
              Impossible de charger les données en direct
            </div>
          )}
        </div>
      )}

      {/* ── Participants Tab ── */}
      {tab === "participants" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." style={{ width: "100%", padding: "8px 12px 8px 30px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13.5, boxSizing: "border-box", outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {stats?.todayDayNum && (
                <button onClick={handleCloseDay} disabled={closingDay} style={{ ...btn({ background: "#fef9c3", color: "#854d0e" }) }}>
                  <ClipboardList size={14} /> {closingDay ? "..." : `Clôturer J${stats.todayDayNum}`}
                </button>
              )}
              <button onClick={handlePrintAllBadges} style={{ ...btn({ background: "#f0fdf4", color: "#15803d" }) }}>
                <Download size={14} /> Planche badges
              </button>
              <button onClick={handleSendAllBadges} disabled={sendingAll} style={{ ...btn({ background: sendingAll ? "#e5e7eb" : "#eff6ff", color: sendingAll ? "#9ca3af" : PRIMARY }) }}>
                <Send size={14} /> {sendingAll ? "Envoi en cours…" : "Envoyer à tous"}
              </button>
              <button onClick={() => setShowAddPart(true)} style={{ ...btn({ background: PRIMARY, color: "white" }) }}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>

          {emailMsg && (
            <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: emailMsg.color === "#15803d" ? "#f0fdf4" : emailMsg.color === "#92400e" ? "#fffbeb" : "#fef2f2", color: emailMsg.color, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span><Mail size={13} style={{ display: "inline", marginRight: 6 }} />{emailMsg.text}</span>
              <button onClick={() => setEmailMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}><X size={13} /></button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
              {search ? "Aucun résultat" : "Aucun participant — ajoutez-en ou importez un CSV"}
            </div>
          ) : (
            <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["#", "Participant", "Email", "Présences", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const presents = p.presences.filter((pr) => pr.statut === "present").length;
                    const total = p.presences.length;
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                        <td style={{ padding: "10px 14px", color: GOLD, fontWeight: 700, whiteSpace: "nowrap" }}>{p.numeroId}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#111827" }}>{p.prenom} {p.nom}</div>
                          {p.membre && <div style={{ fontSize: 11, color: "#9ca3af" }}>Membre</div>}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#6b7280", fontSize: 12.5 }}>{p.email ?? "–"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ height: 6, width: 80, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: total > 0 ? `${(presents / total) * 100}%` : "0%", background: presents === total && total > 0 ? "#16a34a" : PRIMARY }} />
                            </div>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>{presents}/{total}</span>
                            {presents === total && total > 0 && <Star size={12} color={GOLD} />}
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              onClick={() => handlePrintBadge(p)}
                              style={{ padding: "5px 10px", background: "#eff6ff", border: "none", borderRadius: 6, cursor: "pointer", color: PRIMARY, fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                            >
                              <Download size={12} /> Badge PDF
                            </button>
                            <button
                              onClick={() => handleSendBadge(p)}
                              disabled={sendingBadge === p.id}
                              title={p.email ? `Envoyer à ${p.email}` : "Pas d'email"}
                              style={{ padding: "5px 10px", background: p.email ? "#f0fdf4" : "#f9fafb", border: "none", borderRadius: 6, cursor: p.email ? "pointer" : "not-allowed", color: p.email ? "#15803d" : "#d1d5db", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                            >
                              <Mail size={12} /> {sendingBadge === p.id ? "…" : "Email"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Stats Tab ── */}
      {tab === "stats" && stats && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: PRIMARY }}>Taux de présence par jour</h3>
            <button
              onClick={() => window.open(`/api/gestion/marathons/${marathonId}/badges-planche?egliseId=${egliseId}`, "_blank")}
              style={{ ...btn({ background: "#f0fdf4", color: "#15803d" }), fontSize: 12 }}
            >
              <Download size={13} /> Planche badges (PDF)
            </button>
          </div>

          {/* ── Recharts bar chart ── */}
          {stats.byDay.filter((d) => d.isPast).length > 0 && (
            <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.byDay.filter((d) => d.isPast)} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="jour" tickFormatter={(v: number) => `J${v}`} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Taux présence"]}
                    labelFormatter={(label) => `Jour ${label}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="tauxPresence" name="Taux présence" radius={[4, 4, 0, 0]}
                    fill={PRIMARY}
                    label={{ position: "top", fontSize: 10, fill: "#374151", formatter: (v: unknown) => `${v}%` }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: PRIMARY, display: "inline-block" }} /> Taux de présence (%)
                </span>
              </div>
            </div>
          )}

          {/* ── Day table ── */}
          <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Jour", "Date", "Présents", "Absents", "Taux", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.byDay.map((d, i) => (
                  <tr
                    key={d.jour}
                    style={{ borderTop: "1px solid #f3f4f6", background: selectedJour === d.jour ? "#eff6ff" : i % 2 === 0 ? "white" : "#fafafa", opacity: d.isPast ? 1 : 0.45, cursor: d.isPast ? "pointer" : "default", transition: "background 0.15s" }}
                    onClick={() => d.isPast && fetchAbsentsDuJour(d.jour)}
                    title={d.isPast ? "Cliquer pour voir les absents" : undefined}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: PRIMARY }}>J{d.jour}</td>
                    <td style={{ padding: "10px 14px", color: "#6b7280" }}>{formatDate(d.date)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#15803d", fontWeight: 600 }}>
                        <CheckCircle size={13} /> {d.presents}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: d.absents > 0 ? "#b91c1c" : "#9ca3af" }}>
                        <XCircle size={13} /> {d.absents}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ height: 6, width: 80, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${d.tauxPresence}%`, background: d.tauxPresence >= 80 ? "#16a34a" : d.tauxPresence >= 50 ? GOLD : "#ef4444" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{d.tauxPresence}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {d.isPast && (
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`/api/gestion/marathons/${marathonId}/rapport-jour?jour=${d.jour}&egliseId=${egliseId}`, "_blank"); }}
                          style={{ padding: "4px 10px", background: "#eff6ff", color: PRIMARY, border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                        >
                          <Download size={11} /> PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Absents du jour panel ── */}
          {selectedJour !== null && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "1.25rem", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#b91c1c", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <XCircle size={16} /> Absents – Jour {selectedJour} ({loadingAbsents ? "..." : absentsDuJour.length})
                </h3>
                <button onClick={() => { setSelectedJour(null); setAbsentsDuJour([]); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={14} /></button>
              </div>
              {loadingAbsents ? (
                <div style={{ color: "#9ca3af", fontSize: 13 }}>Chargement...</div>
              ) : absentsDuJour.length === 0 ? (
                <div style={{ color: "#6b7280", fontSize: 13 }}>Aucun absent enregistré pour ce jour.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
                  {absentsDuJour.map((p) => (
                    <div key={p.id} style={{ background: "white", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      <XCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#374151", fontSize: 13 }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 11, color: "#b91c1c", fontFamily: "monospace" }}>{p.numeroId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {stats.sansFaute.length > 0 && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: PRIMARY, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Star size={16} color={GOLD} /> Participants sans faute ({stats.sansFaute.length})
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {stats.sansFaute.map((p) => (
                  <div key={p.id} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <Star size={16} color="#16a34a" />
                    <div>
                      <div style={{ fontWeight: 600, color: "#166534", fontSize: 13.5 }}>{p.prenom} {p.nom}</div>
                      <div style={{ fontSize: 11, color: "#15803d" }}>{p.numeroId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Import CSV Tab ── */}
      {tab === "import" && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "1.25rem", marginBottom: 20 }}>
            <h3 style={{ color: PRIMARY, fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Format attendu du CSV</h3>
            <div style={{ background: "white", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 13, color: "#374151", border: "1px solid #e5e7eb" }}>
              nom,prenom,email<br />
              MBEKI,Jean-Paul,jmbeki@example.com<br />
              KASONGO,Marie,
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
              La première ligne (en-tête) est optionnelle. L&apos;email est optionnel. Les doublons sont ignorés.
            </p>
          </div>

          <div
            style={{ border: "2px dashed #d1d5db", borderRadius: 12, padding: "2.5rem", textAlign: "center", cursor: "pointer", background: "#fafafa" }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={32} color="#d1d5db" style={{ marginBottom: 12 }} />
            <p style={{ color: "#374151", fontWeight: 600, marginBottom: 4 }}>Cliquer pour sélectionner un fichier CSV</p>
            <p style={{ color: "#9ca3af", fontSize: 12 }}>Format : .csv avec séparateur virgule</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }}
          />

          {csvLoading && <div style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}>Importation en cours...</div>}

          {csvResult && (
            <div style={{ marginTop: 20, padding: "16px", background: "#f0fdf4", borderRadius: 10, border: "1.5px solid #bbf7d0" }}>
              <div style={{ fontWeight: 700, color: "#166534", marginBottom: 8, fontSize: 15 }}>Import terminé</div>
              <div style={{ display: "flex", gap: 24 }}>
                <div><span style={{ color: "#15803d", fontWeight: 700, fontSize: 20 }}>{csvResult.added}</span><br /><span style={{ fontSize: 12, color: "#6b7280" }}>ajoutés</span></div>
                <div><span style={{ color: "#b91c1c", fontWeight: 700, fontSize: 20 }}>{csvResult.skipped}</span><br /><span style={{ fontSize: 12, color: "#6b7280" }}>ignorés</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Configuration Tab ── */}
      {tab === "config" && (
        <div style={{ maxWidth: 560 }}>
          {[
            { label: "Titre *", key: "titre", placeholder: "" },
            { label: "Thème", key: "theme", placeholder: "" },
            { label: "Référence biblique", key: "referenceBiblique", placeholder: "" },
            { label: "Dénomination / Église", key: "denomination", placeholder: "" },
          ].map(({ label, key }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{label}</label>
              <input
                value={(editForm as Record<string, string>)[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Statut</label>
            <select
              value={editForm.statut}
              onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }}
            >
              <option value="ouvert">Ouvert (inscriptions actives)</option>
              <option value="clos">Clos</option>
            </select>
          </div>

          <div style={{ marginBottom: 20, padding: "12px 14px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lien du scanner (bénévoles)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ fontSize: 12, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {typeof window !== "undefined" ? `${window.location.origin}/marathon-scan/${marathonId}` : ""}
              </code>
              <button onClick={copyScanLink} style={{ ...btn({ background: PRIMARY, color: "white", padding: "5px 10px", flexShrink: 0 }) }}>
                <Copy size={12} /> {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          {saveMsg && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: saveMsg.includes("Erreur") ? "#fef2f2" : "#f0fdf4", borderRadius: 8, color: saveMsg.includes("Erreur") ? "#b91c1c" : "#15803d", fontSize: 13 }}>
              {saveMsg}
            </div>
          )}

          <button onClick={handleSaveConfig} disabled={saving} style={{ ...btn({ background: saving ? "#9ca3af" : PRIMARY, color: "white", cursor: saving ? "not-allowed" : "pointer", width: "100%", justifyContent: "center", padding: "10px 20px" }) }}>
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddPart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setShowAddPart(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: PRIMARY, fontSize: 17, fontWeight: 700 }}>Ajouter un participant</h3>
              <button onClick={() => setShowAddPart(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            {addError && <div style={{ color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{addError}</div>}
            {[
              { label: "Nom *", key: "nom" }, { label: "Prénom *", key: "prenom" }, { label: "Email", key: "email" },
            ].map(({ label, key }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
                <input
                  value={(addForm as Record<string, string>)[key]}
                  onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
              <button onClick={() => setShowAddPart(false)} style={{ ...btn({ background: "white", border: "1.5px solid #e5e7eb", color: "#374151" }) }}>Annuler</button>
              <button onClick={handleAddParticipant} disabled={adding} style={{ ...btn({ background: adding ? "#9ca3af" : PRIMARY, color: "white" }) }}>
                {adding ? "..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
