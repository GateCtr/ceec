"use client";

import { useState } from "react";
import { Calendar, Megaphone, MapPin, CheckCircle, ChevronRight } from "lucide-react";
import { CHURCH_ROLE_LABELS } from "@/lib/membre-role-constants";

interface ProfilData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: string;
  statut: string;
  dateAdhesion: string | null;
  createdAt: string;
  photoUrl: string | null;
}

interface EventInscrit {
  id: number;
  titre: string;
  dateDebut: string;
  lieu: string | null;
  imageUrl: string | null;
  aVenir: boolean;
}

interface Props {
  profil: ProfilData;
  evenementsInscrits: EventInscrit[];
  annonces: Array<{
    id: number;
    titre: string;
    contenu: string;
    priorite: string;
    datePublication: string;
    imageUrl: string | null;
    categorie: string | null;
  }>;
  eglise: { nom: string; slug: string };
}

function roleFR(role: string) {
  const map: Record<string, string> = {
    fidele: "Fidèle",
    diacre: "Diacre",
    pasteur: "Pasteur",
    secretaire: "Secrétaire",
    tresorier: "Trésorier",
    admin_eglise: "Administrateur",
    super_admin: "Super Admin",
    admin_plateforme: "Admin Plateforme",
    moderateur_plateforme: "Modérateur",
  };
  return map[role] ?? role;
}

export default function MonEspaceClient({ profil, evenementsInscrits, annonces, eglise }: Props) {
  const [tab, setTab] = useState<"profil" | "evenements" | "annonces">("profil");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom: profil.nom, prenom: profil.prenom, telephone: profil.telephone ?? "" });
  const [currentProfil, setCurrentProfil] = useState(profil);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const primary = "var(--church-primary, #1e3a8a)";
  const accent = "var(--church-accent, #c59b2e)";

  async function handleSave() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      setFormError("Nom et prénom requis.");
      return;
    }
    setSaving(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await fetch("/api/membre/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentProfil((p) => ({ ...p, ...updated }));
        setEditMode(false);
        setFormSuccess("Profil mis à jour !");
        setTimeout(() => setFormSuccess(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Erreur lors de la sauvegarde.");
      }
    } finally {
      setSaving(false);
    }
  }

  const aVenir = evenementsInscrits.filter((e) => e.aVenir);
  const passes = evenementsInscrits.filter((e) => !e.aVenir);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: 8, fontWeight: active ? 700 : 500, fontSize: 14,
    background: active ? primary : "transparent",
    color: active ? "white" : "#64748b",
    border: "none", cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "80vh", background: "#f8fafc", padding: "2rem 1rem 4rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${primary}, #1e2d6b)`,
          borderRadius: 16, padding: "2rem", color: "white", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          {currentProfil.photoUrl ? (
            <img
              src={currentProfil.photoUrl}
              alt={`${currentProfil.prenom} ${currentProfil.nom}`}
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `3px solid ${accent}` }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: accent, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 28, color: "#1e3a8a", flexShrink: 0,
            }}>
              {currentProfil.prenom.charAt(0).toUpperCase()}{currentProfil.nom.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>
              {currentProfil.prenom} {currentProfil.nom}
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {(() => {
                const roleInfo = CHURCH_ROLE_LABELS[currentProfil.role];
                return roleInfo ? (
                  <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 99, background: roleInfo.bg, color: roleInfo.color,
                  }}>
                    {roleInfo.label}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, opacity: 0.8 }}>{roleFR(currentProfil.role)}</span>
                );
              })()}
              <span style={{ fontSize: 13, opacity: 0.75 }}>{eglise.nom}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
              Membre depuis {currentProfil.dateAdhesion
                ? new Date(currentProfil.dateAdhesion).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : new Date(currentProfil.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 14px",
            fontSize: 12, fontWeight: 700,
          }}>
            {currentProfil.statut === "actif" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircle size={13} />Actif
              </span>
            ) : currentProfil.statut}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button style={tabStyle(tab === "profil")} onClick={() => setTab("profil")}>Profil</button>
          <button style={tabStyle(tab === "evenements")} onClick={() => setTab("evenements")}>
            Mes événements {aVenir.length > 0 && `(${aVenir.length})`}
          </button>
          <button style={tabStyle(tab === "annonces")} onClick={() => setTab("annonces")}>
            Annonces ({annonces.length})
          </button>
        </div>

        {/* Profil Tab */}
        {tab === "profil" && (
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", margin: 0 }}>Mes informations</h2>
              {!editMode && (
                <button
                  onClick={() => { setEditMode(true); setForm({ nom: currentProfil.nom, prenom: currentProfil.prenom, telephone: currentProfil.telephone ?? "" }); }}
                  style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${primary}`, background: "transparent", color: primary, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Modifier
                </button>
              )}
            </div>

            {formSuccess && (
              <div style={{ background: "#dcfce7", color: "#16a34a", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {formSuccess}
              </div>
            )}

            {editMode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {formError && (
                  <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                    {formError}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Prénom *</span>
                    <input
                      value={form.prenom}
                      onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                      style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Nom *</span>
                    <input
                      value={form.nom}
                      onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                      style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                    />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Téléphone</span>
                  <input
                    value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    placeholder="+243 xxx xxx xxx"
                    style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                  />
                </label>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => setEditMode(false)}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: primary, color: "white", fontWeight: 700, fontSize: 14, cursor: saving ? "wait" : "pointer" }}
                  >
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Prénom", value: currentProfil.prenom },
                  { label: "Nom", value: currentProfil.nom },
                  { label: "Email", value: currentProfil.email },
                  { label: "Téléphone", value: currentProfil.telephone ?? "—" },
                  { label: "Rôle", value: roleFR(currentProfil.role) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    <span style={{ fontSize: 15, color: "#0f172a", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Événements Tab */}
        {tab === "evenements" && (
          <div>
            {aVenir.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 12 }}>
                  À venir ({aVenir.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {aVenir.map((evt) => <EventCard key={evt.id} evt={evt} primary={primary} />)}
                </div>
              </div>
            )}
            {passes.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "#64748b", marginBottom: 12 }}>
                  Passés
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: 0.7 }}>
                  {passes.map((evt) => <EventCard key={evt.id} evt={evt} primary={primary} />)}
                </div>
              </div>
            )}
            {evenementsInscrits.length === 0 && (
              <div style={{ background: "white", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                  <Calendar size={40} color="#94a3b8" strokeWidth={1.5} />
                </div>
                <p style={{ color: "#64748b", fontSize: 15 }}>Vous n&apos;êtes inscrit à aucun événement pour le moment.</p>
                <a href="/c/evenements" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, padding: "9px 20px", borderRadius: 8, background: primary, color: "white", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  Voir les événements <ChevronRight size={15} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Annonces Tab */}
        {tab === "annonces" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {annonces.length === 0 ? (
              <div style={{ background: "white", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                  <Megaphone size={40} color="#94a3b8" strokeWidth={1.5} />
                </div>
                <p style={{ color: "#64748b", fontSize: 15 }}>Aucune annonce pour le moment.</p>
              </div>
            ) : (
              annonces.map((a) => (
                <a key={a.id} href={`/c/annonces/${a.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: 14, padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt={a.titre} style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {a.priorite === "urgente" && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 99, marginBottom: 6, display: "inline-block" }}>
                          URGENT
                        </span>
                      )}
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, lineHeight: 1.3 }}>{a.titre}</div>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                        {a.contenu}
                      </p>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                        {new Date(a.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ evt, primary }: { evt: { id: number; titre: string; dateDebut: string; lieu: string | null; imageUrl: string | null; aVenir: boolean }; primary: string }) {
  const date = new Date(evt.dateDebut);
  return (
    <a href={`/c/evenements/${evt.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", display: "flex", alignItems: "stretch" }}>
        <div style={{ width: 72, flexShrink: 0, background: `linear-gradient(135deg, ${primary}, #1e2d6b)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", padding: "0.75rem 0.5rem" }}>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{date.getDate()}</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>{date.toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
          <div style={{ fontSize: 10, opacity: 0.65 }}>{date.getFullYear()}</div>
        </div>
        <div style={{ padding: "0.875rem 1rem", flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{evt.titre}</div>
          {evt.lieu && (
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} />{evt.lieu}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
