"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getStoredSlug(): string | null {
  try {
    const ss = sessionStorage.getItem("ceec_church_slug");
    if (ss) return ss;
  } catch {}
  const match = typeof document !== "undefined"
    ? document.cookie.split("; ").find((r) => r.startsWith("ceec_church_slug="))
    : undefined;
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function clearStoredSlug() {
  try { sessionStorage.removeItem("ceec_church_slug"); } catch {}
}

function OAuthCallbackInner() {
  const { handleRedirectCallback } = useClerk();
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = useRef(false);

  // Phase 2 : rattacher le membre à son église (sign-up ET sign-in OAuth)
  // L'appel register-fidele est idempotent (upsert) — sans risque pour les membres existants.
  useEffect(() => {
    if (searchParams.get("post") !== "register") return;
    if (!userId || registered.current) return;
    registered.current = true;

    const slug = getStoredSlug();

    const finish = () => {
      clearStoredSlug();
      router.replace("/c");
    };

    if (!slug) {
      finish();
      return;
    }

    fetch("/api/church/register-fidele", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ egliseSlug: slug }),
    })
      .catch(() => {})
      .finally(finish);
  }, [userId, searchParams, router]);

  // Phase 1 : finaliser le handshake OAuth Clerk
  // Les deux chemins (sign-in ET sign-up) passent par ?post=register pour garantir
  // que le rattachement à l'église est toujours tenté.
  useEffect(() => {
    if (searchParams.get("post") === "register") return;

    handleRedirectCallback({
      signInForceRedirectUrl: "/c/oauth-callback?post=register",
      signUpForceRedirectUrl: "/c/oauth-callback?post=register",
    }).catch(() => {
      router.replace("/c");
    });
  }, [handleRedirectCallback, searchParams, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "2rem 2.5rem",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        maxWidth: 360,
        width: "90%",
      }}>
        <div style={{ marginBottom: 16 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block" }}>
            <circle cx="20" cy="20" r="18" fill="#eff6ff" />
            <path d="M28.9 14.9c0-.637-.057-1.251-.164-1.84H20v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M20 29c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H8.957v2.332A8.997 8.997 0 0 0 20 29z" fill="#34A853"/>
            <path d="M14.964 21.71A5.41 5.41 0 0 1 14.682 20c0-.593.102-1.17.282-1.71v-2.332h-3.007A8.996 8.996 0 0 0 11 20c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M20 14.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C24.463 11.891 22.426 11 20 11a8.997 8.997 0 0 0-8.043 4.958l3.007 2.332C15.672 16.163 17.656 14.58 20 14.58z" fill="#EA4335"/>
          </svg>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#1e3a8a" }}>
          Connexion Google en cours…
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
