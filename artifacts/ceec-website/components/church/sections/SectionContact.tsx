"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, CheckCircle } from "lucide-react";

type ContactConfig = {
  titre?: string;
  texte?: string;
  bgColor?: string;
};

type ContactData = {
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  ville?: string;
};

type ChampsActifs = {
  telephone?: boolean;
  sujet?: boolean;
};

export default function SectionContact({
  config,
  eglise,
  egliseId,
  contactConfig,
}: {
  config: ContactConfig;
  eglise: ContactData;
  egliseId?: number;
  contactConfig?: { champsActifs?: ChampsActifs; messageConfirmation?: string };
}) {
  const { titre = "Nous contacter", texte, bgColor = "var(--church-primary, #1e3a8a)" } = config;
  const champsActifs: ChampsActifs = contactConfig?.champsActifs ?? { telephone: false, sujet: true };

  const useDark =
    bgColor === "var(--church-primary, #1e3a8a)" ||
    bgColor.startsWith("#1e3") ||
    bgColor.startsWith("#0f1") ||
    bgColor.startsWith("#1e2");

  const [form, setForm] = useState({ nom: "", email: "", telephone: "", sujet: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function updateField(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!egliseId) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/church/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          egliseId,
          nom: form.nom,
          email: form.email,
          telephone: champsActifs.telephone ? form.telephone : undefined,
          sujet: champsActifs.sujet ? form.sujet : undefined,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setConfirmation(data.confirmation ?? "Merci pour votre message !");
      setStatus("success");
      setForm({ nom: "", email: "", telephone: "", sujet: "", message: "" });
    } catch {
      setErrorMsg("Impossible d'envoyer le message. Veuillez réessayer.");
      setStatus("error");
    }
  }

  const inputCls = useDark
    ? "w-full px-3.5 py-2.5 rounded-lg border border-white/30 bg-white/12 text-white text-sm outline-none placeholder:text-white/40 focus:border-white/60 transition-colors"
    : "input";

  const labelCls = useDark
    ? "block text-xs font-semibold mb-1 text-white/70 uppercase tracking-wider"
    : "label";

  return (
    <section className="py-16 px-4" style={{ background: bgColor }}>
      <div className="max-w-[800px] mx-auto">
        {/* Titre */}
        <div className="text-center mb-10">
          <h2 className={`font-extrabold text-[clamp(1.5rem,3vw,2rem)] mb-3 ${useDark ? "text-white" : "text-primary"}`}>
            {titre}
          </h2>
          {texte && (
            <p className={`text-[15px] leading-relaxed max-w-[560px] mx-auto ${useDark ? "text-white/80" : "text-slate-600"}`}>
              {texte}
            </p>
          )}
        </div>

        {/* Infos de contact */}
        {(eglise.adresse || eglise.telephone || eglise.email) && (
          <div className={`flex gap-6 justify-center flex-wrap text-[15px] mb-9 ${useDark ? "text-white/90" : "text-slate-700"}`}>
            {eglise.adresse && (
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{eglise.adresse}{eglise.ville ? `, ${eglise.ville}` : ""}</span>
              </div>
            )}
            {eglise.telephone && (
              <a href={`tel:${eglise.telephone}`} className={`flex items-center gap-2 no-underline ${useDark ? "text-white/90" : "text-slate-700"}`}>
                <Phone size={18} />
                <span>{eglise.telephone}</span>
              </a>
            )}
            {eglise.email && (
              <a href={`mailto:${eglise.email}`} className={`flex items-center gap-2 no-underline ${useDark ? "text-white/90" : "text-slate-700"}`}>
                <Mail size={18} />
                <span>{eglise.email}</span>
              </a>
            )}
          </div>
        )}

        {/* Formulaire */}
        {egliseId && status !== "success" && (
          <form
            onSubmit={handleSubmit}
            className={`rounded-2xl p-8 max-w-[560px] mx-auto ${
              useDark
                ? "bg-white/8 border border-white/15"
                : "bg-white border border-border shadow-card"
            }`}
          >
            <h3 className={`font-bold text-base mb-5 text-center ${useDark ? "text-white" : "text-foreground"}`}>
              Envoyez-nous un message
            </h3>

            {status === "error" && (
              <div className="alert alert-danger mb-4 text-[13px]">{errorMsg}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Nom *</label>
                <input required value={form.nom} onChange={(e) => updateField("nom", e.target.value)} placeholder="Votre nom" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input required type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="votre@email.com" className={inputCls} />
              </div>
            </div>

            {champsActifs.telephone && (
              <div className="mb-3">
                <label className={labelCls}>Téléphone</label>
                <input value={form.telephone} onChange={(e) => updateField("telephone", e.target.value)} placeholder="+243 XXX XXX XXX" className={inputCls} />
              </div>
            )}

            {champsActifs.sujet && (
              <div className="mb-3">
                <label className={labelCls}>Sujet</label>
                <input value={form.sujet} onChange={(e) => updateField("sujet", e.target.value)} placeholder="Objet de votre message" className={inputCls} />
              </div>
            )}

            <div className="mb-4">
              <label className={labelCls}>Message *</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Écrivez votre message ici…"
                rows={5}
                className={`${inputCls} resize-y min-h-[100px]`}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className={`btn btn-full ${
                useDark ? "bg-white text-primary font-bold" : "btn-primary"
              } ${status === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
              style={useDark ? { color: "var(--church-primary, #1e3a8a)" } : undefined}
            >
              {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
            </button>
          </form>
        )}

        {/* Succès */}
        {egliseId && status === "success" && (
          <div className={`rounded-2xl p-8 text-center max-w-[560px] mx-auto ${
            useDark
              ? "bg-white/10 border border-white/20 text-white"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}>
            <CheckCircle size={40} className="mx-auto mb-3" />
            <p className="font-bold text-base mb-2">Message envoyé !</p>
            <p className="text-sm opacity-90">{confirmation}</p>
          </div>
        )}
      </div>
    </section>
  );
}
