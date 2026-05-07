"use client";

import { useCallback, useRef, useState } from "react";
import type { CardFormValues } from "@/types/payment";
import { usePayment } from "@/hooks/usePayment";
import { formatCurrency, maskCardNumber } from "@/utils/format";
import { detectCardType } from "@/utils/cardType";
import { PaymentForm } from "./PaymentForm";
import { StatusScreen } from "./StatusScreen";
import { TransactionHistory } from "./TransactionHistory";

function newTransactionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (very unlikely on modern browsers).
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function PaymentGateway() {
  const { payment, submit, reset } = usePayment();
  // Persist the form values for the current transaction so retry uses them.
  const [pendingValues, setPendingValues] = useState<CardFormValues | null>(null);
  // Force-remount the form (and clear its state) when starting a new payment.
  const [formKey, setFormKey] = useState(0);
  const transactionIdRef = useRef<string | null>(null);

  const handleSubmit = useCallback(
    (values: CardFormValues) => {
      const id = newTransactionId();
      transactionIdRef.current = id;
      setPendingValues(values);
      void submit({ values, transactionId: id });
    },
    [submit],
  );

  const handleRetry = useCallback(() => {
    if (!pendingValues || !transactionIdRef.current) return;
    void submit({
      values: pendingValues,
      transactionId: transactionIdRef.current,
    });
  }, [pendingValues, submit]);

  const handleNewPayment = useCallback(() => {
    transactionIdRef.current = null;
    setPendingValues(null);
    setFormKey((k) => k + 1);
    reset();
  }, [reset]);

  const showStatus = payment.status !== "idle";
  const amountLabel = pendingValues
    ? formatCurrency(Number(pendingValues.amount), pendingValues.currency)
    : "";
  const cardLabel = pendingValues
    ? `${cardLabelFor(pendingValues)} · ${maskCardNumber(pendingValues.cardNumber)}`
    : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        {showStatus ? (
          <StatusScreen
            status={payment.status}
            attempts={payment.attempts}
            errorMessage={payment.errorMessage}
            gatewayRef={payment.gatewayRef}
            amountLabel={amountLabel}
            cardLabel={cardLabel}
            onRetry={handleRetry}
            onNewPayment={handleNewPayment}
          />
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Make a payment
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Enter your card details to complete a simulated payment.
              </p>
            </header>
            <PaymentForm
              key={formKey}
              submitting={payment.status === "processing"}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>

      <TransactionHistory />
    </div>
  );
}

function cardLabelFor(values: CardFormValues): string {
  const type = detectCardType(values.cardNumber);
  switch (type) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "Amex";
    default:
      return "Card";
  }
}
