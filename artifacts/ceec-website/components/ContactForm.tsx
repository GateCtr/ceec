"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ nom: "", email: "", sujet: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
    setForm({ nom: "", email: "", sujet: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {status === "success" && (
        <div style={{
          padding: "1rem", borderRadius: 10,
          background: "#dcfce7", border: "1px solid #86efac",
          color: "#15803d", fontWeight: 600
        }}>
          Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Nom complet *
          </label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8,
              border: "1px solid #d1d5db", fontSize: 14, outline: "none",
              background: "white"
            }}
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8,
              border: "1px solid #d1d5db", fontSize: 14, outline: "none",
              background: "white"
            }}
            placeholder="votre@email.com"
          />
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Sujet *
        </label>
        <input
          type="text"
          required
          value={form.sujet}
          onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #d1d5db", fontSize: 14, outline: "none",
            background: "white"
          }}
          placeholder="Objet de votre message"
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Message *
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #d1d5db", fontSize: 14, outline: "none",
            background: "white", resize: "vertical"
          }}
          placeholder="Votre message..."
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "12px 24px", borderRadius: 8,
          background: status === "loading" ? "#94a3b8" : "#1e3a8a",
          color: "white", fontWeight: 700, fontSize: 15,
          border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
          transition: "background 0.2s"
        }}
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
