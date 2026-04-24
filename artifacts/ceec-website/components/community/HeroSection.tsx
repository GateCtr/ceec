import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface HeroAction {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}

interface HeroSectionProps {
  badge: string;
  title: string;
  description: string;
  actions?: HeroAction[];
  /** "tall" = minHeight 75vh (pages principales), "compact" = padding réduit (listes) */
  size?: "tall" | "compact";
}

export default function HeroSection({
  badge,
  title,
  description,
  actions,
  size = "tall",
}: HeroSectionProps) {
  const isTall = size === "tall";

  return (
    <section
      className="relative overflow-hidden text-white text-center"
      style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        ...(isTall
          ? { minHeight: "75vh", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "8rem 1rem 5rem" }
          : { padding: "7rem 1rem 4rem" }),
      }}
    >
      {/* Motif de fond */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Halo doré */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "25%",
          right: "20%",
          width: 500,
          height: 500,
          background: "var(--color-secondary)",
          opacity: 0.05,
          filter: "blur(120px)",
        }}
      />

      {/* Contenu */}
      <div className="relative max-w-[760px] mx-auto">
        <span
          className="inline-block text-xs font-bold tracking-[0.12em] uppercase mb-5 rounded-full px-4 py-1"
          style={{
            color: "var(--color-secondary)",
            background: "rgba(197,155,46,0.12)",
          }}
        >
          {badge}
        </span>

        <h1
          className="font-black leading-tight mb-4 text-white"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          {title}
        </h1>

        <p
          className="text-lg leading-relaxed mx-auto max-w-[580px]"
          style={{ opacity: 0.8 }}
        >
          {description}
        </p>

        {actions && actions.length > 0 && (
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            {actions.map((action) =>
              action.variant === "outline" ? (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-[15px] text-white transition-colors hover:bg-white/15"
                  style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}
                >
                  {action.label}
                </Link>
              ) : (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-bold text-[15px] transition-all hover:brightness-110"
                  style={{
                    background: "var(--color-secondary)",
                    color: "var(--color-primary)",
                  }}
                >
                  {action.label}
                  <ChevronRight size={16} />
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
