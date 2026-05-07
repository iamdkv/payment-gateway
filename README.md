# Secure Pay — Payment Gateway Demo

A simulated payment gateway UI built with **Next.js 16 (App Router)**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS v4**. The full payment lifecycle is implemented — including timeout handling via `AbortController`, idempotent retries, and a persisted transaction history — without any third-party payment SDK.

## Getting started

```bash
# install
npm install

# start dev server
npm run dev
# → http://localhost:3000

# production build
npm run build
npm start

# lint & type check
npm run lint
npx tsc --noEmit
```

Tested with Node 20+, npm 10+.

## Features

### Payment form
- Real-time per-field validation (errors appear on blur or while typing on touched fields)
- Submit button disabled until the form is fully valid
- Card number auto-formats with spaces (4-4-4-4 for Visa/Mastercard, 4-6-5 for Amex)
- Card brand detection (Visa, Mastercard, Amex) with brand badge
- Luhn checksum validation
- Expiry rejects past dates
- CVV is 3 digits (4 for Amex)
- Currency selector: INR or USD

### Live card preview
- Card number, cardholder name, and expiry update as the user types
- Brand badge updates with detection
- Mobile-friendly card layout

### Payment lifecycle
States: `idle → processing → (success | failed | timeout)`. Each state has a distinct screen.

### Mock gateway (`/api/pay`)
Server-side randomization:
- ~60% success
- ~25% failure with a reason string (`Insufficient funds`, etc.)
- ~15% slow response (8s) — the client aborts at 6s via `AbortController`

Processing for the success/failed paths is delayed ~1.5s so the "Processing" UI is visible.

### Failure & retry
- Up to **3 attempts per transaction** (each retry reuses the same transaction ID)
- Current attempt count is shown to the user
- After the max is reached, retry is disabled and a final-failure message is shown
- The user can always start a brand-new payment

### Transaction history
- Persisted in `localStorage` and hydrated on load
- Shows ID, amount + currency, status badge, card brand, last 4 digits, and timestamp
- Click any row to open a details modal (closes via Esc, backdrop click, or close button)
- Retries do **not** create duplicate entries — same ID is upserted

### Idempotency
- A unique `transactionId` is generated on the client with `crypto.randomUUID()` before the first attempt
- The same ID is reused for every retry of that payment
- The ID is sent both in the request body and as an `Idempotency-Key` header

### Error handling
- Network errors and gateway-returned failures are handled separately
- Raw errors are never shown to the user — friendly messages only
- Timeouts cancel the in-flight request cleanly via `AbortController`
- Unmounting the page also aborts any in-flight request

### Accessibility & responsiveness
- All inputs have visible labels
- Errors are linked to their inputs via `aria-describedby`
- Focus moves to the result heading after a payment outcome (so screen readers announce it and keyboard users don't lose place)
- The details modal traps Esc and is `aria-modal`
- Layout works at 375px (mobile) and 1280px+ (desktop)

### Real-world UX touches
- Submit button shows `aria-busy` and is disabled during processing (prevents double submission)
- The submit handler also guards against double submits at the hook level
- "Start new payment" remounts the form to fully clear sensitive state (CVV etc.)

## Project structure

```
src/
├── app/
│   ├── api/pay/route.ts      Mock gateway route handler
│   ├── globals.css
│   ├── layout.tsx            Wraps app in <StoreProvider>
│   └── page.tsx              Landing page
├── components/
│   ├── CardBrandBadge.tsx
│   ├── CardInput.tsx
│   ├── CardPreview.tsx
│   ├── Field.tsx             Label + input + error wrapper (a11y)
│   ├── PaymentForm.tsx
│   ├── PaymentGateway.tsx    Top-level state coordinator
│   ├── StatusBadge.tsx
│   ├── StatusScreen.tsx
│   ├── TransactionDetails.tsx
│   └── TransactionHistory.tsx
├── hooks/
│   ├── useCardForm.ts        Form values, errors, touched state
│   └── usePayment.ts         Lifecycle dispatcher + AbortController
├── store/
│   ├── historySlice.ts       Transaction list (persisted)
│   ├── paymentSlice.ts       Payment lifecycle state
│   ├── index.ts              configureStore + typed hooks
│   └── Provider.tsx          StoreProvider + localStorage hydrator
├── types/
│   └── payment.ts            All shared types
└── utils/
    ├── cardType.ts           Brand detection
    ├── format.ts             Formatting helpers
    ├── payment.ts            postPayment + custom errors
    ├── storage.ts            localStorage helpers
    └── validation.ts         All validators (incl. Luhn)
```

## State management — why Redux Toolkit?

The assignment allowed either Redux Toolkit or Zustand. I chose **Redux Toolkit** because:

1. **Two distinct, cross-component concerns** — the payment lifecycle (`paymentSlice`) and the transaction history (`historySlice`) — naturally split into two slices with explicit, named actions. RTK keeps these clearly separated.
2. **Predictable, debuggable transitions** — the lifecycle has named transitions (`paymentStarted`, `paymentSucceeded`, `paymentFailed`, `paymentTimedOut`, `paymentReset`). Redux DevTools makes the flow easy to inspect.
3. **Persistence integration** — the history slice is hydrated once via a small `store.subscribe` listener that mirrors changes back to `localStorage`. Done in ~10 lines.

Local form state stays in `useState` (per the assignment), since it doesn't need to be shared.

## Assumptions

- **Cards supported**: Visa, Mastercard, Amex only. Other ranges (Discover, Diners, JCB, Maestro, RuPay) are rejected at validation. Easy to extend in `utils/cardType.ts`.
- **Amount**: positive number with at most 2 decimal places, capped at 1,000,000 to avoid runaway values in the demo.
- **Currency formatting**: uses `Intl.NumberFormat`, locale `en-IN` for INR and `en-US` for USD.
- **History storage**: client-only `localStorage` (per assignment). No server persistence, so wiping browser storage clears history. Quota errors are silently ignored.
- **Timeout vs. slow success**: the 8s server-side delay path completes as a *success* if the client doesn't abort first. The client always aborts at 6s, so in practice every "slow" response surfaces as a `timeout` to the user — which matches the spec.
- **CVV / card number**: never logged or echoed back; CVV uses `type="password"`.
- **Random outcome distribution** is approximate — driven by `Math.random()`, not exact percentages.

## What I'd improve given more time

- **Tests**: add Vitest unit tests for `validation.ts`, `cardType.ts`, `format.ts`, the slices, and Playwright for the happy path / timeout / 3-strikes flows.
- **Loading skeletons** for history hydration (currently a one-line "Loading…").
- **Slow-network UX**: show a "Still processing…" hint after ~3s during processing.
- **History filtering / search** by status or last 4.
- **Receipts**: a downloadable receipt for successful transactions.
- **Keyboard focus trap** in the details modal (currently only first-focus + Esc; tab-cycle isn't trapped).
- **Stricter idempotency on the server**: the mock gateway currently doesn't actually deduplicate by `Idempotency-Key`. A real implementation would cache the first response per key for a window.
- **Server-side outcome injection**: a query param to force success/failure/timeout would make manual testing easier.
- **i18n**: the few user-facing strings are inlined; would extract to a messages file.
- **Reduce re-renders** in `useCardForm` by splitting touched/errors into refs where appropriate.

## Notes

- The first `npm run build` after install on Apple Silicon may patch the lockfile to add `@next/swc-darwin-arm64`. If you see a "lockfile patched" notice, just run `npm install` once more.
