import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

function esc(v: string | null | undefined): string {
  if (v == null) return "";
  let s = String(v);
  if (s.length > 0 && ["=", "+", "-", "@", "\t", "\r"].includes(s[0])) {
    s = "'" + s;
  }
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCSV(rows: Record<string, unknown>[], headers: { key: string; label: string }[]): string {
  const head = headers.map((h) => esc(h.label)).join(",");
  const body = rows
    .map((row) => headers.map((h) => esc(row[h.key] as string)).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

function fmtDatetime(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleString("fr-FR");
}

const statutLabels: Record<string, string> = {
  publie: "Publié",
  brouillon: "Brouillon",
  en_attente: "En attente",
  rejete: "Rejeté",
};

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseIdHeader = req.headers.get("x-eglise-id");
    if (!egliseIdHeader) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    const egliseId = parseInt(egliseIdHeader, 10);
    if (isNaN(egliseId)) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || (await hasPermission(userId, "eglise_voir_evenements", egliseId));
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const [evenements, eglise] = await Promise.all([
      prisma.evenement.findMany({
        where: { egliseId },
        include: { _count: { select: { participations: true } } },
        orderBy: { dateDebut: "desc" },
      }),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { slug: true } }),
    ]);

    const rows = evenements.map((e) => ({
      titre: e.titre,
      statut: statutLabels[e.statutContenu as string] ?? e.statutContenu,
      categorie: e.categorie ?? "",
      dateDebut: fmtDatetime(e.dateDebut),
      dateFin: fmtDatetime(e.dateFin),
      lieu: e.lieu ?? "",
      nbParticipants: String(e._count.participations),
    }));

    const csv = toCSV(rows, [
      { key: "titre", label: "Titre" },
      { key: "statut", label: "Statut" },
      { key: "categorie", label: "Catégorie" },
      { key: "dateDebut", label: "Date de début" },
      { key: "dateFin", label: "Date de fin" },
      { key: "lieu", label: "Lieu" },
      { key: "nbParticipants", label: "Participants inscrits" },
    ]);

    const slug = eglise?.slug ?? "eglise";
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `evenements-${slug}-${dateStr}.csv`;

    return new NextResponse("\uFEFF" + csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
