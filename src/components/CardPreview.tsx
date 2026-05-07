"use client";

import type { CardType } from "@/types/payment";
import { CardBrandBadge } from "./CardBrandBadge";

interface Props {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cardType: CardType;
}

function formatNumberForDisplay(value: string, type: CardType): string {
  const digits = value.replace(/\D/g, "");
  const totalLength = type === "amex" ? 15 : 16;
  const pad = "•".repeat(Math.max(0, totalLength - digits.length));
  const all = digits + pad;
  if (type === "amex") {
    return `${all.slice(0, 4)} ${all.slice(4, 10)} ${all.slice(10, 15)}`;
  }
  return `${all.slice(0, 4)} ${all.slice(4, 8)} ${all.slice(8, 12)} ${all.slice(12, 16)}`;
}

export function CardPreview({
  cardNumber,
  cardholderName,
  expiry,
  cardType,
}: Props) {
  const displayNumber = formatNumberForDisplay(cardNumber, cardType);
  const displayName = cardholderName.trim() || "CARDHOLDER NAME";
  const displayExpiry = expiry || "MM/YY";

  return (
    <div
      aria-label="Card preview"
      className="relative w-full max-w-sm aspect-[1.6/1] rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 text-white shadow-xl overflow-hidden"
    >
      <div
        className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/60">
              Payment card
            </span>
            <span className="mt-1 text-sm font-medium">Secure Pay</span>
          </div>
          <CardBrandBadge type={cardType} />
        </div>

        <div className="space-y-3">
          <div
            className="font-mono text-lg sm:text-xl tracking-wider"
            aria-label="Card number"
          >
            {displayNumber}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-widest text-white/60">
                Cardholder
              </span>
              <span
                className="block truncate text-sm font-medium uppercase"
                aria-label="Cardholder name"
              >
                {displayName}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-widest text-white/60">
                Expires
              </span>
              <span
                className="block font-mono text-sm font-medium"
                aria-label="Expiry"
              >
                {displayExpiry}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
