"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  CardFormErrors,
  CardFormValues,
  Currency,
} from "@/types/payment";
import { detectCardType } from "@/utils/cardType";
import {
  formatAmountInput,
  formatCardNumber,
  formatCvv,
  formatExpiry,
} from "@/utils/format";
import {
  isFormValid,
  validateAmount,
  validateCardNumber,
  validateCardholderName,
  validateCvv,
  validateExpiry,
} from "@/utils/validation";

const initialValues: CardFormValues = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

type FieldName = keyof CardFormValues;

function validateField(
  name: FieldName,
  values: CardFormValues,
): string | undefined {
  switch (name) {
    case "cardholderName":
      return validateCardholderName(values.cardholderName);
    case "cardNumber":
      return validateCardNumber(values.cardNumber);
    case "expiry":
      return validateExpiry(values.expiry);
    case "cvv":
      return validateCvv(values.cvv, values.cardNumber);
    case "amount":
      return validateAmount(values.amount);
    case "currency":
      return undefined;
  }
}

export function useCardForm() {
  const [values, setValues] = useState<CardFormValues>(initialValues);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const cardType = useMemo(
    () => detectCardType(values.cardNumber),
    [values.cardNumber],
  );

  const setField = useCallback(
    (name: FieldName, raw: string) => {
      setValues((prev) => {
        let next: CardFormValues;
        if (name === "cardNumber") {
          const type = detectCardType(raw);
          next = { ...prev, cardNumber: formatCardNumber(raw, type) };
        } else if (name === "expiry") {
          next = { ...prev, expiry: formatExpiry(raw) };
        } else if (name === "cvv") {
          next = { ...prev, cvv: formatCvv(raw, detectCardType(prev.cardNumber)) };
        } else if (name === "amount") {
          next = { ...prev, amount: formatAmountInput(raw) };
        } else if (name === "currency") {
          next = { ...prev, currency: raw as Currency };
        } else {
          next = { ...prev, cardholderName: raw };
        }

        // Re-validate on change for already-touched fields and the current field.
        setErrors((prevErrors) => {
          const updated: CardFormErrors = { ...prevErrors };
          (Object.keys(next) as FieldName[]).forEach((field) => {
            if (field === name || touched[field]) {
              updated[field] = validateField(field, next);
            }
          });
          return updated;
        });

        return next;
      });
    },
    [touched],
  );

  const blurField = useCallback(
    (name: FieldName) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }));
    },
    [values],
  );

  const validateAll = useCallback((): CardFormErrors => {
    const next: CardFormErrors = {
      cardholderName: validateCardholderName(values.cardholderName),
      cardNumber: validateCardNumber(values.cardNumber),
      expiry: validateExpiry(values.expiry),
      cvv: validateCvv(values.cvv, values.cardNumber),
      amount: validateAmount(values.amount),
    };
    setErrors(next);
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
      amount: true,
    });
    return next;
  }, [values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, []);

  const valid = isFormValid({
    cardholderName: validateCardholderName(values.cardholderName),
    cardNumber: validateCardNumber(values.cardNumber),
    expiry: validateExpiry(values.expiry),
    cvv: validateCvv(values.cvv, values.cardNumber),
    amount: validateAmount(values.amount),
  });

  return {
    values,
    errors,
    touched,
    cardType,
    valid,
    setField,
    blurField,
    validateAll,
    reset,
  };
}
