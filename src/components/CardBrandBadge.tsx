"use client";

import type { CardType } from "@/types/payment";
import { cardTypeLabel } from "@/utils/cardType";

interface Props {
  type: CardType;
  size?: "sm" | "md";
}

const STYLES: Record<CardType, string> = {
  visa: "bg-blue-600 text-white",
  mastercard: "bg-orange-500 text-white",
  amex: "bg-sky-700 text-white",
  unknown: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
};

export function CardBrandBadge({ type, size = "md" }: Props) {
  const label = cardTypeLabel(type);
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      aria-label={`Card type: ${label}`}
      className={`inline-flex items-center rounded-md font-semibold uppercase tracking-wide ${padding} ${STYLES[type]}`}
    >
      {label}
    </span>
  );
}
