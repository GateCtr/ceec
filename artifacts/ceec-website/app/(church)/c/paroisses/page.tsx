import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Users, Megaphone, CalendarDays } from "lucide-react";

export default async function ChurchParoissePage() {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({
    where: { slug },
    select: {
      id: true,
      nom: true,
      slug: true,
      ville: true,
      adresse: true,
      pasteur: true,
      telephone: true,
      email: true,
      description: true,
      logoUrl: true,
      photoUrl: true,
      statut: true,
      createdAt: true,
      _count: {
        select: { membres: true, annonces: true, evenements: true },
      },
    },
  });

  if (!eglise) redirect("/eglise-introuvable");

  const initials = eglise.nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <section
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
          color: "white",
          padding: "3.5rem 1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#c59b2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 28,
            fontWeight: 800,
            color: "white",
          }}
        >
          {initials}
        </div>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: 10 }}>
          {eglise.nom}
        </h1>
        <p style={{ opacity: 0.8, fontSize: 15 }}>
          {eglise.ville}, République Démocratique du Congo
        </p>
      </section>

      <section style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              marginBottom: 40,
            }}
          >
            {[
              { label: "Membres", value: eglise._count.membres, icon: <Users size={32} /> },
              {
                label: "Annonces",
                value: eglise._count.annonces,
                icon: <Megaphone size={32} />,
              },
              {
                label: "Événements",
                value: eglise._count.evenements,
                icon: <CalendarDays size={32} />,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "1.5rem",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: "#1e3a8a" }}>{stat.icon}</div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#1e3a8a",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "2rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#1e3a8a",
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: "2px solid #e0f2fe",
                }}
              >
                Informations
              </h2>
              <dl style={{ margin: 0 }}>
                {[
                  { label: "Ville", value: eglise.ville },
                  { label: "Adresse", value: eglise.adresse },
                  { label: "Pasteur", value: eglise.pasteur },
                  { label: "Téléphone", value: eglise.telephone },
                  { label: "E-mail", value: eglise.email },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <dt
                        style={{
                          color: "#94a3b8",
                          fontSize: 13,
                          minWidth: 80,
                          paddingTop: 1,
                        }}
                      >
                        {item.label}
                      </dt>
                      <dd
                        style={{
                          color: "#0f172a",
                          fontSize: 14,
                          fontWeight: 500,
                          margin: 0,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "2rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#1e3a8a",
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: "2px solid #e0f2fe",
                }}
              >
                À propos
              </h2>
              {eglise.description ? (
                <p
                  style={{
                    color: "#475569",
                    lineHeight: 1.8,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  {eglise.description}
                </p>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 14, fontStyle: "italic" }}>
                  Aucune description disponible pour le moment.
                </p>
              )}

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
                  Membre de la plateforme CEEC depuis{" "}
                  {new Date(eglise.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 32,
              textAlign: "center",
              padding: "2rem",
              background: "white",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
            }}
          >
            <p
              style={{
                color: "#475569",
                marginBottom: 16,
                fontSize: 15,
              }}
            >
              Rejoignez la communauté de <strong>{eglise.nom}</strong>
            </p>
            <a
              href="./inscription"
              style={{
                display: "inline-block",
                padding: "12px 32px",
                background: "#c59b2e",
                color: "white",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Rejoindre l&apos;église
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
