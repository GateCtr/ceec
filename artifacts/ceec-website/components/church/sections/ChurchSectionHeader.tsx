interface ChurchSectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

export default function ChurchSectionHeader({
  badge,
  title,
  description,
  align = "center",
}: ChurchSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={`mb-10 ${isCenter ? "text-center" : ""}`}>
      {badge && (
        <span
          className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-full px-4 py-1 mb-3"
          style={{
            color: "var(--church-accent, #c59b2e)",
            background: "color-mix(in srgb, var(--church-accent, #c59b2e) 12%, transparent)",
          }}
        >
          {badge}
        </span>
      )}
      <h2
        className="font-extrabold text-[clamp(1.5rem,3vw,2rem)] m-0 leading-tight"
        style={{ color: "var(--church-primary, #1e3a8a)" }}
      >
        {title}
      </h2>
      {description && (
        <p className={`text-muted-foreground text-[15px] leading-relaxed mt-3 ${isCenter ? "max-w-[580px] mx-auto" : "max-w-[580px]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
