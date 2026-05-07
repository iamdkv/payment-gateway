"use client";

import { useEffect, useRef } from "react";
import type { PaymentStatus } from "@/types/payment";
import { MAX_ATTEMPTS } from "@/store/paymentSlice";

interface Props {
  status: PaymentStatus;
  attempts: number;
  errorMessage: string | null;
  gatewayRef: string | null;
  amountLabel: string;
  cardLabel: string;
  onRetry: () => void;
  onNewPayment: () => void;
}

const TITLES: Record<Exclude<PaymentStatus, "idle">, string> = {
  processing: "Processing payment",
  success: "Payment successful",
  failed: "Payment failed",
  timeout: "Payment timed out",
};

export function StatusScreen({
  status,
  attempts,
  errorMessage,
  gatewayRef,
  amountLabel,
  cardLabel,
  onRetry,
  onNewPayment,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Move focus to the result heading when status becomes terminal so screen
  // reader users hear the outcome.
  useEffect(() => {
    if (status === "success" || status === "failed" || status === "timeout") {
      headingRef.current?.focus();
    }
  }, [status]);

  if (status === "idle") return null;

  const isTerminalFailure = status === "failed" || status === "timeout";
  const canRetry = isTerminalFailure && attempts < MAX_ATTEMPTS;
  const title = TITLES[status];

  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <StatusIcon status={status} />
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-semibold text-zinc-900 outline-none dark:text-zinc-100"
      >
        {title}
      </h2>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        <div>{amountLabel}</div>
        <div className="text-xs text-zinc-500">{cardLabel}</div>
      </div>

      {status === "processing" && (
        <p className="text-sm text-zinc-500">
          Please wait — do not close this window.
        </p>
      )}

      {status === "success" && gatewayRef && (
        <p className="text-xs text-zinc-500">
          Reference: <span className="font-mono">{gatewayRef}</span>
        </p>
      )}

      {isTerminalFailure && (
        <>
          {errorMessage && (
            <p className="max-w-sm text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}
          <p className="text-xs text-zinc-500">
            Attempt {Math.min(attempts, MAX_ATTEMPTS)} of {MAX_ATTEMPTS}
          </p>
        </>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {canRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Retry payment
          </button>
        )}
        {isTerminalFailure && !canRetry && (
          <p className="text-xs text-zinc-500">
            Maximum retry attempts reached. Please start a new payment.
          </p>
        )}
        {(status === "success" || isTerminalFailure) && (
          <button
            type="button"
            onClick={onNewPayment}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Start new payment
          </button>
        )}
      </div>
    </section>
  );
}

function StatusIcon({ status }: { status: PaymentStatus }) {
  if (status === "processing") {
    return (
      <div
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
      />
    );
  }
  if (status === "success") {
    return (
      <div
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
          <path
            fillRule="evenodd"
            d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8.5 12.086l6.79-6.79a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
  // failed or timeout
  return (
    <div
      aria-hidden
      className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 102 0V7a1 1 0 10-2 0v6zm1 3a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
