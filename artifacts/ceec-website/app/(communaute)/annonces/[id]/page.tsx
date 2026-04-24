import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getVisibiliteFilter } from "@/lib/auth/visibility";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const annonce = await prisma.annonce.findUnique({ where: { id: parseInt(id, 10) }, select: { titre: true } });
  return { title: annonce ? `${annonce.titre} | CEEC` : "Annonce | CEEC" };
}

const prioriteStyle = (p: string) => {
  if (p === "urgente") return { bg: "bg-red-100", text: "text-red-600", label: "Urgent", border: "border-red-300" };
  if (p === "haute") return { bg: "bg-amber-100", text: "text-amber-600", label: "Important", border: "border-amber-300" };
  return { bg: "bg-sky-100", text: "text-sky-700", label: "Information", border: "border-sky-300" };
};

export default async function AnnonceDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const visibiliteFilter = await getVisibiliteFilter();

  const annonce = await prisma.annonce.findFirst({
    where: { id: numId, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
  });
  if (!annonce) notFound();

  const style = prioriteStyle(annonce.priorite);

  const autres = await prisma.annonce.findMany({
    where: { id: { not: numId }, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
    orderBy: { datePublication: "desc" },
    take: 3,
  });

  return (
    <main className="bg-slate-50 min-h-screen pt-20">
      <div className="max-w-[1100px] mx-auto px-4 pt-8 pb-20">

        {/* Back */}
        <Link href="/annonces" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm no-underline mb-6">
          <ChevronLeft size={16} /> Toutes les annonces
        </Link>

        <div className={`grid ${autres.length > 0 ? "grid-cols-[1fr_300px]" : "grid-cols-1"} gap-8 items-start`}>

          {/* Main */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
              {annonce.imageUrl && (
                <img
                  src={annonce.imageUrl}
                  alt={annonce.titre}
                  className="w-full max-h-[400px] object-cover block"
                />
              )}
              {annonce.videoUrl && (
                <div className="px-6 pt-6">
                  <video
                    src={annonce.videoUrl}
                    controls
                    className="w-full rounded-[10px] block bg-black max-h-[400px]"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center gap-2.5 flex-wrap mb-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                    {style.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-[13px]">
                    <Calendar size={13} />
                    {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {annonce.categorie && (
                    <span className="flex items-center gap-1.5 text-muted-foreground text-[13px]">
                      <Tag size={13} /> {annonce.categorie}
                    </span>
                  )}
                </div>
                <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-foreground mb-5 leading-tight">
                  {annonce.titre}
                </h1>
                <div className="text-gray-700 text-base leading-[1.85] whitespace-pre-wrap">
                  {annonce.contenu}
                </div>
                {annonce.dateExpiration && (
                  <p className="mt-6 text-[13px] text-slate-400 border-t border-slate-100 pt-4">
                    Expire le {new Date(annonce.dateExpiration).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {autres.length > 0 && (
            <aside>
              <h3 className="font-bold text-foreground text-[15px] mb-3.5">Autres annonces</h3>
              <div className="flex flex-col gap-3">
                {autres.map((a) => {
                  const s = prioriteStyle(a.priorite);
                  return (
                    <Link key={a.id} href={`/annonces/${a.id}`} className="no-underline">
                      <div className="bg-white rounded-xl overflow-hidden border border-border shadow-sm">
                        {a.imageUrl && (
                          <img src={a.imageUrl} alt={a.titre} className="w-full h-[100px] object-cover block" />
                        )}
                        <div className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                          <p className="font-bold text-foreground text-[13px] mt-1.5 mb-1 leading-tight">{a.titre}</p>
                          <p className="text-slate-400 text-[11px]">
                            {new Date(a.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
