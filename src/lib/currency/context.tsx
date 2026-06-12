"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export const USD_TO_YER = 535;

type Currency = "yer" | "usd";

interface CurrencyContext {
  showUsd: boolean;
  toggleCurrency: () => void;
}

const CurrencyCtx = createContext<CurrencyContext>({
  showUsd: false,
  toggleCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [showUsd, setShowUsd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currency");
    setShowUsd(stored === "usd");
    setMounted(true);
  }, []);

  const toggleCurrency = useCallback(() => {
    setShowUsd((p) => {
      const next = !p;
      localStorage.setItem("currency", next ? "usd" : "yer");
      return next;
    });
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <CurrencyCtx.Provider value={{ showUsd, toggleCurrency }}>
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyCtx);
}
