"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy, CheckCircle, XCircle, Camera, RefreshCw,
  Keyboard, Users, AlertCircle, Shield
} from "lucide-react";

const PRIMARY = "#1e3a8a";
const GOLD = "#c59b2e";

interface SessionInfo {
  valid?: boolean;
  requiresSetup?: boolean;
  marathon?: { id: number; titre: string; denomination: string; logoUrl: string | null };
  session?: { id: number; nomControleur: string | null };
  numeroJour?: number;
  date?: string;
  presents?: number;
  total?: number;
}

interface ScanResult {
  ok: boolean;
  duplicate: boolean;
  participant: { nom: string; prenom: string; numeroId: string };
  presents?: number;
  message: string;
}

declare global {
  interface Window {
    BarcodeDetector?: new (opts: { formats: string[] }) => {
      detect(source: HTMLVideoElement | ImageBitmap): Promise<{ rawValue: string }[]>;
    };
  }
}

export default function MarathonScanClient({ marathonId }: { marathonId: number }) {
  const [phase, setPhase] = useState<"setup" | "ready" | "scanning">("setup");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [nomControleur, setNomControleur] = useState("");
  const [codeAcces, setCodeAcces] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [manualToken, setManualToken] = useState("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [presents, setPresents] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const lastScannedRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

  const fetchSessionInfo = useCallback(async () => {
    const res = await fetch(`/api/marathons/${marathonId}/session`);
    if (res.ok) {
      const data = await res.json();
      setSessionInfo(data);
      if (data.valid) {
        setPresents(data.presents ?? 0);
        setPhase("scanning");
      } else if (data.requiresSetup) {
        setPhase("setup");
      }
    } else {
      setError("Marathon introuvable ou pas de session aujourd'hui");
    }
  }, [marathonId]);

  useEffect(() => {
    fetchSessionInfo();
  }, [fetchSessionInfo]);

  const handleSetup = async () => {
    if (!nomControleur.trim()) { setError("Veuillez entrer votre nom"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/marathons/${marathonId}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomControleur }),
    });
    if (res.ok) {
      const data = await res.json();
      setCodeAcces(data.session.codeAcces);
      await fetchSessionInfo();
      setPhase("ready");
    } else {
      const d = await res.json();
      setError(d.error ?? "Erreur");
    }
    setLoading(false);
  };

  const handleJoinSession = async () => {
    if (!inputCode.trim()) { setError("Entrez le code d'accès"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/marathons/${marathonId}/session?code=${inputCode.toUpperCase()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.valid) {
        setSessionInfo(data);
        setCodeAcces(inputCode.toUpperCase());
        setNomControleur(nomControleur || data.session?.nomControleur || "");
        setPresents(data.presents ?? 0);
        setPhase("scanning");
      } else {
        setError("Code invalide");
      }
    } else {
      setError("Code invalide ou session introuvable");
    }
    setLoading(false);
  };

  const sendScan = useCallback(async (token: string) => {
    const now = Date.now();
    if (token === lastScannedRef.current && now - lastScannedTimeRef.current < 3000) return;
    lastScannedRef.current = token;
    lastScannedTimeRef.current = now;

    const res = await fetch(`/api/marathons/${marathonId}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: token, codeAcces: codeAcces || inputCode.toUpperCase(), nomControleur }),
    });
    if (res.ok) {
      const data: ScanResult = await res.json();
      setLastResult(data);
      if (!data.duplicate && data.presents !== undefined) setPresents(data.presents);
    } else {
      const d = await res.json();
      setLastResult({ ok: false, duplicate: false, participant: { nom: "", prenom: "", numeroId: "" }, message: d.error ?? "Erreur" });
    }
    setTimeout(() => setLastResult(null), 4000);
  }, [marathonId, codeAcces, inputCode, nomControleur]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!window.BarcodeDetector) return;
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      scanningRef.current = true;

      const scan = async () => {
        if (!scanningRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          for (const code of codes) {
            if (code.rawValue) await sendScan(code.rawValue);
          }
        } catch {}
        if (scanningRef.current) requestAnimationFrame(scan);
      };
      scan();
    } catch {
      setScanMode("manual");
    }
  }, [sendScan]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase === "scanning" && scanMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [phase, scanMode, startCamera, stopCamera]);

  const handleManualScan = () => {
    const token = manualToken.trim();
    if (!token) return;
    sendScan(token);
    setManualToken("");
  };

  if (!sessionInfo && !error) {
    return (
      <div style={{ minHeight: "100vh", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "white", fontSize: 16 }}>Chargement...</div>
      </div>
    );
  }

  if (error && phase === "setup" && !sessionInfo) {
    return (
      <div style={{ minHeight: "100vh", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 400, width: "100%", textAlign: "center" }}>
          <AlertCircle size={40} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ color: "#111827", marginBottom: 8 }}>Accès impossible</h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: PRIMARY, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.15)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={20} color={GOLD} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sessionInfo?.marathon?.titre ?? "Marathon de prière"}
          </div>
          {sessionInfo?.numeroJour && (
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              Jour {sessionInfo.numeroJour} · {sessionInfo.date ? new Date(sessionInfo.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : ""}
            </div>
          )}
        </div>
        {phase === "scanning" && (
          <div style={{ textAlign: "right" }}>
            <div style={{ color: GOLD, fontWeight: 700, fontSize: 22 }}>{presents}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase" }}>présents</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "1.5rem", maxWidth: 480, margin: "0 auto", width: "100%" }}>

        {/* ── Setup Phase ── */}
        {phase === "setup" && sessionInfo?.requiresSetup && (
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.75rem" }}>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Ouvrir la session du jour</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: "1.5rem" }}>
              Identifiez-vous pour générer un code d&apos;accès unique pour aujourd&apos;hui.
            </p>

            {error && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>
            )}

            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Votre nom (contrôleur)</label>
            <input
              value={nomControleur}
              onChange={(e) => setNomControleur(e.target.value)}
              placeholder="ex: Frère Joël"
              onKeyDown={(e) => e.key === "Enter" && handleSetup()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", fontSize: 15, marginBottom: 16, boxSizing: "border-box", outline: "none" }}
            />

            <button onClick={handleSetup} disabled={loading} style={{ width: "100%", padding: "12px", background: GOLD, color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "..." : "Ouvrir la session"}
            </button>

            <div style={{ textAlign: "center", margin: "1rem 0", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>— ou —</div>

            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Rejoindre une session existante</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Code d'accès (ex: A1B2C3)"
                maxLength={8}
                style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "none", fontSize: 15, boxSizing: "border-box", outline: "none", fontFamily: "monospace", letterSpacing: "0.1em" }}
              />
              <button onClick={handleJoinSession} disabled={loading} style={{ padding: "11px 16px", background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>
                Rejoindre
              </button>
            </div>
          </div>
        )}

        {/* Code affiché après création */}
        {phase === "ready" && codeAcces && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
              <Shield size={32} color={GOLD} style={{ marginBottom: 12 }} />
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 8 }}>Code d&apos;accès de la session</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "0.3em", color: "white", fontFamily: "monospace", background: "rgba(0,0,0,0.2)", padding: "14px 24px", borderRadius: 12, display: "inline-block" }}>
                {codeAcces}
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 12 }}>Partagez ce code avec les autres contrôleurs</p>
            </div>
            <button
              onClick={() => setPhase("scanning")}
              style={{ width: "100%", padding: "14px", background: GOLD, color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}
            >
              Commencer le scan →
            </button>
          </div>
        )}

        {/* ── Scanning Phase ── */}
        {phase === "scanning" && (
          <div>
            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 4 }}>
              {([["camera", Camera, "Caméra QR"], ["manual", Keyboard, "Manuel"]] as const).map(([m, Icon, label]) => (
                <button key={m} onClick={() => setScanMode(m)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: scanMode === m ? "white" : "transparent", color: scanMode === m ? PRIMARY : "rgba(255,255,255,0.6)" }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Feedback flash */}
            {lastResult && (
              <div style={{
                padding: "14px 16px",
                borderRadius: 12,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: lastResult.duplicate ? "rgba(245,158,11,0.2)" : lastResult.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                border: `1.5px solid ${lastResult.duplicate ? GOLD : lastResult.ok ? "#22c55e" : "#ef4444"}`,
              }}>
                {lastResult.ok && !lastResult.duplicate ? <CheckCircle size={22} color="#22c55e" /> : lastResult.duplicate ? <RefreshCw size={22} color={GOLD} /> : <XCircle size={22} color="#ef4444" />}
                <div>
                  {lastResult.participant.nom && (
                    <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{lastResult.participant.prenom} {lastResult.participant.nom}</div>
                  )}
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{lastResult.message}</div>
                </div>
              </div>
            )}

            {/* Camera view */}
            {scanMode === "camera" && (
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "#000", marginBottom: 16 }}>
                <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} playsInline muted autoPlay />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ width: "55%", aspectRatio: "1", border: `3px solid ${GOLD}`, borderRadius: 16, boxShadow: "0 0 0 2000px rgba(0,0,0,0.4)" }} />
                </div>
                {!window.BarcodeDetector && (
                  <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "rgba(0,0,0,0.8)", borderRadius: 8, padding: "10px 12px", color: "white", fontSize: 12, textAlign: "center" }}>
                    Votre navigateur ne supporte pas la détection QR automatique — utilisez le mode Manuel
                  </div>
                )}
              </div>
            )}

            {/* Manual input */}
            {scanMode === "manual" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, display: "block", marginBottom: 8 }}>
                  Entrer le token QR ou numéro de participant
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
                    placeholder="Token QR (coller ou scanner)"
                    style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "none", fontSize: 14, boxSizing: "border-box", outline: "none" }}
                    autoFocus
                  />
                  <button onClick={handleManualScan} style={{ padding: "12px 18px", background: GOLD, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    ✓
                  </button>
                </div>
              </div>
            )}

            {/* Counter */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
              <Users size={20} color={GOLD} />
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{presents} présents</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  Jour {sessionInfo?.numeroJour} · {nomControleur || sessionInfo?.session?.nomControleur || "Contrôleur"}
                </div>
              </div>
              <button
                onClick={fetchSessionInfo}
                style={{ marginLeft: "auto", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "7px 12px", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}
              >
                <RefreshCw size={13} /> Actualiser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
