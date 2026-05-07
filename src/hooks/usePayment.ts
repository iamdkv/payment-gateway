"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  paymentFailed,
  paymentReset,
  paymentStarted,
  paymentSucceeded,
  paymentTimedOut,
} from "@/store/paymentSlice";
import { transactionUpserted } from "@/store/historySlice";
import { useAppDispatch, useAppSelector } from "@/store";
import type {
  CardFormValues,
  PaymentPayload,
  Transaction,
} from "@/types/payment";
import { detectCardType } from "@/utils/cardType";
import { getLast4 } from "@/utils/format";
import {
  PaymentNetworkError,
  PaymentTimeoutError,
  REQUEST_TIMEOUT_MS,
  postPayment,
} from "@/utils/payment";

interface SubmitArgs {
  values: CardFormValues;
  transactionId: string;
}

export function usePayment() {
  const dispatch = useAppDispatch();
  const payment = useAppSelector((s) => s.payment);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const submit = useCallback(
    async ({ values, transactionId }: SubmitArgs) => {
      // Guard against double submissions.
      if (payment.status === "processing") return;

      const cardType = detectCardType(values.cardNumber);
      const last4 = getLast4(values.cardNumber);
      const amount = Number(values.amount);
      const now = new Date().toISOString();

      const isRetry = payment.currentTransactionId === transactionId;
      const nextAttempts = isRetry ? payment.attempts + 1 : 1;

      dispatch(paymentStarted({ transactionId }));

      // Optimistically write a "processing" record to history (or update one).
      const baseRecord: Transaction = {
        id: transactionId,
        amount,
        currency: values.currency,
        status: "processing",
        cardLast4: last4,
        cardType,
        cardholderName: values.cardholderName.trim(),
        createdAt: isRetry ? findCreatedAt(transactionId) ?? now : now,
        updatedAt: now,
        attempts: nextAttempts,
      };
      dispatch(transactionUpserted(baseRecord));

      const payload: PaymentPayload = {
        transactionId,
        cardholderName: values.cardholderName.trim(),
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        expiry: values.expiry,
        cvv: values.cvv,
        amount,
        currency: values.currency,
      };

      const controller = new AbortController();
      abortRef.current = controller;
      timeoutRef.current = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      try {
        const outcome = await postPayment(payload, controller.signal);
        if (outcome.status === "success") {
          dispatch(paymentSucceeded({ gatewayRef: outcome.gatewayRef }));
          dispatch(
            transactionUpserted({
              ...baseRecord,
              status: "success",
              gatewayRef: outcome.gatewayRef,
              updatedAt: new Date().toISOString(),
            }),
          );
        } else {
          dispatch(paymentFailed({ reason: outcome.reason }));
          dispatch(
            transactionUpserted({
              ...baseRecord,
              status: "failed",
              reason: outcome.reason,
              updatedAt: new Date().toISOString(),
            }),
          );
        }
      } catch (err) {
        if (err instanceof PaymentTimeoutError) {
          dispatch(paymentTimedOut());
          dispatch(
            transactionUpserted({
              ...baseRecord,
              status: "timeout",
              reason: "Request timed out",
              updatedAt: new Date().toISOString(),
            }),
          );
        } else if (err instanceof PaymentNetworkError) {
          dispatch(paymentFailed({ reason: "Network error. Please try again." }));
          dispatch(
            transactionUpserted({
              ...baseRecord,
              status: "failed",
              reason: "Network error",
              updatedAt: new Date().toISOString(),
            }),
          );
        } else {
          dispatch(paymentFailed({ reason: "Something went wrong." }));
          dispatch(
            transactionUpserted({
              ...baseRecord,
              status: "failed",
              reason: "Unknown error",
              updatedAt: new Date().toISOString(),
            }),
          );
        }
      } finally {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        abortRef.current = null;
      }
    },
    [dispatch, payment.attempts, payment.currentTransactionId, payment.status],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    dispatch(paymentReset());
  }, [dispatch]);

  return { payment, submit, reset };
}

// Helper to keep `createdAt` consistent across retries. Reads from the
// current store snapshot synchronously via a small dynamic lookup to avoid
// circular imports.
function findCreatedAt(id: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("payment-gateway:transactions");
    if (!raw) return undefined;
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return undefined;
    const found = (list as Transaction[]).find((t) => t.id === id);
    return found?.createdAt;
  } catch {
    return undefined;
  }
}
