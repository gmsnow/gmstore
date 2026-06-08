"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
import { SwipeableProductCard } from "@/components/shop/swipeable-product-card";
import { T } from "@/components/translate";

export default function FavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function sync() {
      try {
        const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIds(stored);
      } catch {
        setIds([]);
      }
    }
    sync();
    window.addEventListener("favoritesUpdated", sync);
    return () => window.removeEventListener("favoritesUpdated", sync);
  }, []);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ids]);

  function removeAll() {
    localStorage.setItem("favorites", JSON.stringify([]));
    window.dispatchEvent(new Event("favoritesUpdated"));
    setIds([]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-bold"><T k="favorites.title" /></h1>
            {ids.length > 0 && (
              <span className="text-sm text-muted-foreground">({ids.length})</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {ids.length > 0 && (
              <button
                onClick={removeAll}
                className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <T k="favorites.remove" />
              </button>
            )}
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <T k="favorites.browse" />
            </Link>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse h-80" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-4"
        >
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground"><T k="favorites.empty" /></p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <T k="favorites.browse" />
          </Link>
        </motion.div>
      ) : (
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p: any) => (
            <StaggerItem key={p.id}>
              <SwipeableProductCard product={p} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
