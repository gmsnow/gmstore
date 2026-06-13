"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { LocalizedName } from "@/components/localized";
import { useCurrency, USD_TO_YER, USD_TO_SAR, type Currency } from "@/lib/currency/context";
import type { CartItem } from "@/types";

interface Props {
  product: any;
  open: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, open, onClose }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const { currency } = useCurrency();
  const [localCurrency, setLocalCurrency] = useState<Currency | null>(null);
  const displayCurrency = localCurrency !== null ? localCurrency : currency;
  const currencyLabels: Record<Currency, string> = { yer: "ريال", usd: "$", sar: "رس" };
  const images = product.images?.length ? product.images : [];

  function formatPrice(c: Currency) {
    const price = Number(product.price);
    if (c === "usd") return (price / USD_TO_YER).toFixed(2);
    if (c === "sar") return (price / USD_TO_YER * USD_TO_SAR).toFixed(2);
    return price.toFixed(2);
  }

  function addToCart() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find((i) => i.productId === product.id && !i.color);
    if (!exists) {
      cart.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images[0] || "",
        quantity: 1,
        colors: product.colors || undefined,
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0;
  const reviewCount = product.reviews?.length || 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative bg-[#f5f5f5] dark:bg-gray-800">
                {images.length > 0 ? (
                  <>
                    <div className="aspect-square">
                      <img src={images[imgIndex]} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 shadow hover:bg-white transition-colors">
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 shadow hover:bg-white transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setImgIndex(i)} className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-5 bg-primary" : "w-1.5 bg-white/60"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="aspect-square flex items-center justify-center text-gray-400 text-sm">لا توجد صورة</div>
                )}
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#e95a00] text-white flex items-center justify-center text-[10px] font-bold">
                    -{product.discount}%
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col gap-3">
                <h2 className="text-xl font-bold text-foreground">
                  <LocalizedName item={product} />
                </h2>

                {avgRating > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ★ {avgRating.toFixed(1)} ({reviewCount} تقييم)
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[var(--primary)]">{formatPrice(displayCurrency)} {currencyLabels[displayCurrency]}</span>
                  {Number(product.price) > 0 && (
                    <span className="text-sm text-muted-foreground line-through">{formatPrice("yer")} {currencyLabels.yer}</span>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{product.description}</p>
                )}

                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1.5">الألوان:</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {product.colors.map((c: string) => (
                        <div key={c} className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-3">
                  <button
                    onClick={addToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    أضف إلى السلة
                  </button>
                  <a
                    href={`/products/${product.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors text-center"
                  >
                    عرض التفاصيل
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
