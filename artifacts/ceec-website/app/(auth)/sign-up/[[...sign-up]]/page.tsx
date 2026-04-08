import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";
import ChurchPickerClient from "./ChurchPickerClient";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec.cd";

export const metadata = { title: "Rejoindre la CEEC — Choisissez votre paroisse" };

async function getEglises() {
  try {
    return await prisma.eglise.findMany({
      where: { statut: "actif" },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, slug: true, ville: true, pasteur: true },
    });
  } catch {
    return [];
  }
}

export default async function SignUpPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalDev =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes(".replit.dev") ||
    host.includes(".kirk.replit.dev");

  const eglises = await getEglises();

  const eglisesWithUrl = eglises.map((e) => ({
    ...e,
    inscriptionUrl: e.slug
      ? isLocalDev
        ? `/c/inscription?eglise=${e.slug}`
        : `https://${e.slug}.${ROOT_DOMAIN}/c/inscription`
      : null,
  }));

  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: "2rem",
      width: "100%",
      maxWidth: 500,
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }}>
      {/* En-tête */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#1e3a8a" }}>
          Rejoindre la CEEC
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Choisissez votre paroisse pour créer votre compte membre
        </p>
      </div>

      {/* Sélecteur de paroisse */}
      <ChurchPickerClient eglises={eglisesWithUrl} />

      {/* Pied */}
      <div style={{ marginTop: 20, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
        <p style={{ margin: "0 0 10px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          Déjà membre ?
        </p>
        <Link
          href="/sign-in"
          style={{
            display: "block",
            textAlign: "center",
            padding: "11px 0",
            borderRadius: 8,
            border: "1.5px solid #1e3a8a",
            color: "#1e3a8a",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
