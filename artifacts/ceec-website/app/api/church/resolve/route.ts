import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const INTERNAL_RESOLVE_HEADER = "x-internal-resolve";
const INTERNAL_RESOLVE_SECRET =
  process.env.INTERNAL_RESOLVE_SECRET ?? "ceec-internal-resolve";

export async function GET(req: NextRequest) {
  const resolveHeader = req.headers.get(INTERNAL_RESOLVE_HEADER);
  if (resolveHeader !== INTERNAL_RESOLVE_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug requis" }, { status: 400 });
  }

  try {
    const eglise = await prisma.eglise.findUnique({
      where: { slug },
      select: { id: true, slug: true, statut: true },
    });

    if (!eglise) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    return NextResponse.json(
      { id: eglise.id, slug: eglise.slug, statut: eglise.statut },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
