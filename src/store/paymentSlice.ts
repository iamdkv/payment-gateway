import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PaymentStatus } from "@/types/payment";

export const MAX_ATTEMPTS = 3;

export interface PaymentState {
  status: PaymentStatus;
  currentTransactionId: string | null;
  attempts: number;
  errorMessage: string | null;
  gatewayRef: string | null;
}

const initialState: PaymentState = {
  status: "idle",
  currentTransactionId: null,
  attempts: 0,
  errorMessage: null,
  gatewayRef: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    paymentStarted(
      state,
      action: PayloadAction<{ transactionId: string }>,
    ) {
      // If this is a retry of the same transaction, keep the attempt count
      // and increment it. Otherwise, this is a fresh transaction.
      if (state.currentTransactionId === action.payload.transactionId) {
        state.attempts += 1;
      } else {
        state.currentTransactionId = action.payload.transactionId;
        state.attempts = 1;
      }
      state.status = "processing";
      state.errorMessage = null;
      state.gatewayRef = null;
    },
    paymentSucceeded(
      state,
      action: PayloadAction<{ gatewayRef: string }>,
    ) {
      state.status = "success";
      state.errorMessage = null;
      state.gatewayRef = action.payload.gatewayRef;
    },
    paymentFailed(
      state,
      action: PayloadAction<{ reason: string }>,
    ) {
      state.status = "failed";
      state.errorMessage = action.payload.reason;
    },
    paymentTimedOut(state) {
      state.status = "timeout";
      state.errorMessage = "Request timed out. Please try again.";
    },
    paymentReset() {
      return initialState;
    },
  },
});

export const {
  paymentStarted,
  paymentSucceeded,
  paymentFailed,
  paymentTimedOut,
  paymentReset,
} = paymentSlice.actions;

export default paymentSlice.reducer;
