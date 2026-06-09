"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
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
  const [x, setX] = useState(0);
  const [toast, setToast] = useState<"cart" | "fav" | null>(null);
  const [isFav, setIsFav] = useState(false);
  const { direction } = useI18n();
  const isRtl = direction === "rtl";

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

  function handleDragEnd(_: any, info: any) {
    const offset = info.offset.x;
    if (Math.abs(offset) < 80) { setX(0); return; }

    const isRight = isRtl ? offset > 0 : offset < 0;
    const isLeft = isRtl ? offset < 0 : offset > 0;

    if (isRight) {
      toggleFav();
      setToast("fav");
      setTimeout(() => setToast(null), 1500);
    } else if (isLeft) {
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
    setX(0);
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

        <motion.div
          drag="x"
          dragElastic={0.3}
          dragMomentum={false}
          animate={{ x }}
          onDragEnd={handleDragEnd}
          className="relative"
          style={{ touchAction: "pan-y" }}
        >
          <Link href={`/products/${product.slug}`} className="block">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 flex pointer-events-none z-10 rounded-2xl overflow-hidden">
                <div className="flex-1 flex items-center justify-center bg-rose-500/70 text-white text-sm font-bold gap-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-[0s] group-hover:delay-[3000ms]">
                  <Heart className={`h-4 w-4 ${isFav ? "fill-white" : ""}`} />
                  {isFav ? "✓" : null}
                </div>
                <div className="flex-1 flex items-center justify-center bg-emerald-500/70 text-white text-sm font-bold gap-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-[0s] group-hover:delay-[3000ms]">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </div>
              <motion.div className="aspect-square bg-muted overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-600 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><T k="product.no_image" /></div>
                )}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-white/90 backdrop-blur-sm text-[10px] px-2.5 py-1 shadow-sm text-foreground">
                  <LocalizedName item={product.category} />
                </Badge>
              </div>

              <AnimatePresence>
                {isFav && (
                  <motion.div
                    key="fav-heart"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                    className="absolute top-3 right-3 z-10"
                  >
                    <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg">
                      <Heart className="h-4 w-4 fill-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {avgRating > 0 && (
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-[10px] opacity-70">({reviewCount})</span>
                </div>
              )}
            </div>

            <div className="p-4 space-y-2.5">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                <LocalizedName item={product} />
              </h3>

              {product.colors?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {product.colors.slice(0, 5).map((c: string, i: number) => (
                      <motion.div
                        key={c}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.4, y: -2 }}
                        className="h-4 w-4 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  {product.colors.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">+{product.colors.length - 5}</span>
                  )}
                </div>
              )}

              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-lg font-bold text-primary">{Number(product.price).toFixed(2)}</span>
                <span className="text-[11px] text-muted-foreground">ريال</span>
              </div>
            </div>
          </Link>
        </motion.div>

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
