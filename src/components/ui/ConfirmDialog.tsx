"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-400",
      iconBg: "bg-red-900/20 border border-red-900/40",
      confirmBtn:
        "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500/50",
    },
    warning: {
      icon: "text-amber-400",
      iconBg: "bg-amber-900/20 border border-amber-900/40",
      confirmBtn:
        "bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500/50",
    },
    info: {
      icon: "text-[#a4c2b5]",
      iconBg: "bg-[#a4c2b5]/10 border border-[#a4c2b5]/20",
      confirmBtn:
        "bg-[#a4c2b5] hover:bg-[#8eb0a2] text-neutral-900 focus:ring-[#a4c2b5]/50",
    },
  };

  const styles = variantStyles[variant];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-700/60 bg-[#1e1e1e] shadow-2xl animate-in zoom-in-95 fade-in duration-150">
        {/* Top accent line */}
        <div
          className={`h-0.5 w-full rounded-t-2xl ${
            variant === "danger"
              ? "bg-red-600"
              : variant === "warning"
                ? "bg-amber-500"
                : "bg-[#a4c2b5]"
          }`}
        />

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${styles.iconBg}`}
            >
              <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
            </div>
            <div className="pt-0.5">
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold text-neutral-100 leading-tight"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              autoFocus
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 transition-colors ${styles.confirmBtn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
