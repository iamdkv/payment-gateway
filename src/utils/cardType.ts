import type { CardType } from "@/types/payment";

export function detectCardType(cardNumber: string): CardType {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits) return "unknown";
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (
    /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)
  ) {
    return "mastercard";
  }
  return "unknown";
}

export function cardTypeLabel(type: CardType): string {
  switch (type) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "American Express";
    default:
      return "Card";
  }
}

export function expectedCvvLength(type: CardType): 3 | 4 {
  return type === "amex" ? 4 : 3;
}

export function expectedCardLength(type: CardType): number {
  return type === "amex" ? 15 : 16;
}
