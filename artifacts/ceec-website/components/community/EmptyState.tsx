import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-6 bg-white rounded-2xl" style={{ border: "1px dashed var(--color-border)" }}>
      <div className="flex justify-center mb-4 text-primary">{icon}</div>
      <h3 className="font-bold mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
