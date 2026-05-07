import type { Transaction } from "@/types/payment";

const KEY = "payment-gateway:transactions";

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTransaction);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(transactions));
  } catch {
    // Quota exceeded or storage unavailable — ignore silently.
  }
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.amount === "number" &&
    typeof v.status === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.updatedAt === "string"
  );
}
