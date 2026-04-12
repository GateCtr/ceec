import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { getUploadPresignedUrl } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseIdHeader = req.headers.get("x-eglise-id");
    if (!egliseIdHeader) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    const egliseId = parseInt(egliseIdHeader, 10);
    if (isNaN(egliseId)) return NextResponse.json({ error: "Église invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop grand (max 5 Mo)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format non accepté (JPG, PNG, WebP uniquement)" }, { status: 400 });
    }

    const objectId = randomUUID();

    const uploadUrl = await getUploadPresignedUrl(objectId);

    const bytes = await file.arrayBuffer();
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: bytes,
      headers: { "Content-Type": file.type },
    });

    if (!putRes.ok) {
      console.error("GCS upload failed:", putRes.status, await putRes.text());
      return NextResponse.json({ error: "Erreur lors de l'envoi vers le stockage" }, { status: 500 });
    }

    const imageUrl = `/api/gestion/images/${objectId}`;
    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
