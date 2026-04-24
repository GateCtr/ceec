interface SectionTitleProps {
  children: React.ReactNode;
  light?: boolean;
}

export default function SectionTitle({ children, light = false }: SectionTitleProps) {
  return (
    <h2
      className="text-3xl md:text-4xl font-bold mb-4 font-display"
      style={{ color: light ? "#ffffff" : "var(--color-primary)" }}
    >
      {children}
    </h2>
  );
}
