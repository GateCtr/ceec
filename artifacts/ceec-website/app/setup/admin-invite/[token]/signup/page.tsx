import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PlatformSignUpClient from "@/components/setup/PlatformSignUpClient";

const ROLE_LABELS: Record<string, string> = {
  admin_plateforme: "Administrateur Plateforme",
  moderateur_plateforme: "Modérateur Plateforme",
};

export const metadata = { title: "Créer un compte — Administration CEEC" };

export default async function PlatformSignUpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { userId } = await auth();

  if (userId) {
    redirect(`/setup/admin-invite/${token}`);
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { role: true },
  });

  let error: string | null = null;
  if (!invite || invite.egliseId !== null) {
    error = "Lien d'invitation invalide ou introuvable.";
  } else if (invite.usedAt) {
    error = "Ce lien a déjà été utilisé.";
  } else if (invite.expiresAt < new Date()) {
    error = "Ce lien d'invitation a expiré (validité : 7 jours).";
  }

  const roleLabel = ROLE_LABELS[invite?.role?.nom ?? ""] ?? invite?.role?.nom ?? "";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <PlatformSignUpClient
        token={token}
        email={invite?.email ?? ""}
        roleLabel={roleLabel}
        error={error}
      />
    </div>
  );
}
