import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Transaction } from "@/types/payment";

export interface HistoryState {
  transactions: Transaction[];
  hydrated: boolean;
}

const initialState: HistoryState = {
  transactions: [],
  hydrated: false,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    historyHydrated(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
      state.hydrated = true;
    },
    transactionUpserted(state, action: PayloadAction<Transaction>) {
      const incoming = action.payload;
      const idx = state.transactions.findIndex((t) => t.id === incoming.id);
      if (idx === -1) {
        state.transactions.unshift(incoming);
      } else {
        state.transactions[idx] = incoming;
      }
    },
    historyCleared(state) {
      state.transactions = [];
    },
  },
});

export const { historyHydrated, transactionUpserted, historyCleared } =
  historySlice.actions;

export default historySlice.reducer;
