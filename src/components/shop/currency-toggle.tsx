"use client";
import { useState } from "react";

const USD_TO_YER = 535;

export function CurrencyToggle({ priceYer }: { priceYer: number }) {
  const [showUsd, setShowUsd] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <p className="text-3xl font-bold text-primary">
        {showUsd ? (priceYer / USD_TO_YER).toFixed(2) : priceYer.toFixed(2)}
      </p>
      <span className="text-lg text-muted-foreground">{showUsd ? "$" : "ريال"}</span>
      <button
        type="button"
        onClick={() => setShowUsd((p) => !p)}
        className="text-xs text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded border border-border"
      >
        {showUsd ? "ريال" : "$"}
      </button>
    </div>
  );
}
