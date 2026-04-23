"use client";

import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";

interface EgliseData {
  id: number;
  nom: string;
  description: string | null;
  ville: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  pasteur: string | null;
  logoUrl: string | null;
  slug: string | null;
}

interface Props {
  eglise: EgliseData;
}

export default function GestionParametresClient({ eglise }: Props) {
  const [form, setForm] = useState({
    nom: eglise.nom,
    description: eglise.description ?? "",
    ville: eglise.ville,
    adresse: eglise.adresse ?? "",
    telephone: eglise.telephone ?? "",
    email: eglise.email ?? "",
    pasteur: eglise.pasteur ?? "",
    logoUrl: eglise.logoUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/gestion/parametres", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  }

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm({ ...form, [key]: e.target.value }),
    };
  }

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {eglise.slug && (
        <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "8px 14px", marginBottom: 20, fontSize: 13, color: "#64748b" }}>
          Slug : <code style={{ fontWeight: 600, color: "#1e3a8a" }}>{eglise.slug}</code>
          <span style={{ marginLeft: 8, color: "#94a3b8" }}>(non modifiable)</span>
        </div>
      )}

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      {success && <div style={{ background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={16} color="#15803d" /> Informations mises à jour avec succès.</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={s.label}>Nom de l&apos;église *</label>
          <input style={s.input} {...field("nom")} required />
        </div>

        <div>
          <label style={s.label}>Description</label>
          <textarea style={{ ...s.input, minHeight: 100, resize: "vertical" }} {...field("description")} placeholder="Courte description de votre église…" />
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Ville *</label>
            <input style={s.input} {...field("ville")} required />
          </div>
          <div style={{ flex: 2 }}>
            <label style={s.label}>Adresse</label>
            <input style={s.input} {...field("adresse")} placeholder="Rue, quartier…" />
          </div>
        </div>

        <div>
          <label style={s.label}>Nom du pasteur</label>
          <input style={s.input} {...field("pasteur")} placeholder="Pasteur Jean Dupont" />
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Téléphone</label>
            <input type="tel" style={s.input} {...field("telephone")} placeholder="+243 8xx xxx xxx" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>E-mail de contact</label>
            <input type="email" style={s.input} {...field("email")} placeholder="contact@eglise.cd" />
          </div>
        </div>

        <ImagePicker
          label="Logo de l'église"
          value={form.logoUrl}
          onChange={(url) => setForm({ ...form, logoUrl: url })}
          egliseId={eglise.id}
        />

        <div style={{ paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? "Enregistrement…" : "Sauvegarder les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}

const s = {
  label: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  submitBtn: { padding: "11px 28px", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" } as React.CSSProperties,
};
