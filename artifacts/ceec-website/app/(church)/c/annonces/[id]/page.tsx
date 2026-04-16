import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/index";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: "Annonce" };
}

const prioriteStyle = (p: string) => {
  if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent" };
  if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important" };
  return { bg: "#e0f2fe", color: "#0369a1", label: "Information" };
};

export default async function AnnonceDetailPage({ params }: Props) {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const { id } = await params;
  const annonceId = parseInt(id, 10);
  if (isNaN(annonceId)) notFound();

  const eglise = await prisma.eglise.findUnique({ where: { slug } });
  if (!eglise) notFound();

  const { userId } = await auth();

  let visibiliteFilter: string[] = ["public"];
  if (userId) {
    const [memberOfThis, memberOfAny] = await Promise.all([
      prisma.membre.findFirst({ where: { clerkUserId: userId, egliseId: eglise.id, statut: "actif" } }),
      prisma.membre.findFirst({ where: { clerkUserId: userId, statut: "actif" } }),
    ]);
    if (memberOfThis) {
      visibiliteFilter = ["public", "communaute", "prive"];
    } else if (memberOfAny) {
      visibiliteFilter = ["public", "communaute"];
    }
  }

  const annonce = await prisma.annonce.findFirst({
    where: { id: annonceId, egliseId: eglise.id, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
  });
  if (!annonce) notFound();

  const style = prioriteStyle(annonce.priorite);

  // Other recent annonces (respect same visibility filter)
  const autres = await prisma.annonce.findMany({
    where: {
      egliseId: eglise.id,
      statutContenu: "publie",
      visibilite: { in: visibiliteFilter },
      id: { not: annonceId },
    },
    orderBy: [{ priorite: "asc" }, { datePublication: "desc" }],
    take: 3,
  });

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
          color: "white", padding: "4rem 1rem",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link href="/c/annonces" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.75)", fontSize: 14, textDecoration: "none", marginBottom: 20 }}>
            <ArrowLeft size={14} /> Toutes les annonces
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: style.bg, color: style.color }}>
              {style.label}
            </span>
            {annonce.categorie && (
              <span style={{ fontSize: 12, opacity: 0.7 }}>#{annonce.categorie}</span>
            )}
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.3rem)", fontWeight: 900, marginBottom: 12, lineHeight: 1.25 }}>
            {annonce.titre}
          </h1>
          <p style={{ opacity: 0.7, fontSize: 14 }}>
            Publié le {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <section style={{ padding: "3rem 1rem 5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: autres.length > 0 ? "1fr 280px" : "1fr", gap: "2rem", alignItems: "start" }}>
            {/* Main content */}
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              {annonce.imageUrl && (
                <img
                  src={annonce.imageUrl}
                  alt={annonce.titre}
                  style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }}
                />
              )}
              <div style={{ padding: "2rem" }}>
                <div style={{ fontSize: 15, lineHeight: 1.85, color: "#334155", whiteSpace: "pre-wrap" }}>
                  {annonce.contenu}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            {autres.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--church-primary, #1e3a8a)", fontSize: 15, marginBottom: 14 }}>
                  Autres annonces
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {autres.map((a) => {
                    const s = prioriteStyle(a.priorite);
                    return (
                      <Link key={a.id} href={`/c/annonces/${a.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ background: "white", borderRadius: 12, padding: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, marginBottom: 6 }}>
                            {s.label}
                          </span>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, lineHeight: 1.35, marginBottom: 4 }}>{a.titre}</div>
                          <div style={{ color: "#94a3b8", fontSize: 11 }}>
                            {new Date(a.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Link
              href="/c/annonces"
              style={{
                padding: "12px 28px", borderRadius: 10, background: "var(--church-primary, #1e3a8a)",
                color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <ArrowLeft size={15} /> Retour aux annonces
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
