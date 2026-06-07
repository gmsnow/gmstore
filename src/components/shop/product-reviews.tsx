"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "@/lib/i18n/provider";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

export function ProductReviews({ productId, sessionUserId }: { productId: string; sessionUserId: string | undefined }) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`).then(r => r.json()).then(setReviews).catch(() => {});
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviews([data, ...reviews]);
      setRating(0);
      setComment("");
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">{t("detail.reviews")}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 text-sm">
            {StarRating(avgRating)}
            <span className="text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      {sessionUserId ? (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-110">
                <Star className={`h-5 w-5 ${s <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder={t("detail.review_placeholder")} value={comment} onChange={(e) => setComment(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" size="sm" loading={loading} disabled={!rating}>{t("detail.review_submit")}</Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t("detail.login_to_review")}</p>
      )}

      <AnimatePresence>
        <div className="space-y-3">
          {reviews.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{r.user.name || t("general.back")}</span>
                <div className="flex">{StarRating(r.rating)}</div>
                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </motion.div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t("detail.no_reviews")}</p>}
        </div>
      </AnimatePresence>
    </div>
  );
}

function StarRating(rating: number) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}
