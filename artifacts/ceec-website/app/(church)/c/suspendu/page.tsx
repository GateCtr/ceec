import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { AlertTriangle } from "lucide-react";

export default async function ChurchSuspenduPage() {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");

  let eglise: { nom: string; statut: string } | null = null;
  if (slug) {
    eglise = await prisma.eglise
      .findUnique({
        where: { slug },
        select: { nom: true, statut: true },
      })
      .catch(() => null);
  }

  const isEnAttente = eglise?.statut === "en_attente";

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 520,
          padding: "3rem 2rem",
          background: "white",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "#b45309",
          }}
        >
          <AlertTriangle size={36} />
        </div>

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          {isEnAttente
            ? "Espace en attente d'activation"
            : "Espace temporairement suspendu"}
        </h1>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.7,
            fontSize: 15,
            marginBottom: 28,
          }}
        >
          {isEnAttente
            ? "Cet espace d'église est en cours de validation par les administrateurs de la "
            : "Cet espace d'église est temporairement suspendu par les administrateurs de la "}
          <strong style={{ color: "#1e3a8a" }}>CEEC</strong>.
        </p>

        <p
          style={{
            color: "#94a3b8",
            fontSize: 13,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Si vous êtes l&apos;administrateur de cette église, veuillez contacter
          la plateforme CEEC pour plus d&apos;informations.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/"
            style={{
              padding: "11px 24px",
              borderRadius: 8,
              background: "#1e3a8a",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Retour à l&apos;accueil CEEC
          </a>
          <a
            href="/contact"
            style={{
              padding: "11px 24px",
              borderRadius: 8,
              border: "1.5px solid #1e3a8a",
              color: "#1e3a8a",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Contacter la CEEC
          </a>
        </div>
      </div>
    </div>
  );
}
