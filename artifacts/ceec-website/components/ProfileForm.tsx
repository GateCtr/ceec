"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Membre, Eglise } from "@prisma/client";

interface Props {
  clerkUserId: string;
  userEmail: string;
  existingMember: Membre | null;
  paroissesList: Eglise[];
}

export default function ProfileForm({ clerkUserId, userEmail, existingMember, paroissesList }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: existingMember?.nom || "",
    prenom: existingMember?.prenom || "",
    email: existingMember?.email || userEmail,
    telephone: existingMember?.telephone || "",
    egliseId: existingMember?.egliseId?.toString() || "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/membres/profile", {
        method: existingMember ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone || undefined,
          egliseId: form.egliseId ? parseInt(form.egliseId) : undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }
      setStatus("success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, outline: "none",
    background: "white", boxSizing: "border-box"
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6
  };

  return (
    <div style={{ background: "white", borderRadius: 14, padding: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <h2 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 24, fontSize: 20 }}>
        {existingMember ? "Modifier mon profil" : "Completer mon profil"}
      </h2>

      {status === "success" && (
        <div style={{ padding: "1rem", borderRadius: 10, background: "#dcfce7", border: "1px solid #86efac", color: "#15803d", fontWeight: 600, marginBottom: 20 }}>
          Profil sauvegarde avec succes!
        </div>
      )}
      {status === "error" && (
        <div style={{ padding: "1rem", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Prenom *</label>
            <input type="text" required value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} style={inputStyle} placeholder="Votre prenom" />
          </div>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input type="text" required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} placeholder="Votre nom de famille" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Telephone</label>
          <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} style={inputStyle} placeholder="+243 xxx xxx xxx" />
        </div>

        <div>
          <label style={labelStyle}>Eglise</label>
          <select value={form.egliseId} onChange={e => setForm(f => ({ ...f, egliseId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">-- Selectionner une eglise --</option>
            {paroissesList.map(p => (
              <option key={p.id} value={p.id.toString()}>{p.nom} - {p.ville}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{ padding: "12px 24px", borderRadius: 8, background: status === "loading" ? "#94a3b8" : "#1e3a8a", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: status === "loading" ? "not-allowed" : "pointer", marginTop: 8 }}
        >
          {status === "loading" ? "Sauvegarde..." : "Sauvegarder mon profil"}
        </button>
      </form>
    </div>
  );
}
