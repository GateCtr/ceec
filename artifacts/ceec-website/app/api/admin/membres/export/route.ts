import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { enrichMembresWithRolesMultiChurch, CHURCH_ROLE_LABELS } from "@/lib/membre-role";

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
  const body = rows.map((row) => headers.map((h) => esc(row[h.key] as string)).join(",")).join("\n");
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

    const superAdmin = await isSuperAdmin(userId);
    const platformAdmin = superAdmin || (await isAdminPlatteforme(userId));
    if (!platformAdmin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const platformAdminIds = await prisma.userRole.findMany({
      where: { egliseId: null },
      select: { clerkUserId: true },
    });
    const excludedClerkIds = platformAdminIds.map((r) => r.clerkUserId);

    const membres = await prisma.membre.findMany({
      where: excludedClerkIds.length > 0
        ? { clerkUserId: { notIn: excludedClerkIds } }
        : undefined,
      include: { eglise: { select: { nom: true, slug: true } } },
      orderBy: [{ eglise: { nom: "asc" } }, { nom: "asc" }],
    });

    const enriched = await enrichMembresWithRolesMultiChurch(membres);

    const rows = enriched.map((m) => ({
      prenom: m.prenom,
      nom: m.nom,
      email: m.email,
      telephone: m.telephone ?? "",
      role: CHURCH_ROLE_LABELS[m.roleNom]?.label ?? m.roleNom,
      statut: m.statut,
      eglise: m.eglise?.nom ?? "",
      dateAdhesion: fmtDate(m.dateAdhesion),
    }));

    const csv = toCSV(rows, [
      { key: "prenom", label: "Prénom" },
      { key: "nom", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "telephone", label: "Téléphone" },
      { key: "role", label: "Rôle" },
      { key: "statut", label: "Statut" },
      { key: "eglise", label: "Église" },
      { key: "dateAdhesion", label: "Date d'adhésion" },
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `membres-global-${dateStr}.csv`;

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
