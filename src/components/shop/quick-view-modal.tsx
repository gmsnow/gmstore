"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";
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
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
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

  function cycleCurrency() {
    setLocalCurrency(prev => {
      const base = prev ?? currency;
      const idx = ["yer", "usd", "sar"].indexOf(base);
      return (["yer", "usd", "sar"] as Currency[])[(idx + 1) % 3];
    });
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
        <motion.div
          key="wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-border px-5 py-3">
              <h2 className="text-lg font-bold text-foreground"><LocalizedName item={product} /></h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 lg:p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="relative bg-[#f5f5f5] dark:bg-gray-800 rounded-xl overflow-hidden">
                    {images.length > 0 ? (
                      <>
                        <div className="aspect-square">
                          <img src={images[imgIndex]} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        {images.length > 1 && (
                          <>
                            <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white transition-colors">
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="aspect-square flex items-center justify-center text-gray-400">لا توجد صورة</div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-[#e95a00] text-white flex items-center justify-center text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((url: string, i: number) => (
                        <button key={i} onClick={() => setImgIndex(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? "border-[var(--primary)]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    {product.category && (
                      <span className="inline-block text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-full mb-3">
                        <LocalizedName item={product.category} />
                      </span>
                    )}
                    <h1 className="text-2xl font-bold text-foreground">
                      <LocalizedName item={product} />
                    </h1>
                  </div>

                  {avgRating > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{avgRating.toFixed(1)}</span>
                      <span>({reviewCount} تقييم)</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[var(--primary)]">{formatPrice(displayCurrency)} {currencyLabels[displayCurrency]}</span>
                    <span className="text-base text-muted-foreground line-through">{formatPrice("yer")} {currencyLabels.yer}</span>
                    <button type="button" onClick={cycleCurrency} className="text-xs text-muted-foreground hover:text-[var(--primary)] transition-colors px-1.5 py-0.5 rounded border border-border">
                      {currencyLabels[(["yer", "usd", "sar"] as Currency[])[(["yer", "usd", "sar"].indexOf(displayCurrency) + 1) % 3]]}
                    </button>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  )}

                  {product.descriptionEn && (
                    <p className="text-sm text-muted-foreground/70 leading-relaxed dir-ltr">{product.descriptionEn}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">المخزون:</span>
                    <span className={`font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {product.stock > 0 ? `${product.stock} قطع` : "غير متوفر"}
                    </span>
                  </div>

                  {product.colors?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        الألوان: <span className="text-foreground">{selectedColor}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c: string) => (
                          <button key={c} type="button" onClick={() => setSelectedColor(c)}
                            className={`h-7 w-7 rounded-full border-2 transition-all ${selectedColor === c ? "border-foreground scale-110" : "border-border hover:scale-105"}`}
                            style={{ backgroundColor: c }} title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {product.brand && (
                    <div className="flex items-center gap-2">
                      {product.brandLogo && <img src={product.brandLogo} alt="" className="h-8 w-8 object-contain" />}
                      <span className="text-sm text-muted-foreground">العلامة التجارية: <span className="text-foreground font-medium">{product.brand}</span></span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-border">
                    <button onClick={addToCart} className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity">
                      <ShoppingCart className="h-4 w-4" />
                      أضف إلى السلة
                    </button>
                    <a href={`/products/${product.slug}`} className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground rounded-xl py-3 text-sm font-medium hover:bg-muted/80 transition-colors text-center">
                      عرض التفاصيل كاملة
                    </a>
                  </div>
                </div>
              </div>

              {product.reviews?.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="text-lg font-bold mb-4">التقييمات ({reviewCount})</h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {product.reviews.map((r: any, i: number) => (
                      <div key={r.id || i} className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{r.user?.name || "مستخدم"}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`h-3.5 w-3.5 ${j < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
