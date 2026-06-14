"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, Ticket, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrency, USD_TO_YER, USD_TO_SAR, type Currency } from "@/lib/currency/context";
import { getCart, removeFromCart, updateQuantity, cartSubtotal, getFreeShippingThreshold, getShippingCost, validateCoupon } from "@/lib/cart/store";
import type { CartItem } from "@/types";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { currency } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setItems(getCart());
    setCouponCode("");
    setDiscount(0);
    setCouponMsg("");
  }, [open]);

  useEffect(() => {
    const handler = () => { if (open) setItems(getCart()); };
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [open]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const threshold = getFreeShippingThreshold();
  const shippingCost = getShippingCost();
  const remaining = Math.max(0, threshold - subtotal);
  const isFreeShipping = subtotal >= threshold;
  const progressPct = Math.min(100, (subtotal / threshold) * 100);
  const total = subtotal - discount + (isFreeShipping ? 0 : shippingCost);

  function formatPrice(priceYer: number) {
    if (currency === "usd") return (priceYer / USD_TO_YER).toFixed(2);
    if (currency === "sar") return (priceYer / USD_TO_YER * USD_TO_SAR).toFixed(2);
    return priceYer.toFixed(2);
  }
  const label = currency === "usd" ? "$" : currency === "sar" ? "رس" : "ريال";

  function applyCoupon() {
    const disc = validateCoupon(couponCode);
    if (disc !== null) {
      setDiscount(Math.round(subtotal * disc / 100));
      setCouponMsg(t("cart.coupon_applied"));
    } else {
      setDiscount(0);
      setCouponMsg(t("cart.coupon_invalid"));
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 end-0 z-50 w-full max-w-md bg-background border-s border-border shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                {t("cart.drawer_title")}
                {items.length > 0 && <span className="text-sm text-muted-foreground">({items.length})</span>}
              </h2>
              <button onClick={onClose} className="p-1 hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free shipping progress */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <Truck className="h-3.5 w-3.5" />
                {isFreeShipping
                  ? <span className="text-green-600 font-semibold">{t("cart.free_shipping_achieved")}</span>
                  : <span>{t("cart.free_shipping_progress").replace("{amount}", `${formatPrice(remaining)} ${label}`)}</span>
                }
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">{t("cart.empty_drawer")}</p>
                  <button onClick={onClose} className="text-sm text-primary hover:underline">{t("cart.continue_shopping")}</button>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={`${item.productId}-${item.color || ""}-${item.size || ""}-${idx}`} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link href={`/products/${item.productId}`} className="text-sm font-semibold line-clamp-2 hover:text-primary" onClick={onClose}>
                        {item.name}
                      </Link>
                      {item.color && <span className="text-xs text-muted-foreground">{item.color}</span>}
                      {item.size && <span className="text-xs text-muted-foreground mr-1">{item.size}</span>}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-0.5 border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.productId, item.color, -1)} className="p-1 hover:text-primary transition-colors">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.color, 1)} className="p-1 hover:text-primary transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{formatPrice(item.price)} {label}</span>
                          <button onClick={() => { removeFromCart(item.productId, item.color); setItems(getCart()); }} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Coupon */}
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t("cart.coupon_placeholder")}
                  className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary bg-background"
                />
                <button onClick={applyCoupon} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  {t("cart.coupon_apply")}
                </button>
              </div>
              {couponMsg && <p className={`text-xs mt-1 ${discount > 0 ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>}
            </div>

            {/* Footer with totals */}
            <div className="border-t border-border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span className="font-semibold">{formatPrice(subtotal)} {label}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.coupon_discount")} ({couponCode})</span>
                  <span className="font-semibold text-green-600">-{formatPrice(discount)} {label}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("cart.shipping")}</span>
                <span className={isFreeShipping ? "text-green-600 font-semibold" : "font-semibold"}>
                  {isFreeShipping ? t("cart.free_shipping") : `${formatPrice(shippingCost)} ${label}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>{t("cart.total")}</span>
                <span className="text-primary">{formatPrice(total)} {label}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity mt-2"
              >
                {t("cart.checkout")}
              </Link>
              <button onClick={onClose} className="block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
                {t("cart.continue_shopping")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
