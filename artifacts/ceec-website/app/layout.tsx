import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_FULL_NAME, SITE_DESCRIPTION } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_FULL_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "CEEC", "Église", "Évangélique", "Congo", "Paroisse", "Communauté",
    "RDC", "Kinshasa", "Foi", "Protestant",
  ],
  authors: [{ name: SITE_FULL_NAME, url: SITE_URL }],
  creator: SITE_FULL_NAME,
  publisher: SITE_FULL_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "fr_CD",
    url: SITE_URL,
    siteName: `${SITE_NAME} — ${SITE_FULL_NAME}`,
    title: `${SITE_NAME} — ${SITE_FULL_NAME}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "Logo CEEC" }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — ${SITE_FULL_NAME}`,
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: [{ url: "/icon.png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        variables: {
          colorPrimary: "#1e3a8a",
          colorNeutral: "#64748b",
          colorBackground: "#ffffff",
          colorInputBackground: "#f8fafc",
          colorInputText: "#0f172a",
          colorTextOnPrimaryBackground: "#ffffff",
          borderRadius: "10px",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        },
        elements: {
          card: {
            boxShadow: "0 12px 40px rgba(30,58,138,0.14)",
            borderRadius: "16px",
            border: "1px solid rgba(30,58,138,0.08)",
          },
          headerTitle: { color: "#1e3a8a", fontWeight: "800" },
          headerSubtitle: { color: "#64748b" },
          formButtonPrimary: {
            backgroundColor: "#1e3a8a",
            fontWeight: "700",
          },
          navbarButton__active: {
            borderLeftColor: "#c59b2e",
            color: "#1e3a8a",
          },
          badge: {
            backgroundColor: "rgba(197,155,46,0.15)",
            color: "#c59b2e",
            border: "1px solid rgba(197,155,46,0.3)",
          },
          avatarBox: {
            border: "2px solid #c59b2e",
          },
        },
      }}
    >
      <html lang="fr" className={`${playfairDisplay.variable} ${lato.variable}`} suppressHydrationWarning>
        <head>
          <meta name="theme-color" content="#1e3a8a" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
