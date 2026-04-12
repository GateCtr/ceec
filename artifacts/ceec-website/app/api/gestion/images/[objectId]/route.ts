import { NextRequest, NextResponse } from "next/server";
import { getDownloadPresignedUrl } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ objectId: string }> }
) {
  const { objectId } = await params;

  if (!objectId || objectId.includes("..") || objectId.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const signedUrl = await getDownloadPresignedUrl(objectId);
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
