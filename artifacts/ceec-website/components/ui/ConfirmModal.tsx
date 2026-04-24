"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, loading, onClose]);

  // Bloquer le scroll du body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  const iconMap = {
    danger: <Trash2 size={22} />,
    warning: <AlertTriangle size={22} />,
    default: <AlertTriangle size={22} />,
  };

  const iconBgMap = {
    danger: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600",
    default: "bg-primary-100 text-primary",
  };

  const btnMap = {
    danger: "btn-danger",
    warning: "btn-secondary",
    default: "btn-primary",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current && !loading) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-[420px] w-full animate-slide-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="p-6 pt-8 text-center">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBgMap[variant]}`}>
            {iconMap[variant]}
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn ${btnMap[variant]} flex-1`}
          >
            {loading ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
