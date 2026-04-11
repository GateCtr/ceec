const ALLOWED_PROTOCOLS = ["https:", "http:", "mailto:", "tel:", "whatsapp:"];

/**
 * Validates a URL from untrusted config/DB input.
 * Returns the URL if it uses an allowed protocol or is a relative path.
 * Returns "#" (safe no-op anchor) if the URL is invalid or dangerous.
 */
export function safeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";

  // Allow relative URLs starting with / or ./
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) return trimmed;
  } catch {
    // Not a valid absolute URL
  }

  return "#";
}
