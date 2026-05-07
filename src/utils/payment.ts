import type { GatewayOutcome, PaymentPayload } from "@/types/payment";

export const REQUEST_TIMEOUT_MS = 6000;

export class PaymentTimeoutError extends Error {
  constructor() {
    super("Payment request timed out");
    this.name = "PaymentTimeoutError";
  }
}

export class PaymentNetworkError extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "PaymentNetworkError";
  }
}

export async function postPayment(
  payload: PaymentPayload,
  signal: AbortSignal,
): Promise<GatewayOutcome> {
  let response: Response;
  try {
    response = await fetch("/api/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": payload.transactionId,
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new PaymentTimeoutError();
    }
    throw new PaymentNetworkError();
  }

  if (!response.ok) {
    throw new PaymentNetworkError(`Gateway returned ${response.status}`);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!isGatewayOutcome(data)) {
    throw new PaymentNetworkError("Invalid response from gateway");
  }
  return data;
}

function isGatewayOutcome(value: unknown): value is GatewayOutcome {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.transactionId !== "string") return false;
  if (v.status === "success") return typeof v.gatewayRef === "string";
  if (v.status === "failed") return typeof v.reason === "string";
  return false;
}
