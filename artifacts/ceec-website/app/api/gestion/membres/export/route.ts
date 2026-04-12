import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

function esc(v: string | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
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

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR");
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseIdHeader = req.headers.get("x-eglise-id");
    if (!egliseIdHeader) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    const egliseId = parseInt(egliseIdHeader, 10);
    if (isNaN(egliseId)) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || (await hasPermission(userId, "eglise_voir_membres", egliseId));
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const [membres, eglise] = await Promise.all([
      prisma.membre.findMany({
        where: { egliseId },
        orderBy: { nom: "asc" },
      }),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { slug: true } }),
    ]);

    const rows = membres.map((m) => ({
      prenom: m.prenom,
      nom: m.nom,
      email: m.email,
      telephone: m.telephone ?? "",
      role: m.role,
      statut: m.statut,
      dateAdhesion: fmtDate(m.dateAdhesion),
    }));

    const csv = toCSV(rows, [
      { key: "prenom", label: "Prénom" },
      { key: "nom", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "telephone", label: "Téléphone" },
      { key: "role", label: "Rôle" },
      { key: "statut", label: "Statut" },
      { key: "dateAdhesion", label: "Date d'adhésion" },
    ]);

    const slug = eglise?.slug ?? "eglise";
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `membres-${slug}-${dateStr}.csv`;

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
