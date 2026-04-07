"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

type PendingInvite = {
  id: number;
  nom: string;
  slug: string | null;
  statut: string;
  inviteTokens: Array<{ email: string; expiresAt: string; createdAt: string }>;
};

export default function NouvelleEglisePage() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", slug: "", ville: "", emailAdmin: "", sousDomaine: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ eglise: { nom: string; slug: string }; inviteToken: string; emailEnvoye: boolean } | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    fetch("/api/admin/eglises")
      .then((r) => r.json())
      .then((data: PendingInvite[]) => {
        if (Array.isArray(data)) {
          setPendingInvites(data.filter((e) => e.statut === "en_attente" && e.inviteTokens.length > 0));
        }
      })
      .catch(() => {});
  }, []);

  const handleNomChange = (nom: string) => {
    setForm((f) => ({
      ...f,
      nom,
      slug: slugEdited ? f.slug : slugify(nom),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/eglises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la création");
        return;
      }

      setSuccess(data);
    } catch {
      setError("Erreur réseau, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>✓</div>
            <h2 style={{ color: "#1e3a8a", margin: "0 0 8px" }}>Invitation envoyée !</h2>
            <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>
              L&apos;église <strong>{success.eglise.nom}</strong> a été créée avec succès.
            </p>
          </div>

          {success.emailEnvoye ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
              <p style={{ margin: 0, color: "#15803d", fontSize: 14 }}>
                ✉️ L&apos;email d&apos;invitation a été envoyé à l&apos;admin de l&apos;église.
              </p>
            </div>
          ) : (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
              <p style={{ margin: "0 0 8px", color: "#b45309", fontSize: 14, fontWeight: 600 }}>
                ⚠️ Email non configuré (Resend) — lien d&apos;invitation ci-dessous :
              </p>
              <code style={{ fontSize: 12, wordBreak: "break-all", color: "#1e3a8a" }}>
                {window.location.origin}/setup/{success.inviteToken}
              </code>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              style={btnOutline}
              onClick={() => {
                setSuccess(null);
                setForm({ nom: "", slug: "", ville: "", emailAdmin: "", sousDomaine: "" });
                setSlugEdited(false);
              }}
            >
              Inviter une autre église
            </button>
            <button style={btn} onClick={() => router.push("/admin/eglises")}>
              Voir la liste →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/eglises" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            ← Retour à la liste
          </Link>
          <h1 style={{ margin: "10px 0 4px", fontSize: 22, fontWeight: 800, color: "#1e3a8a" }}>Inviter une nouvelle église</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Un lien d&apos;invitation valable 7 jours sera envoyé à l&apos;administrateur désigné.
          </p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#b91c1c", fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Section title="Informations de l'église">
            <Field label="Nom de l'église *">
              <input
                style={input}
                type="text"
                placeholder="Église Évangélique du Centre"
                value={form.nom}
                onChange={(e) => handleNomChange(e.target.value)}
                required
              />
            </Field>

            <Field label="Identifiant URL (slug) *" hint="Généré automatiquement, modifiable">
              <div style={{ position: "relative" }}>
                <input
                  style={input}
                  type="text"
                  placeholder="eglise-evangelique-centre"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                  required
                  pattern="[a-z0-9\-]+"
                />
                {form.slug && (
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    URL : /paroisses/<strong>{form.slug}</strong>
                  </div>
                )}
              </div>
            </Field>

            <Field label="Ville *">
              <input
                style={input}
                type="text"
                placeholder="Kinshasa"
                value={form.ville}
                onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                required
              />
            </Field>

            <Field label="Sous-domaine (optionnel)" hint="ex: kinshasa-centre → kinshasa-centre.ceec.cd">
              <input
                style={input}
                type="text"
                placeholder="kinshasa-centre"
                value={form.sousDomaine}
                onChange={(e) => setForm((f) => ({ ...f, sousDomaine: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
              />
            </Field>
          </Section>

          <Section title="Administrateur principal">
            <Field label="Adresse email *" hint="Cette personne recevra le lien pour créer son compte">
              <input
                style={input}
                type="email"
                placeholder="pasteur@eglise.org"
                value={form.emailAdmin}
                onChange={(e) => setForm((f) => ({ ...f, emailAdmin: e.target.value }))}
                required
              />
            </Field>
          </Section>

          <button type="submit" style={{ ...btn, marginTop: 8 }} disabled={loading || !form.nom || !form.slug || !form.ville || !form.emailAdmin}>
            {loading ? "Création en cours…" : "Envoyer l'invitation →"}
          </button>
        </form>
      </div>

      {pendingInvites.length > 0 && (
        <div style={{ ...card, marginTop: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#475569" }}>
            Invitations en attente ({pendingInvites.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingInvites.map((inv) => {
              const inv0 = inv.inviteTokens[0];
              const expiresAt = inv0 ? new Date(inv0.expiresAt) : null;
              const expired = expiresAt ? expiresAt < new Date() : false;
              return (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{inv.nom}</div>
                    {inv0 && (
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Envoyé à : {inv0.email} · Expire le : {expiresAt?.toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: expired ? "#fee2e2" : "#fef3c7", color: expired ? "#b91c1c" : "#b45309" }}>
                    {expired ? "Expiré" : "En attente"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "2rem 1rem",
};

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: "2rem",
  width: "100%",
  maxWidth: 560,
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};

const btn: React.CSSProperties = {
  padding: "13px 0",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  width: "100%",
};

const btnOutline: React.CSSProperties = {
  padding: "11px 24px",
  background: "white",
  color: "#1e3a8a",
  border: "1.5px solid #1e3a8a",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
