import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin, isEgliseStaff } from "@/lib/auth/rbac";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await isEgliseStaff(userId, egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const config = await prisma.egliseConfig.findUnique({ where: { egliseId }, select: { id: true } });
    if (!config) return NextResponse.json({ messages: [], total: 0, nonLus: 0 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;
    const nonLuFilter = url.searchParams.get("nonLu") === "true";

    const where = { configId: config.id, ...(nonLuFilter ? { lu: false } : {}) };

    const [messages, total, nonLus] = await Promise.all([
      prisma.messageContact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.messageContact.count({ where }),
      prisma.messageContact.count({ where: { configId: config.id, lu: false } }),
    ]);

    return NextResponse.json({ messages, total, nonLus, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
