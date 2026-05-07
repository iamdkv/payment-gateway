"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { historyHydrated } from "./historySlice";
import { loadTransactions, saveTransactions } from "@/utils/storage";

function HistoryHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initial = loadTransactions();
    store.dispatch(historyHydrated(initial));

    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.history.hydrated) {
        saveTransactions(state.history.transactions);
      }
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HistoryHydrator>{children}</HistoryHydrator>
    </Provider>
  );
}
