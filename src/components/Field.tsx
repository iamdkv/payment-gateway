"use client";

import type { ReactNode } from "react";

interface Props {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ id, label, error, hint, children, className }: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <span id={hintId} className="text-xs text-zinc-500">
          {hint}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </span>
      )}
    </div>
  );
}
