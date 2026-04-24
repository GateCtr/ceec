"use client";

import { useState, useCallback } from "react";
import ConfirmModal from "./ConfirmModal";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

/**
 * Hook pour afficher un modal de confirmation.
 *
 * Usage :
 * ```tsx
 * const [ConfirmDialog, confirm] = useConfirm();
 *
 * async function handleDelete(id: number) {
 *   const ok = await confirm({
 *     title: "Supprimer cette annonce ?",
 *     description: "Cette action est irréversible.",
 *     confirmLabel: "Supprimer",
 *     variant: "danger",
 *   });
 *   if (!ok) return;
 *   // ... delete logic
 * }
 *
 * return (
 *   <>
 *     <ConfirmDialog />
 *     {/* rest of UI *\/}
 *   </>
 * );
 * ```
 */
export function useConfirm(): [() => React.ReactNode, (options: ConfirmOptions) => Promise<boolean>] {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: "" },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.resolve]);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.resolve]);

  const Dialog = useCallback(() => (
    <ConfirmModal
      open={state.open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={state.options.title}
      description={state.options.description}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      variant={state.options.variant}
    />
  ), [state.open, state.options, handleClose, handleConfirm]);

  return [Dialog, confirm];
}
