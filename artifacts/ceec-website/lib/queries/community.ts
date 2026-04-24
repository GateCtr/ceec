import { prisma } from "@/lib/db";

export interface CommunauteStats {
  nbEglises: string;
  nbProvinces: string;
  nbFideles: string;
  anneeFondation: string;
}

const DEFAULT_STATS: CommunauteStats = {
  nbEglises: "50+",
  nbProvinces: "5+",
  nbFideles: "2 000+",
  anneeFondation: "2009",
};

/**
 * Récupère les statistiques communautaires depuis la config et le nombre d'églises.
 * Utilisé par la page d'accueil et la page à-propos.
 */
export async function getCommunauteStats(): Promise<CommunauteStats> {
  try {
    const [nbEglises, configEntries] = await Promise.all([
      prisma.eglise.count({ where: { statut: "actif" } }),
      prisma.communauteConfig.findMany(),
    ]);

    const cfg = Object.fromEntries(configEntries.map((c) => [c.cle, c]));

    return {
      nbEglises: cfg["nb_eglises"]?.valeur ?? (nbEglises > 0 ? String(nbEglises) : "50+"),
      nbProvinces: cfg["nb_provinces"]?.valeur ?? "5+",
      nbFideles: cfg["nb_fideles"]?.valeur ?? "2 000+",
      anneeFondation: cfg["annee_fondation"]?.valeur ?? "2009",
    };
  } catch {
    return DEFAULT_STATS;
  }
}
