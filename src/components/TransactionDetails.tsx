"use client";

import { useEffect, useRef } from "react";
import type { Transaction } from "@/types/payment";
import { CardBrandBadge } from "./CardBrandBadge";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatTimestamp } from "@/utils/format";

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetails({ transaction, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-details-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3
              id="transaction-details-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Transaction details
            </h3>
            <p className="text-xs text-zinc-500">
              {formatTimestamp(transaction.createdAt)}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-zinc-500">Status</dt>
          <dd>
            <StatusBadge status={transaction.status} />
          </dd>

          <dt className="text-zinc-500">Transaction ID</dt>
          <dd className="break-all font-mono text-xs text-zinc-800 dark:text-zinc-200">
            {transaction.id}
          </dd>

          <dt className="text-zinc-500">Amount</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {formatCurrency(transaction.amount, transaction.currency)}
          </dd>

          <dt className="text-zinc-500">Card</dt>
          <dd className="flex items-center gap-2">
            <CardBrandBadge type={transaction.cardType} size="sm" />
            <span className="font-mono text-xs">
              •••• {transaction.cardLast4}
            </span>
          </dd>

          <dt className="text-zinc-500">Cardholder</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {transaction.cardholderName}
          </dd>

          <dt className="text-zinc-500">Attempts</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {transaction.attempts}
          </dd>

          {transaction.gatewayRef && (
            <>
              <dt className="text-zinc-500">Gateway ref</dt>
              <dd className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
                {transaction.gatewayRef}
              </dd>
            </>
          )}

          {transaction.reason && (
            <>
              <dt className="text-zinc-500">Reason</dt>
              <dd className="text-red-600 dark:text-red-400">
                {transaction.reason}
              </dd>
            </>
          )}

          <dt className="text-zinc-500">Last updated</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {formatTimestamp(transaction.updatedAt)}
          </dd>
        </dl>
      </div>
    </div>
  );
}
