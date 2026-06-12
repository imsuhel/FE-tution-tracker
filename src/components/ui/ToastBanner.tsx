"use client";

import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

type ToastVariant = "error" | "success" | "info" | "warning";

interface ToastBannerProps {
  message: string | null;
  variant?: ToastVariant;
  onClose: () => void;
}

const STYLES: Record<ToastVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  error: {
    bg: "bg-red-950/90",
    border: "border-red-800/60",
    text: "text-red-300",
    icon: <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />,
  },
  success: {
    bg: "bg-emerald-950/90",
    border: "border-emerald-800/60",
    text: "text-emerald-300",
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />,
  },
  info: {
    bg: "bg-neutral-900/90",
    border: "border-neutral-700/60",
    text: "text-neutral-300",
    icon: <Info className="h-4 w-4 shrink-0 text-neutral-400" />,
  },
  warning: {
    bg: "bg-amber-950/90",
    border: "border-amber-800/60",
    text: "text-amber-300",
    icon: <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />,
  },
};

export function ToastBanner({ message, variant = "error", onClose }: ToastBannerProps) {
  if (!message) return null;
  const s = STYLES[variant];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 ${s.bg} border ${s.border} ${s.text} text-sm rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300`}
    >
      {s.icon}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
