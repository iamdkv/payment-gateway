"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  trailing?: React.ReactNode;
};

export const CardInput = forwardRef<HTMLInputElement, Props>(
  function CardInput({ invalid, trailing, className, ...rest }, ref) {
    return (
      <div className="relative">
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={[
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors",
            "dark:bg-zinc-900 dark:text-zinc-100",
            invalid
              ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
              : "border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:focus:border-zinc-300 dark:focus:ring-zinc-800",
            trailing ? "pr-14" : "",
            className ?? "",
          ].join(" ")}
          {...rest}
        />
        {trailing && (
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </div>
        )}
      </div>
    );
  },
);
