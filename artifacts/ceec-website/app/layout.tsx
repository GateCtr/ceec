import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  variable: "--font-sans",
});

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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={frFR}
    >
      <html lang="fr" className={`${playfairDisplay.variable} ${lato.variable}`}>
        <head>
          <meta name="theme-color" content="#1e3a8a" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
