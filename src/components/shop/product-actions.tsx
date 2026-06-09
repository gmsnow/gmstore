"use client";
import { useState } from "react";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

export function ProductActions({ product, colors }: { product: { id: string; name: string; price: number; images: string[]; stock: number }; colors: string[] }) {
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            الألوان: <span className="text-foreground font-semibold">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === c ? "border-foreground scale-110" : "border-border hover:scale-105"}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
      <AddToCartButton product={product} color={selectedColor} />
    </div>
  );
}
