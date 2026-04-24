import Link from "next/link";

interface CategoryFilterProps {
  categories: string[];
  currentCategory: string | undefined;
  /** Label pour le bouton "Tous/Toutes" */
  allLabel?: string;
  /** Fonction qui retourne le href pour une catégorie donnée (undefined = toutes) */
  buildHref: (category: string | undefined) => string;
}

export default function CategoryFilter({
  categories,
  currentCategory,
  allLabel = "Tous",
  buildHref,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-7">
      <Link
        href={buildHref(undefined)}
        className="px-3.5 py-1 rounded-full text-[13px] font-semibold transition-colors"
        style={{
          background: !currentCategory ? "var(--color-primary)" : "var(--color-border)",
          color: !currentCategory ? "white" : "#475569",
        }}
      >
        {allLabel}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={buildHref(cat)}
          className="px-3.5 py-1 rounded-full text-[13px] font-semibold transition-colors"
          style={{
            background: currentCategory === cat ? "var(--color-primary)" : "var(--color-border)",
            color: currentCategory === cat ? "white" : "#475569",
          }}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}
