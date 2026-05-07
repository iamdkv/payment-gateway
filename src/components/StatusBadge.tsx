"use client";

import type { PaymentStatus } from "@/types/payment";

const STYLES: Record<PaymentStatus, string> = {
  idle: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  processing:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  timeout:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

const LABELS: Record<PaymentStatus, string> = {
  idle: "Idle",
  processing: "Processing",
  success: "Success",
  failed: "Failed",
  timeout: "Timed out",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
