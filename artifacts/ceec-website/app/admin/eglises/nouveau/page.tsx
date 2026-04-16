import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminPlatteforme } from "@/lib/auth/rbac";
import NouvelleEgliseForm, { type PendingInvite } from "@/components/admin/invitation/NouvelleEgliseForm";

export const metadata = { title: "Inviter une église | CEEC Admin" };

export default async function NouvelleEglisePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isAdminPlatteforme(userId))) redirect("/admin");

  const rawPending = await prisma.eglise.findMany({
    where: { statut: "en_attente" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nom: true,
      slug: true,
      statut: true,
      inviteTokens: {
        where: { usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { email: true, expiresAt: true, createdAt: true },
      },
    },
  });

  const initialPending: PendingInvite[] = rawPending
    .filter((e) => e.inviteTokens.length > 0)
    .map((e) => ({
      id: e.id,
      nom: e.nom,
      slug: e.slug,
      statut: e.statut,
      inviteTokens: e.inviteTokens.map((t) => ({
        email: t.email,
        expiresAt: t.expiresAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),
    }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680 }}>
        <NouvelleEgliseForm initialPending={initialPending} />
      </div>
    </div>
  );
}
