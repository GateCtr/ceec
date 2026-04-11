import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EgliseProvider, type EgliseData } from "@/lib/church-context";
import ChurchNavbar from "@/components/church/ChurchNavbar";
import ChurchFooter from "@/components/church/ChurchFooter";
import ChurchAuthLayout from "@/components/church/ChurchAuthLayout";

const AUTH_PATHS = ["/c/connexion", "/c/inscription", "/c/oauth-callback"];

export default async function ChurchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  const egliseIdHeader = headersList.get("x-eglise-id");
  const churchPath = headersList.get("x-church-path") ?? "";

  if (!slug) {
    redirect("/");
  }

  let eglise: EgliseData | null = null;

  if (egliseIdHeader) {
    const id = parseInt(egliseIdHeader, 10);
    if (!isNaN(id)) {
      try {
        eglise = await prisma.eglise.findUnique({
          where: { id },
          select: {
            id: true,
            nom: true,
            slug: true,
            sousDomaine: true,
            statut: true,
            ville: true,
            adresse: true,
            pasteur: true,
            telephone: true,
            email: true,
            description: true,
            logoUrl: true,
            photoUrl: true,
          },
        });
      } catch {
        eglise = null;
      }
    }
  }

  if (!eglise) {
    try {
      eglise = await prisma.eglise.findUnique({
        where: { slug },
        select: {
          id: true,
          nom: true,
          slug: true,
          sousDomaine: true,
          statut: true,
          ville: true,
          adresse: true,
          pasteur: true,
          telephone: true,
          email: true,
          description: true,
          logoUrl: true,
          photoUrl: true,
        },
      });
    } catch {
      redirect("/");
    }
  }

  if (!eglise) {
    notFound();
  }

  const isSuspendu =
    eglise.statut === "suspendu" || eglise.statut === "en_attente";

  const isOnSuspenduPage =
    churchPath === "/c/suspendu" || churchPath.endsWith("/suspendu");

  if (isSuspendu && !isOnSuspenduPage) {
    redirect("/c/suspendu");
  }

  // Pages d'authentification → layout centré avec logo de l'église
  const isAuthPage = AUTH_PATHS.some(
    (p) => churchPath === p || churchPath.endsWith(p)
  );

  if (isAuthPage) {
    return (
      <EgliseProvider eglise={eglise} isChurchDomain={true}>
        <ChurchAuthLayout eglise={eglise}>
          {children}
        </ChurchAuthLayout>
      </EgliseProvider>
    );
  }

  return (
    <EgliseProvider eglise={eglise} isChurchDomain={true}>
      <ChurchNavbar eglise={eglise} />
      <main style={{ minHeight: "70vh" }}>{children}</main>
      <ChurchFooter eglise={eglise} />
    </EgliseProvider>
  );
}
