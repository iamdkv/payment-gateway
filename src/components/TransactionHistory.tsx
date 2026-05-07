"use client";

import { useState } from "react";
import { useAppSelector } from "@/store";
import { CardBrandBadge } from "./CardBrandBadge";
import { StatusBadge } from "./StatusBadge";
import { TransactionDetails } from "./TransactionDetails";
import { formatCurrency, formatTimestamp } from "@/utils/format";
import type { Transaction } from "@/types/payment";

export function TransactionHistory() {
  const transactions = useAppSelector((s) => s.history.transactions);
  const hydrated = useAppSelector((s) => s.history.hydrated);
  const [selected, setSelected] = useState<Transaction | null>(null);

  if (!hydrated) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Transaction history
        </h2>
        <p className="text-sm text-zinc-500">Loading…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Transaction history
        </h2>
        <span className="text-xs text-zinc-500">
          {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No transactions yet. Your payment history will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {transactions.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelected(t)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-white dark:hover:bg-zinc-800/60 dark:focus:ring-offset-zinc-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CardBrandBadge type={t.cardType} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs text-zinc-500">
                      {t.id}
                    </div>
                    <div className="text-xs text-zinc-500">
                      •••• {t.cardLast4} · {formatTimestamp(t.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(t.amount, t.currency)}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <TransactionDetails
          transaction={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
