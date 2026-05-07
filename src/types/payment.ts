export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type Currency = "INR" | "USD";

export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export type GatewayOutcome =
  | { status: "success"; transactionId: string; gatewayRef: string }
  | { status: "failed"; transactionId: string; reason: string };

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  cardLast4: string;
  cardType: CardType;
  cardholderName: string;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  reason?: string;
  gatewayRef?: string;
}

export interface CardFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export type CardFormErrors = Partial<Record<keyof CardFormValues, string>>;
