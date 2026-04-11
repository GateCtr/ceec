import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  isSuperAdminFromClaims,
  isAdminPlatteformeFromClaims,
  hasAnyChurchRoleFromClaims,
  isEgliseAdminFromClaims,
} from "@/lib/auth/rbac-edge";
import { resolveChurchBySlug } from "@/lib/db/edge";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec.cd";

// Chemins qui ne doivent JAMAIS être réécrits vers /c/...
// Règle : toutes les routes /api/ générales bypass la réécriture église.
// Seules les routes d'église spécifiques (/api/gestion, /api/eglise) sont
// potentiellement concernées par le contexte paroissial.
const CHURCH_REWRITE_BYPASS_PATHS = [
  "/eglise-introuvable",
  "/sign-in",
  "/sign-up",
  "/api/church",
  "/api/webhooks",
  "/api/me",
  "/api/admin",
  "/api/auth",
  "/api/setup",
];

function extractChurchSlug(req: Request): string | null {
  const host = req.headers.get("host") ?? "";

  const isLocalDev =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes(".replit.dev") ||
    host.includes(".kirk.replit.dev");

  if (!isLocalDev) {
    // Extraire le sous-domaine UNIQUEMENT si l'hôte est un vrai sous-domaine de ROOT_DOMAIN.
    // Ex: "eglise1.ceec.cd"       → "eglise1"   ✓
    //     "ceec.cd"               → null         ✓ (domaine racine, pas de sous-domaine)
    //     "ceec-site.vercel.app"  → null         ✓ (domaine tiers, jamais un slug)
    //     "ceec-site.replit.app"  → null         ✓ (domaine Replit production)
    if (host.endsWith("." + ROOT_DOMAIN)) {
      const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
      if (sub && sub !== "www" && !sub.includes(".")) return sub;
    }
  }

  const url = new URL(req.url);
  const devSlug = url.searchParams.get("eglise");
  if (devSlug && devSlug.trim() && isLocalDev) return devSlug.trim();

  if (isLocalDev) {
    const cookieSlug = req.headers.get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("ceec_church_slug="))
      ?.split("=")[1];
    if (cookieSlug && cookieSlug.trim()) return cookieSlug.trim();
  }

  return null;
}

function isNeonCompatible(): boolean {
  const neonUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  return neonUrl.includes("neon.tech") || !!process.env.NEON_DATABASE_URL;
}

const INTERNAL_RESOLVE_SECRET =
  process.env.INTERNAL_RESOLVE_SECRET ?? "ceec-internal-resolve";

interface ChurchInfo {
  id: number;
  slug: string;
  statut: string;
}

async function resolveChurch(
  slug: string,
  baseUrl: string
): Promise<ChurchInfo | null> {
  if (isNeonCompatible()) {
    return resolveChurchBySlug(slug);
  }

  try {
    const resolveUrl = `${baseUrl}/api/church/resolve?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(resolveUrl, {
      headers: { "x-internal-resolve": INTERNAL_RESOLVE_SECRET },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ChurchInfo;
  } catch {
    return null;
  }
}

function setChurchCookie(target: NextResponse, slug: string) {
  target.cookies.set("ceec_church_slug", slug, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/a-propos(.*)",
  "/historique(.*)",
  "/paroisses(.*)",
  "/evenements(.*)",
  "/annonces(.*)",
  "/contact(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/setup(.*)",
  "/c(.*)",
  "/eglise-introuvable(.*)",
  "/api/paroisses(.*)",
  "/api/annonces(.*)",
  "/api/evenements(.*)",
  "/api/public(.*)",
  "/api/setup(.*)",
  "/api/church(.*)",
  "/api/webhooks/(.*)",
  // Routes qui gèrent leur propre auth en interne
  "/api/me(.*)",
]);

const isPlatformAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isChurchAdminRoute = createRouteMatcher([
  "/api/eglise/:egliseId/admin(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/auth/redirect(.*)",
  "/gestion(.*)",
  "/api/membres(.*)",
]);

function extractEgliseId(pathname: string): number | null {
  const match = pathname.match(/\/eglise\/(\d+)\//);
  return match ? parseInt(match[1], 10) : null;
}

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;

  // Guard : les callbacks OAuth church (/c/oauth-callback) nécessitent soit un
  // cookie d'église actif, soit une session Clerk existante. Sinon redirect /sign-up.
  if (
    url.pathname === "/c/oauth-callback" ||
    url.pathname.startsWith("/c/oauth-callback/")
  ) {
    const cookieSlug = req.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("ceec_church_slug="))
      ?.split("=")[1];

    const { userId } = await auth();

    if (!cookieSlug && !userId) {
      return NextResponse.redirect(new URL("/sign-up", req.url));
    }
  }

  const churchSlug = extractChurchSlug(req);

  const isChurchNativePrefix =
    url.pathname.startsWith("/c") ||
    url.pathname === "/gestion" ||
    url.pathname.startsWith("/gestion/") ||
    url.pathname.startsWith("/api/gestion");

  if (churchSlug && isChurchNativePrefix) {
    const baseUrl = `${url.protocol}//${url.host}`;
    const church = await resolveChurch(churchSlug, baseUrl);

    const requestHeaders = new Headers(req.headers);
    if (church) {
      requestHeaders.set("x-eglise-slug", church.slug);
      requestHeaders.set("x-eglise-id", String(church.id));
    } else {
      requestHeaders.set("x-eglise-slug", churchSlug);
    }
    requestHeaders.set("x-church-path", url.pathname);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    if (church) setChurchCookie(res, church.slug);
    return res;
  }

  if (churchSlug && !isChurchNativePrefix) {
    const shouldBypass = CHURCH_REWRITE_BYPASS_PATHS.some(
      (p) => url.pathname === p || url.pathname.startsWith(p + "/")
    );

    if (!shouldBypass) {
      const baseUrl = `${url.protocol}//${url.host}`;
      const church = await resolveChurch(churchSlug, baseUrl);

      if (!church) {
        return NextResponse.redirect(new URL("/eglise-introuvable", req.url));
      }

      const rewriteUrl = url.clone();
      const pathSuffix = url.pathname === "/" ? "" : url.pathname;

      if (church.statut === "suspendu" || church.statut === "en_attente") {
        rewriteUrl.pathname = "/c/suspendu";
      } else {
        rewriteUrl.pathname = `/c${pathSuffix}`;
      }

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-eglise-slug", church.slug);
      requestHeaders.set("x-eglise-id", String(church.id));
      requestHeaders.set("x-church-path", rewriteUrl.pathname);

      const response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      response.headers.set("x-eglise-slug", church.slug);
      setChurchCookie(response, church.slug);
      return response;
    }
  }

  if (isPublicRoute(req)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  const claims = sessionClaims as Record<string, unknown> | null | undefined;

  if (!userId) {
    if (url.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isPlatformAdminRoute(req)) {
    const canAccessAdmin = isAdminPlatteformeFromClaims(claims);
    if (!canAccessAdmin) {
      if (url.pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Acces refuse - admin plateforme requis" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  if (isChurchAdminRoute(req)) {
    const egliseId = extractEgliseId(url.pathname);
    if (!egliseId || !isEgliseAdminFromClaims(claims, egliseId)) {
      return NextResponse.json(
        { error: "Acces refuse - admin eglise requis" },
        { status: 403 }
      );
    }
  }

  if (isProtectedRoute(req)) {
    if (!hasAnyChurchRoleFromClaims(claims) && !isSuperAdminFromClaims(claims)) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
