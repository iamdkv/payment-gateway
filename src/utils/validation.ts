import type {
  CardFormErrors,
  CardFormValues,
  CardType,
} from "@/types/payment";
import { detectCardType, expectedCardLength, expectedCvvLength } from "./cardType";

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateCardholderName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Cardholder name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (!/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(trimmed)) {
    return "Name can only contain letters, spaces, . ' -";
  }
  return undefined;
}

export function validateCardNumber(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Card number is required";
  const type: CardType = detectCardType(digits);
  if (type === "unknown") {
    return "Only Visa, Mastercard, and Amex are supported";
  }
  const expected = expectedCardLength(type);
  if (digits.length < expected) {
    return `Card number must be ${expected} digits`;
  }
  if (!luhnCheck(digits)) return "Card number is invalid";
  return undefined;
}

export function validateExpiry(value: string): string | undefined {
  if (!value) return "Expiry is required";
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return "Format must be MM/YY";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Invalid month";

  const now = new Date();
  // Last day of expiry month, end of day.
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
  if (expiryDate.getTime() < now.getTime()) {
    return "Card has expired";
  }
  return undefined;
}

export function validateCvv(value: string, cardNumber: string): string | undefined {
  const type = detectCardType(cardNumber);
  const expected = expectedCvvLength(type);
  if (!value) return "CVV is required";
  if (!/^\d+$/.test(value)) return "CVV must be digits only";
  if (value.length !== expected) return `CVV must be ${expected} digits`;
  return undefined;
}

export function validateAmount(value: string): string | undefined {
  if (!value) return "Amount is required";
  const num = Number(value);
  if (Number.isNaN(num)) return "Amount must be a number";
  if (num <= 0) return "Amount must be greater than 0";
  if (num > 1_000_000) return "Amount is too large";
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return "Amount can have at most 2 decimal places";
  }
  return undefined;
}

export function validateForm(values: CardFormValues): CardFormErrors {
  return {
    cardholderName: validateCardholderName(values.cardholderName),
    cardNumber: validateCardNumber(values.cardNumber),
    expiry: validateExpiry(values.expiry),
    cvv: validateCvv(values.cvv, values.cardNumber),
    amount: validateAmount(values.amount),
  };
}

export function isFormValid(errors: CardFormErrors): boolean {
  return Object.values(errors).every((e) => !e);
}
