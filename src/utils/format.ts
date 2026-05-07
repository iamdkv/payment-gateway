import type { CardType, Currency } from "@/types/payment";
import { expectedCardLength } from "./cardType";

export function formatCardNumber(input: string, type: CardType): string {
  const digits = input.replace(/\D/g, "").slice(0, expectedCardLength(type));
  if (type === "amex") {
    // Amex pattern: 4-6-5
    const a = digits.slice(0, 4);
    const b = digits.slice(4, 10);
    const c = digits.slice(10, 15);
    return [a, b, c].filter(Boolean).join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(input: string, type: CardType): string {
  const max = type === "amex" ? 4 : 3;
  return input.replace(/\D/g, "").slice(0, max);
}

export function formatAmountInput(input: string): string {
  // Allow only digits and a single decimal with up to 2 places.
  const cleaned = input.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}

export function getLast4(cardNumber: string): string {
  return cardNumber.replace(/\D/g, "").slice(-4);
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
