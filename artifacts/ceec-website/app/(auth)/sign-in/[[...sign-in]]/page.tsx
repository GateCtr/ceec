"use client";

import { SignIn } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";

export default function SignInPage() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      fallbackRedirectUrl="/auth/redirect"
      signUpUrl="/sign-up"
      localization={frFR}
      appearance={{
        elements: {
          rootBox: {
            width: "100%",
            maxWidth: 400,
          },
          card: {
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            border: "none",
          },
          headerTitle: {
            color: "#1e3a8a",
            fontWeight: 800,
          },
          formButtonPrimary: {
            background: "#1e3a8a",
            "&:hover": { background: "#1e40af" },
          },
        },
      }}
    />
  );
}
