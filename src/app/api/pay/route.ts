import { NextResponse } from "next/server";
import type { GatewayOutcome } from "@/types/payment";

export const dynamic = "force-dynamic";

const FAILURE_REASONS = [
  "Insufficient funds",
  "Card declined by issuer",
  "Suspected fraud — please contact your bank",
  "Card limit exceeded",
];

const TIMEOUT_DELAY_MS = 8000;
const PROCESSING_DELAY_MS = 1500;

interface IncomingPayload {
  transactionId?: unknown;
  amount?: unknown;
  currency?: unknown;
  cardNumber?: unknown;
}

function isValidPayload(value: unknown): value is {
  transactionId: string;
  amount: number;
  currency: string;
  cardNumber: string;
} {
  if (!value || typeof value !== "object") return false;
  const v = value as IncomingPayload;
  return (
    typeof v.transactionId === "string" &&
    v.transactionId.length > 0 &&
    typeof v.amount === "number" &&
    typeof v.currency === "string" &&
    typeof v.cardNumber === "string"
  );
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 },
    );
  }

  const roll = Math.random();
  // 60% success, 25% failed, 15% timeout (8s)
  let outcomeKind: "success" | "failed" | "timeout";
  if (roll < 0.6) outcomeKind = "success";
  else if (roll < 0.85) outcomeKind = "failed";
  else outcomeKind = "timeout";

  try {
    if (outcomeKind === "timeout") {
      await sleep(TIMEOUT_DELAY_MS, request.signal);
    } else {
      await sleep(PROCESSING_DELAY_MS, request.signal);
    }
  } catch {
    // Client aborted — return a 499-like response. Browser usually won't
    // see this, but we keep it tidy for any server-side caller.
    return new NextResponse(null, { status: 499 });
  }

  if (outcomeKind === "failed") {
    const reason =
      FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    const result: GatewayOutcome = {
      status: "failed",
      transactionId: body.transactionId,
      reason,
    };
    return NextResponse.json(result);
  }

  // Both "success" and "timeout" branches that didn't abort end as success.
  // (A real timeout would have returned 499 above; if the client didn't
  //  abort within 6s, the 8s delay still completes successfully here.)
  const result: GatewayOutcome = {
    status: "success",
    transactionId: body.transactionId,
    gatewayRef: `GW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  };
  return NextResponse.json(result);
}
