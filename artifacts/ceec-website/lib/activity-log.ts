import { prisma } from "@/lib/db";

export type ActivityAction =
  | "creer"
  | "modifier"
  | "supprimer"
  | "suspendre"
  | "reactiver"
  | "inviter"
  | "revoquer"
  | "publier"
  | "depublier"
  | "soumettre"
  | "approuver"
  | "rejeter";

export type ActivityEntityType =
  | "annonce"
  | "evenement"
  | "page"
  | "membre"
  | "eglise"
  | "admin"
  | "role";

export interface LogActivityParams {
  acteurId: string;
  acteurNom: string;
  action: ActivityAction;
  entiteType: ActivityEntityType;
  entiteId?: number;
  entiteLabel?: string;
  egliseId?: number;
  egliseNom?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        acteurId: params.acteurId,
        acteurNom: params.acteurNom,
        action: params.action,
        entiteType: params.entiteType,
        entiteId: params.entiteId ?? null,
        entiteLabel: params.entiteLabel ?? null,
        egliseId: params.egliseId ?? null,
        egliseNom: params.egliseNom ?? null,
        metadata: (params.metadata ?? {}) as object,
      },
    });
  } catch (err) {
    console.error("[ActivityLog] Échec de l'enregistrement de l'activité:", err);
  }
}

export async function getActeurNom(userId: string, egliseId?: number): Promise<string> {
  try {
    const where = egliseId
      ? { clerkUserId: userId, egliseId }
      : { clerkUserId: userId };
    const membre = await prisma.membre.findFirst({
      where,
      select: { prenom: true, nom: true },
    });
    if (membre) return `${membre.prenom} ${membre.nom}`;

    if (egliseId) {
      const fallback = await prisma.membre.findFirst({
        where: { clerkUserId: userId },
        select: { prenom: true, nom: true },
      });
      if (fallback) return `${fallback.prenom} ${fallback.nom}`;
    }

    return `user:${userId.slice(-8)}`;
  } catch {
    return `user:${userId.slice(-8)}`;
  }
}

export const ACTION_LABELS: Record<string, string> = {
  creer: "a créé",
  modifier: "a modifié",
  supprimer: "a supprimé",
  suspendre: "a suspendu",
  reactiver: "a réactivé",
  inviter: "a invité",
  revoquer: "a révoqué",
  publier: "a publié",
  depublier: "a dépublié",
};

export const ENTITY_LABELS: Record<string, string> = {
  annonce: "l'annonce",
  evenement: "l'événement",
  page: "la page",
  membre: "le membre",
  eglise: "l'église",
  admin: "l'admin",
  role: "le rôle",
};
