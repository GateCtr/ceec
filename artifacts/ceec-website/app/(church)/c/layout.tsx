import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/index";
import { EgliseProvider, type EgliseData } from "@/lib/church-context";
import ChurchNavbar from "@/components/church/ChurchNavbar";
import ChurchFooter from "@/components/church/ChurchFooter";
import ChurchAuthLayout from "@/components/church/ChurchAuthLayout";

const AUTH_PATHS = ["/c/connexion", "/c/inscription", "/c/oauth-callback"];

async function fetchChurchData(slug: string, egliseIdHeader: string | null) {
  let eglise: EgliseData | null = null;

  if (egliseIdHeader) {
    const id = parseInt(egliseIdHeader, 10);
    if (!isNaN(id)) {
      try {
        eglise = await prisma.eglise.findUnique({
          where: { id },
          select: {
            id: true, nom: true, slug: true, sousDomaine: true, statut: true,
            ville: true, adresse: true, pasteur: true, telephone: true,
            email: true, description: true, logoUrl: true, photoUrl: true,
          },
        });
      } catch { eglise = null; }
    }
  }

  if (!eglise) {
    eglise = await prisma.eglise.findUnique({
      where: { slug },
      select: {
        id: true, nom: true, slug: true, sousDomaine: true, statut: true,
        ville: true, adresse: true, pasteur: true, telephone: true,
        email: true, description: true, logoUrl: true, photoUrl: true,
      },
    });
  }

  return eglise;
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug") ?? "";
  if (!slug) return {};

  try {
    const eglise = await prisma.eglise.findUnique({
      where: { slug },
      select: { nom: true, ville: true, description: true, logoUrl: true, config: { select: { faviconUrl: true } } },
    });
    if (!eglise) return {};
    const faviconUrl = eglise.config?.faviconUrl ?? eglise.logoUrl ?? null;
    const icons = faviconUrl
      ? {
          icon: [{ url: faviconUrl }],
          shortcut: [{ url: faviconUrl }],
          apple: [{ url: faviconUrl }],
        }
      : undefined;
    return {
      title: { default: eglise.nom, template: `%s | ${eglise.nom}` },
      description: eglise.description ?? `Église de ${eglise.ville} — Communauté des Églises Évangéliques au Congo (CEEC)`,
      icons,
    };
  } catch { return {}; }
}

export default async function ChurchLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  const egliseIdHeader = headersList.get("x-eglise-id");
  const churchPath = headersList.get("x-church-path") ?? "";

  if (!slug) redirect("/");

  let eglise: EgliseData | null = null;
  try {
    eglise = await fetchChurchData(slug, egliseIdHeader);
  } catch {
    redirect("/");
  }

  if (!eglise) notFound();

  const isSuspendu = eglise.statut === "suspendu" || eglise.statut === "en_attente";
  const isOnSuspenduPage = churchPath === "/c/suspendu" || churchPath.endsWith("/suspendu");
  if (isSuspendu && !isOnSuspenduPage) redirect("/c/suspendu");

  const isAuthPage = AUTH_PATHS.some((p) => churchPath === p || churchPath.endsWith(p));

  // Fetch config and published pages
  let churchConfig = null;
  let publishedPages: Array<{ titre: string; slug: string }> = [];

  try {
    const [config, pages] = await Promise.all([
      prisma.egliseConfig.findUnique({ where: { egliseId: eglise.id } }),
      prisma.pageEglise.findMany({
        where: { egliseId: eglise.id, publie: true, type: { not: "accueil" } },
        select: { titre: true, slug: true },
        orderBy: { ordre: "asc" },
      }),
    ]);
    churchConfig = config;
    publishedPages = pages;
  } catch { /* ignore — graceful fallback */ }

  const primaryColor = churchConfig?.couleurPrimaire ?? "#1e3a8a";
  const accentColor = churchConfig?.couleurAccent ?? "#c59b2e";

  const cssVars = `
    :root {
      --church-primary: ${primaryColor.replace(/[^#a-zA-Z0-9(), .%]/g, "")};
      --church-accent: ${accentColor.replace(/[^#a-zA-Z0-9(), .%]/g, "")};
      --church-primary-dark: color-mix(in srgb, ${primaryColor.replace(/[^#a-zA-Z0-9(), .%]/g, "")} 80%, black);
    }
  `;

  // Strip dangerous CSS injection patterns (</style> breakout, JS protocol, @import)
  const sanitizeCustomCss = (css: string) =>
    css
      .replace(/<\/style\s*>/gi, "")
      .replace(/<script[\s\S]*?>/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/@import\s/gi, "/* @import */")
      .replace(/expression\s*\(/gi, "");

  const socialLinks = {
    facebook: churchConfig?.facebook,
    youtube: churchConfig?.youtube,
    instagram: churchConfig?.instagram,
    twitter: churchConfig?.twitter,
    whatsapp: churchConfig?.whatsapp,
    siteWeb: churchConfig?.siteWeb,
    horaires: churchConfig?.horaires,
  };

  if (isAuthPage) {
    return (
      <EgliseProvider eglise={eglise} isChurchDomain={true}>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {churchConfig?.cssPersonnalise && (
          <style dangerouslySetInnerHTML={{ __html: sanitizeCustomCss(churchConfig.cssPersonnalise) }} />
        )}
        <ChurchAuthLayout eglise={eglise}>{children}</ChurchAuthLayout>
      </EgliseProvider>
    );
  }

  return (
    <EgliseProvider eglise={eglise} isChurchDomain={true}>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {churchConfig?.cssPersonnalise && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCustomCss(churchConfig.cssPersonnalise) }} />
      )}
      <ChurchNavbar
        eglise={eglise}
        pages={publishedPages}
        config={{ couleurPrimaire: primaryColor, couleurAccent: accentColor }}
      />
      <main style={{ minHeight: "70vh", paddingTop: 64 }}>{children}</main>
      <ChurchFooter eglise={eglise} social={socialLinks} pages={publishedPages} />
    </EgliseProvider>
  );
}
