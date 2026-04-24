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
import { useConfirm } from "@/components/ui/useConfirm";

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

export default function GestionMarathonDetailClient({ marathonId, egliseId }: { marathonId: number; egliseId: number }) {
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm();
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
    const ok = await confirm({ title: `Clôturer le jour ${stats.todayDayNum} ?`, description: "Les participants non scannés seront marqués comme absents. Cette action est irréversible.", confirmLabel: "Clôturer", variant: "warning" });
    if (!ok) return;
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
    const ok = await confirm({ title: "Envoyer les badges par email ?", description: `${withEmail} participant(s) recevront leur badge par email.`, confirmLabel: "Envoyer", variant: "default" });
    if (!ok) return;
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

  if (loading) return <div className="p-12 text-center text-slate-400">Chargement...</div>;
  if (!marathon) return <div className="p-12 text-center text-red-500">Marathon introuvable</div>;

  const TABS = [
    ...(marathon.statut === "ouvert" ? [{ id: "live" as const, label: "Suivi en direct", icon: Radio }] : []),
    { id: "participants" as const, label: "Participants", icon: Users },
    { id: "stats" as const, label: "Statistiques", icon: BarChart3 },
    { id: "import" as const, label: "Import CSV", icon: Upload },
    { id: "config" as const, label: "Configuration", icon: Settings },
  ];

  const scanUrl = typeof window !== "undefined" ? `${window.location.origin}/marathon-scan/${marathonId}` : "";

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <ConfirmDialog />
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push("/gestion/marathons")} className="btn btn-ghost text-primary p-0 mb-3">
          <ArrowLeft size={15} /> Retour aux marathons
        </button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="m-0 text-[22px] font-bold text-primary">{marathon.titre}</h1>
              <span className={`badge ${marathon.statut === "ouvert" ? "badge-success" : "badge-danger"}`}>
                {marathon.statut === "ouvert" ? "Ouvert" : "Clos"}
              </span>
            </div>
            {marathon.theme && <p className="m-0 text-muted-foreground text-sm">{marathon.theme}</p>}
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="text-[12.5px] text-muted-foreground flex items-center gap-1.5">
                <Calendar size={13} /> {formatDate(marathon.dateDebut)} · {marathon.nombreJours} jours
              </span>
              <span className="text-[12.5px] text-muted-foreground flex items-center gap-1.5">
                <Users size={13} /> {marathon._count.participants} participants
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {marathon.statut === "ouvert" && (
              <button onClick={handleOpenSession} disabled={openingSession} className={`btn btn-sm ${openingSession ? "bg-gray-200 text-muted-foreground" : "bg-violet-600 text-white"}`}>
                <Play size={14} /> {openingSession ? "..." : "Ouvrir session du jour"}
              </button>
            )}
            <button onClick={copyScanLink} className="btn btn-sm bg-green-50 text-green-700">
              <LinkIcon size={14} /> {copied ? "Copié !" : "Lien scan"}
            </button>
            <a href={`/marathon-scan/${marathonId}`} target="_blank" rel="noopener" className="btn btn-sm btn-primary no-underline">
              <Trophy size={14} /> Ouvrir scanner
            </a>
          </div>
        </div>
        {sessionMsg && (
          <div className={`mt-3 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2.5 flex-wrap ${sessionMsg.color === "#15803d" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {sessionMsg.text}
            {sessionMsg.code && (
              <button onClick={() => { navigator.clipboard.writeText(sessionMsg.code!); }} className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 border-none rounded-md font-mono font-bold cursor-pointer text-xs">
                <Copy size={11} className="inline mr-1" />{sessionMsg.code}
              </button>
            )}
            <button onClick={() => setSessionMsg(null)} className="ml-auto bg-transparent border-none cursor-pointer text-slate-400 p-0"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Stats mini-cards */}
      {stats && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-6">
          {[
            { label: "Participants", value: stats.totalParticipants, cls: "text-primary" },
            { label: "Jours écoulés", value: `${stats.joursEcoules}/${stats.joursTotal}`, cls: "text-secondary" },
            { label: "Sans faute", value: stats.sansFaute.length, cls: "text-green-700" },
            { label: "Jour actuel", value: stats.todayDayNum ? `J${stats.todayDayNum}` : "–", cls: "text-violet-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="card text-center px-4 py-3.5">
              <div className={`text-2xl font-bold ${cls}`}>{value}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 border-b-2 border-gray-100 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 bg-transparent border-none cursor-pointer text-[13.5px] flex items-center gap-1.5 mb-[-2px] ${tab === id ? "font-bold text-primary border-b-2 border-primary" : "font-normal text-muted-foreground border-b-2 border-transparent"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Suivi en direct Tab ── */}
      {tab === "live" && (
        <div>
          {/* Refresh header */}
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h3 className="m-0 text-[15px] font-semibold text-primary flex items-center gap-2">
              <Radio size={16} className="text-red-600" /> Suivi en direct
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {lastRefreshed && (
                <span className="text-[11.5px] text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} /> Actualisé à {lastRefreshed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
              <button
                onClick={() => window.open(`/api/gestion/marathons/${marathonId}/liste-attente-pdf?egliseId=${egliseId}`, "_blank")}
                className="btn btn-xs bg-blue-50 text-primary border border-blue-200"
              >
                <Download size={13} /> Télécharger liste d&apos;attente
              </button>
              <button
                onClick={handleSendAlert}
                disabled={sendingAlert}
                className={`btn btn-xs border ${sendingAlert ? "bg-gray-200 text-muted-foreground border-gray-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}
              >
                {sendingAlert ? "Envoi..." : "⚠ Envoyer alerte"}
              </button>
              <button
                onClick={fetchLive}
                disabled={liveLoading}
                className="btn btn-xs bg-green-50 text-green-700"
              >
                <RefreshCw size={13} className={liveLoading ? "animate-spin" : ""} />
                {liveLoading ? "..." : "Actualiser"}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Actualisation automatique toutes les 30 secondes
          </p>

          {/* Alert threshold config */}
          <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 mb-3">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2.5">⚠ Configuration des alertes</div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-[13px] text-amber-800 whitespace-nowrap">Seuil :</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={alerteSeuilInput}
                  onChange={(e) => setAlerteSeuilInput(e.target.value)}
                  className="w-[60px] px-2 py-1 border-[1.5px] border-amber-300 rounded-md text-sm font-bold text-center outline-none"
                />
                <span className="text-[13px] text-amber-800">%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[13px] text-amber-800 whitespace-nowrap">Déclencher après :</label>
                <input
                  type="time"
                  value={alerteHeure}
                  onChange={(e) => setAlerteHeure(e.target.value)}
                  className="px-2 py-1 border-[1.5px] border-amber-300 rounded-md text-[13px] outline-none"
                />
                <span className="text-[11px] text-amber-800">(heure min.)</span>
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
                className="btn btn-xs bg-amber-700 text-white whitespace-nowrap"
              >
                Enregistrer
              </button>
            </div>
            <p className="text-[11px] text-amber-700 mt-2 mb-0 leading-relaxed">
              L&apos;alerte est envoyée automatiquement après chaque scan si le taux est en dessous du seuil
              {alerteHeure ? ` et qu'il est plus de ${alerteHeure}` : ""}.
              Les coordinateurs reçoivent un email avec le lien vers ce tableau de bord.
            </p>
            {alertHistory.length > 0 && (
              <div className="mt-2 px-2.5 py-1.5 bg-amber-100 rounded-md text-xs text-amber-800">
                Dernière alerte envoyée : J{alertHistory[0].numeroJour} — {alertHistory[0].taux}% de présence —{" "}
                {new Date(alertHistory[0].envoyeAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>

          {/* Alert banner */}
          {alertBanner && (
            <div className="alert alert-danger mb-4 flex items-start gap-2.5">
              <span className="text-lg shrink-0">⚠️</span>
              <div className="flex-1">
                <div className="font-bold text-red-700 text-[13.5px] mb-1">Alerte présence</div>
                <div className="text-[13px] text-red-900">{alertBanner}</div>
                <button
                  onClick={handleSendAlert}
                  disabled={sendingAlert}
                  className="btn btn-xs btn-danger mt-2"
                >
                  {sendingAlert ? "Envoi en cours..." : "Envoyer alerte par email"}
                </button>
              </div>
              <button onClick={() => setAlertBanner(null)} className="bg-transparent border-none cursor-pointer text-slate-400 shrink-0 p-0"><X size={14} /></button>
            </div>
          )}

          {/* Alert send result */}
          {alertSendResult && (
            <div className={`alert ${alertSendResult.includes("Erreur") || alertSendResult.includes("non envoyée") ? "alert-danger" : "alert-success"} mb-4 flex items-center justify-between gap-2.5`}>
              <span className="text-[13px] font-semibold">{alertSendResult}</span>
              <button onClick={() => setAlertSendResult(null)} className="bg-transparent border-none cursor-pointer text-slate-400 shrink-0 p-0"><X size={14} /></button>
            </div>
          )}

          {liveLoading && !liveData ? (
            <div className="p-12 text-center text-slate-400">Chargement...</div>
          ) : liveData ? (
            <>
              {/* Today's scan counter */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-5">
                <div className="card text-center px-4 py-[18px]">
                  <div className="text-4xl font-extrabold text-green-700">{liveData.liveToday.scanned}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">scannés</div>
                </div>
                <div className="card text-center px-4 py-[18px]">
                  <div className="text-4xl font-extrabold text-primary">{liveData.liveToday.expected}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">attendus</div>
                </div>
                <div className="card text-center px-4 py-[18px]">
                  <div className={`text-4xl font-extrabold ${liveData.liveToday.expected > 0 ? (liveData.liveToday.scanned / liveData.liveToday.expected >= 0.8 ? "text-green-700" : liveData.liveToday.scanned / liveData.liveToday.expected >= 0.5 ? "text-secondary" : "text-red-600") : "text-slate-400"}`}>
                    {liveData.liveToday.expected > 0 ? Math.round((liveData.liveToday.scanned / liveData.liveToday.expected) * 100) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">taux présence</div>
                </div>
                <div className="card text-center px-4 py-[18px]">
                  <div className="text-4xl font-extrabold text-red-700">{liveData.notYetScannedToday.length}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">non encore scannés</div>
                </div>
              </div>

              {/* Progress bar */}
              {liveData.liveToday.expected > 0 && (
                <div className="card px-4 py-3.5 mb-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{liveData.liveToday.dayNum ? `Jour ${liveData.liveToday.dayNum}` : "Aujourd'hui"}</span>
                    <span>{liveData.liveToday.scanned} / {liveData.liveToday.expected}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-[5px] overflow-hidden">
                    <div className="h-full bg-green-700 rounded-[5px] transition-[width] duration-500 ease-in-out" style={{ width: `${Math.min(100, liveData.liveToday.expected > 0 ? (liveData.liveToday.scanned / liveData.liveToday.expected) * 100 : 0)}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Recent scan feed */}
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <UserCheck size={15} className="text-green-700" />
                    <span className="font-semibold text-[13.5px] text-primary">Derniers scans ({liveData.recentScans.length})</span>
                  </div>
                  {liveData.recentScans.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-[13px]">Aucun scan enregistré aujourd&apos;hui</div>
                  ) : (
                    <div className="max-h-[340px] overflow-y-auto">
                      {liveData.recentScans.map((s, i) => (
                        <div key={i} className="px-4 py-2.5 border-b border-slate-50 flex items-center gap-2.5">
                          <CheckCircle size={14} className="text-green-700 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">
                              {s.participantPrenom} {s.participantNom}
                            </div>
                            <div className="text-[11px] text-slate-400 flex gap-2 flex-wrap">
                              <span className="font-mono">{s.participantNumeroId}</span>
                              {s.scanneParNom && <span>· par {s.scanneParNom}</span>}
                            </div>
                          </div>
                          {s.scannedAt && (
                            <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                              {new Date(s.scannedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Not yet scanned */}
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <UserX size={15} className="text-red-600" />
                    <span className="font-semibold text-[13.5px] text-primary">En attente ({liveData.notYetScannedToday.length})</span>
                  </div>
                  {liveData.notYetScannedToday.length === 0 ? (
                    <div className="p-8 text-center text-green-700 text-[13px] font-semibold">Tout le monde est scanné !</div>
                  ) : (
                    <div className="max-h-[340px] overflow-y-auto">
                      {liveData.notYetScannedToday.map((p, i) => (
                        <div key={p.id} className={`px-4 py-2.5 border-b border-slate-50 flex items-center gap-2.5 ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                          <XCircle size={14} className="text-red-500 shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground text-[13px]">{p.prenom} {p.nom}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{p.numeroId}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Per-session breakdown */}
              {stats && stats.byDay.filter((d) => d.isPast).length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-[13.5px] text-primary">Récapitulatif par séance</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13.5px]">
                      <thead>
                        <tr className="bg-slate-50">
                          {["Séance", "Date", "Présents", "Absents", "Taux"].map((h) => (
                            <th key={h} className="px-3.5 py-2 text-left text-muted-foreground font-semibold text-xs uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byDay.filter((d) => d.isPast).map((d, i) => (
                          <tr key={d.jour} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                            <td className="px-3.5 py-2 font-bold text-primary">J{d.jour}</td>
                            <td className="px-3.5 py-2 text-muted-foreground text-xs">{formatDate(d.date)}</td>
                            <td className="px-3.5 py-2 text-green-700 font-semibold">{d.presents}</td>
                            <td className={`px-3.5 py-2 ${d.absents > 0 ? "text-red-700" : "text-slate-400"}`}>{d.absents}</td>
                            <td className="px-3.5 py-2">
                              <span className={`font-semibold ${d.tauxPresence >= 80 ? "text-green-700" : d.tauxPresence >= 50 ? "text-secondary" : "text-red-600"}`}>{d.tauxPresence}%</span>
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
            <div className="p-12 text-center text-slate-400">
              Impossible de charger les données en direct
            </div>
          )}
        </div>
      )}

      {/* ── Participants Tab ── */}
      {tab === "participants" && (
        <div>
          <div className="flex justify-between items-center mb-3.5 flex-wrap gap-2.5">
            <div className="relative flex-1 max-w-[320px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="input w-full pl-[30px]" />
            </div>
            <div className="flex gap-2">
              {stats?.todayDayNum && (
                <button onClick={handleCloseDay} disabled={closingDay} className="btn btn-sm bg-yellow-50 text-yellow-800">
                  <ClipboardList size={14} /> {closingDay ? "..." : `Clôturer J${stats.todayDayNum}`}
                </button>
              )}
              <button onClick={handlePrintAllBadges} className="btn btn-sm bg-green-50 text-green-700">
                <Download size={14} /> Planche badges
              </button>
              <button onClick={handleSendAllBadges} disabled={sendingAll} className={`btn btn-sm ${sendingAll ? "bg-gray-200 text-slate-400" : "bg-blue-50 text-primary"}`}>
                <Send size={14} /> {sendingAll ? "Envoi en cours…" : "Envoyer à tous"}
              </button>
              <button onClick={() => setShowAddPart(true)} className="btn btn-sm btn-primary">
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>

          {emailMsg && (
            <div className={`alert ${emailMsg.color === "#15803d" ? "alert-success" : emailMsg.color === "#92400e" ? "alert-warning" : "alert-danger"} mb-3.5 flex items-center justify-between gap-2.5`}>
              <span><Mail size={13} className="inline mr-1.5" />{emailMsg.text}</span>
              <button onClick={() => setEmailMsg(null)} className="bg-transparent border-none cursor-pointer text-slate-400 p-0"><X size={13} /></button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              {search ? "Aucun résultat" : "Aucun participant — ajoutez-en ou importez un CSV"}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="bg-slate-50">
                    {["#", "Participant", "Email", "Présences", "Actions"].map((h) => (
                      <th key={h} className="px-3.5 py-2.5 text-left text-muted-foreground font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const presents = p.presences.filter((pr) => pr.statut === "present").length;
                    const total = p.presences.length;
                    return (
                      <tr key={p.id} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                        <td className="px-3.5 py-2.5 text-secondary font-bold whitespace-nowrap">{p.numeroId}</td>
                        <td className="px-3.5 py-2.5">
                          <div className="font-semibold text-foreground">{p.prenom} {p.nom}</div>
                          {p.membre && <div className="text-[11px] text-slate-400">Membre</div>}
                        </td>
                        <td className="px-3.5 py-2.5 text-muted-foreground text-[12.5px]">{p.email ?? "–"}</td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-20 bg-gray-100 rounded-sm overflow-hidden">
                              <div className={`h-full ${presents === total && total > 0 ? "bg-green-600" : "bg-primary"}`} style={{ width: total > 0 ? `${(presents / total) * 100}%` : "0%" }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{presents}/{total}</span>
                            {presents === total && total > 0 && <Star size={12} className="text-secondary" />}
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex gap-1.5 flex-wrap">
                            <button
                              onClick={() => handlePrintBadge(p)}
                              className="btn btn-xs bg-blue-50 text-primary"
                            >
                              <Download size={12} /> Badge PDF
                            </button>
                            <button
                              onClick={() => handleSendBadge(p)}
                              disabled={sendingBadge === p.id}
                              title={p.email ? `Envoyer à ${p.email}` : "Pas d'email"}
                              className={`btn btn-xs ${p.email ? "bg-green-50 text-green-700 cursor-pointer" : "bg-slate-50 text-gray-300 cursor-not-allowed"}`}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-semibold text-primary">Taux de présence par jour</h3>
            <button
              onClick={() => window.open(`/api/gestion/marathons/${marathonId}/badges-planche?egliseId=${egliseId}`, "_blank")}
              className="btn btn-xs bg-green-50 text-green-700"
            >
              <Download size={13} /> Planche badges (PDF)
            </button>
          </div>

          {/* ── Recharts bar chart ── */}
          {stats.byDay.filter((d) => d.isPast).length > 0 && (
            <div className="card p-5 mb-5">
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
                    fill="#1e3a8a"
                    label={{ position: "top", fontSize: 10, fill: "#374151", formatter: (v: unknown) => `${v}%` }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> Taux de présence (%)
                </span>
              </div>
            </div>
          )}

          {/* ── Day table ── */}
          <div className="card overflow-hidden mb-5">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="bg-slate-50">
                  {["Jour", "Date", "Présents", "Absents", "Taux", "Actions"].map((h) => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-muted-foreground font-semibold text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.byDay.map((d, i) => (
                  <tr
                    key={d.jour}
                    className={`border-t border-gray-100 transition-colors duration-150 ${selectedJour === d.jour ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"} ${d.isPast ? "cursor-pointer" : "cursor-default"}`}
                    style={{ opacity: d.isPast ? 1 : 0.45 }}
                    onClick={() => d.isPast && fetchAbsentsDuJour(d.jour)}
                    title={d.isPast ? "Cliquer pour voir les absents" : undefined}
                  >
                    <td className="px-3.5 py-2.5 font-bold text-primary">J{d.jour}</td>
                    <td className="px-3.5 py-2.5 text-muted-foreground">{formatDate(d.date)}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                        <CheckCircle size={13} /> {d.presents}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`flex items-center gap-1.5 ${d.absents > 0 ? "text-red-700" : "text-slate-400"}`}>
                        <XCircle size={13} /> {d.absents}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-gray-100 rounded-sm overflow-hidden">
                          <div className={`h-full ${d.tauxPresence >= 80 ? "bg-green-600" : d.tauxPresence >= 50 ? "bg-secondary" : "bg-red-500"}`} style={{ width: `${d.tauxPresence}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{d.tauxPresence}%</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      {d.isPast && (
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`/api/gestion/marathons/${marathonId}/rapport-jour?jour=${d.jour}&egliseId=${egliseId}`, "_blank"); }}
                          className="btn btn-xs bg-blue-50 text-primary border border-blue-200"
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
            <div className="bg-red-50 border-[1.5px] border-red-200 rounded-xl p-5 mb-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-red-700 m-0 flex items-center gap-2">
                  <XCircle size={16} /> Absents – Jour {selectedJour} ({loadingAbsents ? "..." : absentsDuJour.length})
                </h3>
                <button onClick={() => { setSelectedJour(null); setAbsentsDuJour([]); }} className="bg-transparent border-none cursor-pointer text-slate-400"><X size={14} /></button>
              </div>
              {loadingAbsents ? (
                <div className="text-slate-400 text-[13px]">Chargement...</div>
              ) : absentsDuJour.length === 0 ? (
                <div className="text-muted-foreground text-[13px]">Aucun absent enregistré pour ce jour.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                  {absentsDuJour.map((p) => (
                    <div key={p.id} className="bg-white border border-red-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                      <XCircle size={14} className="text-red-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-700 text-[13px]">{p.prenom} {p.nom}</div>
                        <div className="text-[11px] text-red-700 font-mono">{p.numeroId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {stats.sansFaute.length > 0 && (
            <>
              <h3 className="text-[15px] font-semibold text-primary mb-3 flex items-center gap-2">
                <Star size={16} className="text-secondary" /> Participants sans faute ({stats.sansFaute.length})
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
                {stats.sansFaute.map((p) => (
                  <div key={p.id} className="bg-green-50 border-[1.5px] border-green-200 rounded-[10px] px-3.5 py-3 flex items-center gap-2.5">
                    <Star size={16} className="text-green-600" />
                    <div>
                      <div className="font-semibold text-green-800 text-[13.5px]">{p.prenom} {p.nom}</div>
                      <div className="text-[11px] text-green-700">{p.numeroId}</div>
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
        <div className="max-w-[560px]">
          <div className="bg-blue-50 border-[1.5px] border-blue-200 rounded-xl p-5 mb-5">
            <h3 className="text-primary font-semibold mb-2 text-sm">Format attendu du CSV</h3>
            <div className="bg-white rounded-lg px-3.5 py-2.5 font-mono text-[13px] text-slate-700 border border-border">
              nom,prenom,email<br />
              MBEKI,Jean-Paul,jmbeki@example.com<br />
              KASONGO,Marie,
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-0">
              La première ligne (en-tête) est optionnelle. L&apos;email est optionnel. Les doublons sont ignorés.
            </p>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer bg-[#fafafa]"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={32} className="text-gray-300 mb-3 mx-auto" />
            <p className="text-slate-700 font-semibold mb-1">Cliquer pour sélectionner un fichier CSV</p>
            <p className="text-slate-400 text-xs">Format : .csv avec séparateur virgule</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }}
          />

          {csvLoading && <div className="text-center mt-5 text-muted-foreground">Importation en cours...</div>}

          {csvResult && (
            <div className="mt-5 p-4 bg-green-50 rounded-[10px] border-[1.5px] border-green-200">
              <div className="font-bold text-green-800 mb-2 text-[15px]">Import terminé</div>
              <div className="flex gap-6">
                <div><span className="text-green-700 font-bold text-xl">{csvResult.added}</span><br /><span className="text-xs text-muted-foreground">ajoutés</span></div>
                <div><span className="text-red-700 font-bold text-xl">{csvResult.skipped}</span><br /><span className="text-xs text-muted-foreground">ignorés</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Configuration Tab ── */}
      {tab === "config" && (
        <div className="max-w-[560px]">
          {[
            { label: "Titre *", key: "titre", placeholder: "" },
            { label: "Thème", key: "theme", placeholder: "" },
            { label: "Référence biblique", key: "referenceBiblique", placeholder: "" },
            { label: "Dénomination / Église", key: "denomination", placeholder: "" },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="label">{label}</label>
              <input
                value={(editForm as Record<string, string>)[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                className="input w-full"
              />
            </div>
          ))}
          <div className="form-group">
            <label className="label">Statut</label>
            <select
              value={editForm.statut}
              onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
              className="input select w-full"
            >
              <option value="ouvert">Ouvert (inscriptions actives)</option>
              <option value="clos">Clos</option>
            </select>
          </div>

          <div className="mb-5 px-3.5 py-3 bg-slate-50 rounded-lg border border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Lien du scanner (bénévoles)</div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-slate-700 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {typeof window !== "undefined" ? `${window.location.origin}/marathon-scan/${marathonId}` : ""}
              </code>
              <button onClick={copyScanLink} className="btn btn-xs btn-primary shrink-0">
                <Copy size={12} /> {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          {saveMsg && (
            <div className={`alert ${saveMsg.includes("Erreur") ? "alert-danger" : "alert-success"} mb-3`}>
              {saveMsg}
            </div>
          )}

          <button onClick={handleSaveConfig} disabled={saving} className={`btn w-full justify-center py-2.5 ${saving ? "bg-slate-400 text-white cursor-not-allowed" : "btn-primary"}`}>
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddPart && (
        <div className="fixed inset-0 bg-black/50 z-1000 flex items-center justify-center p-4" onClick={() => setShowAddPart(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-[440px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0 text-primary text-[17px] font-bold">Ajouter un participant</h3>
              <button onClick={() => setShowAddPart(false)} className="bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            {addError && <div className="alert alert-danger mb-3.5 text-[13px]">{addError}</div>}
            {[
              { label: "Nom *", key: "nom" }, { label: "Prénom *", key: "prenom" }, { label: "Email", key: "email" },
            ].map(({ label, key }) => (
              <div key={key} className="form-group">
                <label className="label">{label}</label>
                <input
                  value={(addForm as Record<string, string>)[key]}
                  onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                  className="input w-full"
                />
              </div>
            ))}
            <div className="flex gap-2 justify-end mt-[18px]">
              <button onClick={() => setShowAddPart(false)} className="btn btn-outline">Annuler</button>
              <button onClick={handleAddParticipant} disabled={adding} className={`btn ${adding ? "bg-slate-400 text-white" : "btn-primary"}`}>
                {adding ? "..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
