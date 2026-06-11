"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { T } from "@/components/translate";
import { LocalizedName } from "@/components/localized";
import { useI18n } from "@/lib/i18n/provider";
import type { CartItem } from "@/types";

function getLocalFavs(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); } catch { return []; }
}

function setLocalFavs(ids: string[]) {
  localStorage.setItem("favorites", JSON.stringify(ids));
  window.dispatchEvent(new Event("favoritesUpdated"));
}

export function SwipeableProductCard({ product, isLoggedIn = false, favoriteIds }: { product: any; isLoggedIn?: boolean; favoriteIds?: Set<string> }) {
  const [toast, setToast] = useState<"cart" | "fav" | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showUsd, setShowUsd] = useState(false);
  const USD_TO_YER = 535;
  const router = useRouter();
  const { direction } = useI18n();
  const isRtl = direction === "rtl";
  const images = product.images?.length ? product.images : [];
  const hasMultiple = images.length > 1;

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0;
  const reviewCount = product.reviews?.length || 0;

  useEffect(() => {
    if (isLoggedIn) {
      setIsFav(favoriteIds?.has(product.id) ?? false);
    } else {
      setIsFav(getLocalFavs().includes(product.id));
    }
  }, [isLoggedIn, favoriteIds, product.id]);

  useEffect(() => {
    if (isLoggedIn) return;
    const handler = () => setIsFav(getLocalFavs().includes(product.id));
    window.addEventListener("favoritesUpdated", handler);
    return () => window.removeEventListener("favoritesUpdated", handler);
  }, [isLoggedIn, product.id]);

  const toggleFav = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();
        setIsFav(data.favorited);
        window.dispatchEvent(new Event("favoritesUpdated"));
      } catch {}
    } else {
      const favs = getLocalFavs();
      const next = favs.includes(product.id) ? favs.filter((id) => id !== product.id) : [...favs, product.id];
      setLocalFavs(next);
      setIsFav(next.includes(product.id));
    }
  }, [isLoggedIn, product.id]);

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
      setToast("cart");
      setTimeout(() => setToast(null), 1500);
    }
  }

  return (
    <div className="relative group">
      <motion.div
        className="absolute -inset-2 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 rounded-3xl blur-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-muted overflow-hidden relative">
            {images.length > 0 ? (
              <>
                <div className="relative h-full w-full">
                  <Link href={`/products/${product.slug}`} className="relative block h-full w-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={imgIndex}
                        className="h-full w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={images[imgIndex]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </Link>
                  {hasMultiple && (
                    <motion.div
                      className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragElastic={0}
                      dragMomentum={false}
                      onDragEnd={(_, info) => {
                        if (Math.abs(info.offset.x) < 10) {
                          router.push(`/products/${product.slug}`);
                        } else if (info.offset.x > 50 && imgIndex < images.length - 1) {
                          setImgIndex(i => i + 1);
                        } else if (info.offset.x < -50 && imgIndex > 0) {
                          setImgIndex(i => i - 1);
                        }
                      }}
                    />
                  )}
                </div>
                {hasMultiple && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-white scale-125" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><T k="product.no_image" /></div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <div className="text-2xl font-black italic drop-shadow-lg" style={{ color: "#2092EB" }}>
              Store
            </div>
          </div>

          {product.colors?.length > 0 && (
            <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 p-1.5 rounded-lg bg-gray-900/40 backdrop-blur-sm">
              {product.colors.slice(0, 6).map((c: string, i: number) => {
                const isSelected = selectedColor === c || (!selectedColor && i === 0);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      const ci = product.colorImages?.[c];
                      const idx = ci ? product.images?.indexOf(ci) : -1;
                      setImgIndex(idx >= 0 ? idx : (product.images?.length > i ? i : 0));
                    }}
                    className={`h-4 w-4 rounded-full border-2 shadow-sm transition-all shrink-0 ${isSelected ? "border-white scale-125" : "border-white/60 hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                );
              })}
              {product.colors.length > 6 && (
                <span className="text-[9px] text-white font-medium text-center drop-shadow-md">+{product.colors.length - 6}</span>
              )}
            </div>
          )}

          <AnimatePresence>
            {isFav && (
              <motion.div
                key="fav-heart"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                className="absolute top-3 right-3 z-10 pointer-events-none"
              >
                <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg">
                  <Heart className="h-4 w-4 fill-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {avgRating > 0 && (
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{avgRating.toFixed(1)}</span>
              <span className="text-[10px] opacity-70">({reviewCount})</span>
            </div>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              {product.category && (
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                  <LocalizedName item={product.category} />
                </span>
              )}
            </div>

            <h3 className="text-base font-medium truncate">
              <LocalizedName item={product} />
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-[15px] text-muted-foreground">{product.soldCount ? `${product.soldCount}+` : ""}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[28px] font-bold leading-none text-[#2092EB]">{showUsd ? (Number(product.price) / USD_TO_YER).toFixed(2) : Number(product.price).toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">{showUsd ? "$" : "ريال"}</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowUsd((p) => !p); }}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded border border-border"
              >
                {showUsd ? "ريال" : "$"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.preventDefault(); toggleFav(); setToast("fav"); setTimeout(() => setToast(null), 1500); }}
                className={`p-1.5 rounded-full transition-colors ${isFav ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500" : ""}`} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); addToCart(); }}
                className="p-1.5 rounded-full text-muted-foreground hover:text-emerald-500 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Link>

        <AnimatePresence mode="wait">
          {toast === "cart" && (
            <motion.div
              key="toast-cart"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-sm font-medium py-2.5 text-center z-20 shadow-lg"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
              >
                ✓ أضيف إلى السلة
              </motion.span>
            </motion.div>
          )}
          {toast === "fav" && (
            <motion.div
              key="toast-fav"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`absolute bottom-0 left-0 right-0 ${isFav ? "bg-rose-500" : "bg-gray-500"} text-white text-sm font-medium py-2.5 text-center z-20 shadow-lg`}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
              >
                {isFav ? "♥ أضيف إلى المفضلة" : "أزيل من المفضلة"}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
