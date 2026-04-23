import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [eglises, evenements] = await Promise.all([
    prisma.eglise.findMany({
      where: { statut: "actif" },
      select: { id: true, updatedAt: true },
    }).catch(() => []),
    prisma.evenement.findMany({
      where: { statutContenu: "publie" },
      select: { id: true, updatedAt: true },
      orderBy: { dateDebut: "desc" },
      take: 200,
    }).catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/paroisses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/evenements`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/annonces`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/historique`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const paroissesRoutes: MetadataRoute.Sitemap = eglises.map((e) => ({
    url: `${SITE_URL}/paroisses/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const evenementsRoutes: MetadataRoute.Sitemap = evenements.map((e) => ({
    url: `${SITE_URL}/evenements/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...paroissesRoutes, ...evenementsRoutes];
}
