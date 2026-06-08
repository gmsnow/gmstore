"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { LocalizedName } from "@/components/localized";
import { useI18n } from "@/lib/i18n/provider";
import type { CartItem } from "@/types";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); } catch { return []; }
}

function toggleFavorite(productId: string) {
  const favs = getFavorites();
  const next = favs.includes(productId) ? favs.filter((id) => id !== productId) : [...favs, productId];
  localStorage.setItem("favorites", JSON.stringify(next));
  return next;
}

function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => { setIds(getFavorites()); }, []);
  return { ids, toggle: (id: string) => setIds(toggleFavorite(id)) };
}

export function SwipeableProductCard({ product }: { product: any }) {
  const [x, setX] = useState(0);
  const { ids, toggle: toggleFav } = useFavorites();
  const { direction } = useI18n();
  const isRtl = direction === "rtl";
  const isFav = ids.includes(product.id);

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0;

  function handleDragEnd(_: any, info: any) {
    const offset = info.offset.x;
    if (Math.abs(offset) < 80) { setX(0); return; }

    const isRight = isRtl ? offset > 0 : offset < 0;
    const isLeft = isRtl ? offset < 0 : offset > 0;

    if (isRight) {
      toggleFav(product.id);
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
        });
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    }
    setX(0);
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex">
        <div className="flex-1 flex items-center justify-center bg-rose-500/20 text-rose-500 text-sm font-bold gap-2">
          <Heart className={`h-5 w-5 ${isFav ? "fill-rose-500" : ""}`} />
          المفضلة
        </div>
        <div className="flex-1 flex items-center justify-center bg-emerald-500/20 text-emerald-600 text-sm font-bold gap-2">
          <ShoppingCart className="h-5 w-5" />
          السلة
        </div>
      </div>
      <motion.div
        drag="x"
        dragElastic={0.2}
        dragMomentum={false}
        animate={{ x }}
        onDragEnd={handleDragEnd}
        className="relative bg-card rounded-xl"
        style={{ touchAction: "pan-y" }}
      >
        <Link href={`/products/${product.slug}`} className="block">
          <HoverCard>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border-none">
              <div className="aspect-square bg-muted relative">
                {isFav && (
                  <div className="absolute top-2 right-2 z-10 bg-rose-500 text-white p-1.5 rounded-full">
                    <Heart className="h-4 w-4 fill-white" />
                  </div>
                )}
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><T k="product.no_image" /></div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <Badge variant="outline"><LocalizedName item={product.category} /></Badge>
                <h3 className="font-semibold truncate"><LocalizedName item={product} /></h3>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
                  </div>
                )}
                {product.colors?.length > 0 && (
                  <div className="flex gap-1">
                    {product.colors.slice(0, 5).map((c: string) => (
                      <div key={c} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />
                    ))}
                    {product.colors.length > 5 && <span className="text-[10px] text-muted-foreground self-center">+{product.colors.length - 5}</span>}
                  </div>
                )}
                <p className="text-lg font-bold text-primary">{Number(product.price).toFixed(2)} ريال</p>
              </CardContent>
            </Card>
          </HoverCard>
        </Link>
      </motion.div>
    </div>
  );
}
