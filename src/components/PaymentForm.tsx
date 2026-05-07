"use client";

import { useId, useRef } from "react";
import type { Currency } from "@/types/payment";
import { useCardForm } from "@/hooks/useCardForm";
import { CardInput } from "./CardInput";
import { CardBrandBadge } from "./CardBrandBadge";
import { CardPreview } from "./CardPreview";
import { Field } from "./Field";
import { expectedCvvLength } from "@/utils/cardType";

interface Props {
  submitting: boolean;
  onSubmit: (values: ReturnType<typeof useCardForm>["values"]) => void;
}

export function PaymentForm({ submitting, onSubmit }: Props) {
  const form = useCardForm();
  const ids = {
    name: useId(),
    number: useId(),
    expiry: useId(),
    cvv: useId(),
    amount: useId(),
    currency: useId(),
  };
  const submitRef = useRef<HTMLButtonElement | null>(null);

  const cvvLen = expectedCvvLength(form.cardType);
  const disableSubmit = !form.valid || submitting;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errors = form.validateAll();
        const hasError = Object.values(errors).some(Boolean);
        if (hasError || submitting) return;
        onSubmit(form.values);
      }}
      className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)] lg:gap-8"
    >
      <div className="flex flex-col gap-4">
        <Field
          id={ids.name}
          label="Cardholder name"
          error={form.touched.cardholderName ? form.errors.cardholderName : undefined}
        >
          <CardInput
            id={ids.name}
            type="text"
            inputMode="text"
            autoComplete="cc-name"
            placeholder="Jane Doe"
            value={form.values.cardholderName}
            invalid={!!(form.touched.cardholderName && form.errors.cardholderName)}
            aria-describedby={
              form.touched.cardholderName && form.errors.cardholderName
                ? `${ids.name}-error`
                : undefined
            }
            onChange={(e) => form.setField("cardholderName", e.target.value)}
            onBlur={() => form.blurField("cardholderName")}
          />
        </Field>

        <Field
          id={ids.number}
          label="Card number"
          error={form.touched.cardNumber ? form.errors.cardNumber : undefined}
        >
          <CardInput
            id={ids.number}
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={form.values.cardNumber}
            invalid={!!(form.touched.cardNumber && form.errors.cardNumber)}
            aria-describedby={
              form.touched.cardNumber && form.errors.cardNumber
                ? `${ids.number}-error`
                : undefined
            }
            trailing={
              form.cardType !== "unknown" ? (
                <CardBrandBadge type={form.cardType} size="sm" />
              ) : null
            }
            onChange={(e) => form.setField("cardNumber", e.target.value)}
            onBlur={() => form.blurField("cardNumber")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            id={ids.expiry}
            label="Expiry"
            hint="MM/YY"
            error={form.touched.expiry ? form.errors.expiry : undefined}
          >
            <CardInput
              id={ids.expiry}
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={form.values.expiry}
              invalid={!!(form.touched.expiry && form.errors.expiry)}
              aria-describedby={
                form.touched.expiry && form.errors.expiry
                  ? `${ids.expiry}-error`
                  : `${ids.expiry}-hint`
              }
              onChange={(e) => form.setField("expiry", e.target.value)}
              onBlur={() => form.blurField("expiry")}
            />
          </Field>

          <Field
            id={ids.cvv}
            label="CVV"
            hint={`${cvvLen} digits`}
            error={form.touched.cvv ? form.errors.cvv : undefined}
          >
            <CardInput
              id={ids.cvv}
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={cvvLen === 4 ? "••••" : "•••"}
              value={form.values.cvv}
              maxLength={cvvLen}
              invalid={!!(form.touched.cvv && form.errors.cvv)}
              aria-describedby={
                form.touched.cvv && form.errors.cvv
                  ? `${ids.cvv}-error`
                  : `${ids.cvv}-hint`
              }
              onChange={(e) => form.setField("cvv", e.target.value)}
              onBlur={() => form.blurField("cvv")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4">
          <Field
            id={ids.amount}
            label="Amount"
            error={form.touched.amount ? form.errors.amount : undefined}
          >
            <CardInput
              id={ids.amount}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={form.values.amount}
              invalid={!!(form.touched.amount && form.errors.amount)}
              aria-describedby={
                form.touched.amount && form.errors.amount
                  ? `${ids.amount}-error`
                  : undefined
              }
              onChange={(e) => form.setField("amount", e.target.value)}
              onBlur={() => form.blurField("amount")}
            />
          </Field>

          <Field id={ids.currency} label="Currency">
            <select
              id={ids.currency}
              value={form.values.currency}
              onChange={(e) => form.setField("currency", e.target.value as Currency)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-800"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>

        <button
          ref={submitRef}
          type="submit"
          disabled={disableSubmit}
          aria-busy={submitting || undefined}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          {submitting ? "Processing…" : "Pay now"}
        </button>
      </div>

      <div className="order-first flex flex-col items-center gap-3 lg:order-none lg:items-end">
        <CardPreview
          cardNumber={form.values.cardNumber}
          cardholderName={form.values.cardholderName}
          expiry={form.values.expiry}
          cardType={form.cardType}
        />
        <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
          This is a simulated gateway. No real payment is processed and your
          card details never leave the demo.
        </p>
      </div>
    </form>
  );
}
