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
    <div className="card p-8">
      {eglise.slug && (
        <div className="rounded-lg bg-muted px-3.5 py-2 mb-5 text-[13px] text-muted-foreground">
          Slug : <code className="font-semibold text-primary">{eglise.slug}</code>
          <span className="ml-2 text-slate-400">(non modifiable)</span>
        </div>
      )}

      {error && <div className="alert alert-danger mb-4">{error}</div>}
      {success && (
        <div className="alert alert-success mb-4">
          <CheckCircle size={16} /> Informations mises à jour avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <div className="form-group">
          <label className="label">Nom de l&apos;église *</label>
          <input className="input" {...field("nom")} required />
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea className="input textarea" {...field("description")} placeholder="Courte description de votre église…" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Ville *</label>
            <input className="input" {...field("ville")} required />
          </div>
          <div className="flex-2">
            <label className="label">Adresse</label>
            <input className="input" {...field("adresse")} placeholder="Rue, quartier…" />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Nom du pasteur</label>
          <input className="input" {...field("pasteur")} placeholder="Pasteur Jean Dupont" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Téléphone</label>
            <input type="tel" className="input" {...field("telephone")} placeholder="+243 8xx xxx xxx" />
          </div>
          <div className="flex-1">
            <label className="label">E-mail de contact</label>
            <input type="email" className="input" {...field("email")} placeholder="contact@eglise.cd" />
          </div>
        </div>

        <ImagePicker
          label="Logo de l'église"
          value={form.logoUrl}
          onChange={(url) => setForm({ ...form, logoUrl: url })}
          egliseId={eglise.id}
        />

        <div className="pt-2 border-t border-slate-100">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Enregistrement…" : "Sauvegarder les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
