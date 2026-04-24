interface SectionLabelProps {
  label: string;
}

export default function SectionLabel({ label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 justify-center mb-4">
      <div className="h-px w-10 bg-secondary" />
      <span className="text-xs font-bold uppercase tracking-widest text-secondary">
        {label}
      </span>
      <div className="h-px w-10 bg-secondary" />
    </div>
  );
}
