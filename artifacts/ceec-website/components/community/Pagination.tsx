import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  /** Fonction qui retourne le href pour une page donnée */
  buildHref: (page: number) => string;
  /** Nom de l'entité au singulier, ex: "annonce", "événement" */
  itemName: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  total,
  buildHref,
  itemName,
}: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-center text-sm mt-5" style={{ color: "#94a3b8" }}>
        {total} {itemName}{total > 1 ? "s" : ""}
      </p>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex justify-center gap-2 flex-wrap">
        {currentPage > 1 && (
          <Link
            href={buildHref(currentPage - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-sm font-medium transition-colors hover:bg-primary-50"
            style={{ border: "1px solid var(--color-border)", color: "#334155" }}
          >
            <ChevronLeft size={14} /> Précédent
          </Link>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: p === currentPage ? "var(--color-primary)" : "white",
              border: "1px solid var(--color-border)",
              color: p === currentPage ? "white" : "#334155",
              fontWeight: p === currentPage ? 700 : 400,
            }}
          >
            {p}
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link
            href={buildHref(currentPage + 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-sm font-medium transition-colors hover:bg-primary-50"
            style={{ border: "1px solid var(--color-border)", color: "#334155" }}
          >
            Suivant <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <p className="text-center text-sm mt-5" style={{ color: "#94a3b8" }}>
        {total} {itemName}{total > 1 ? "s" : ""} au total
      </p>
    </div>
  );
}
