import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import ClaimAdminInviteClient from "@/components/setup/ClaimAdminInviteClient";

const ROLE_LABELS: Record<string, string> = {
  admin_plateforme: "Administrateur Plateforme",
  moderateur_plateforme: "Modérateur Plateforme",
};

export const metadata = { title: "Invitation — Administration CEEC" };

export default async function AdminInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { userId } = await auth();

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
    <ClaimAdminInviteClient
      token={token}
      email={invite?.email ?? ""}
      roleLabel={roleLabel}
      roleNom={invite?.role?.nom ?? ""}
      error={error}
      isLoggedIn={!!userId}
    />
  );
}
