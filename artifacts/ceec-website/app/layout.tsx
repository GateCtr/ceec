import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEEC — Communauté des Églises Évangéliques au Congo",
  description:
    "Bienvenue sur le site officiel de la Communauté des Églises Évangéliques au Congo (CEEC). Découvrez nos paroisses, nos événements et notre communauté.",
  keywords: "CEEC, Église, Évangélique, Congo, Paroisse, Communauté",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <head>
          <meta name="theme-color" content="#1e3a8a" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
