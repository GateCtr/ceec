const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

function parseObjectPath(fullPath: string): { bucketName: string; objectName: string } {
  if (!fullPath.startsWith("/")) fullPath = `/${fullPath}`;
  const parts = fullPath.split("/");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

function getPrivateObjectDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR not set");
  return dir;
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT";
  ttlSec: number;
}): Promise<string> {
  const res = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket_name: bucketName,
        object_name: objectName,
        method,
        expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
      }),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to sign URL: HTTP ${res.status}`);
  }
  const { signed_url } = await res.json();
  return signed_url as string;
}

export async function getUploadPresignedUrl(objectId: string): Promise<string> {
  const dir = getPrivateObjectDir();
  const fullPath = `${dir}/uploads/${objectId}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  return signObjectURL({ bucketName, objectName, method: "PUT", ttlSec: 300 });
}

export async function getDownloadPresignedUrl(objectId: string): Promise<string> {
  const dir = getPrivateObjectDir();
  const fullPath = `${dir}/uploads/${objectId}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  return signObjectURL({ bucketName, objectName, method: "GET", ttlSec: 3600 });
}
