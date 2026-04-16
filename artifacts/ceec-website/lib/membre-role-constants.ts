export const CHURCH_ROLE_PRIORITY = [
  "admin_eglise",
  "pasteur",
  "diacre",
  "tresorier",
  "secretaire",
  "fidele",
];

export const CHURCH_ROLE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  admin_eglise: { label: "Admin église",  bg: "#dcfce7", color: "#15803d" },
  pasteur:      { label: "Pasteur",       bg: "#ede9fe", color: "#6d28d9" },
  diacre:       { label: "Diacre",        bg: "#fef9c3", color: "#a16207" },
  tresorier:    { label: "Trésorier",     bg: "#ffedd5", color: "#c2410c" },
  secretaire:   { label: "Secrétaire",    bg: "#e0f2fe", color: "#0369a1" },
  fidele:       { label: "Fidèle",        bg: "#e0e7ff", color: "#3730a3" },
};
