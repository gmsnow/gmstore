"use client";
import { useState, useEffect } from "react";
import { Star, Trash2, Reply, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";

export default function ReviewsPage() {
  const { t, locale } = useI18n();
  const [reviews, setReviews] = useState<any[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});

  const fetchReviews = () => {
    fetch("/api/admin/reviews").then(r => r.json()).then(setReviews).catch(() => {});
  };

  useEffect(() => { fetchReviews(); }, []);

  async function del(id: string) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setReviews(reviews.filter((r) => r.id !== id));
  }

  async function handleReply(reviewId: string) {
    const reply = replyTexts[reviewId]?.trim();
    if (!reply) return;
    setReplying((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply } : r)));
        setReplyTexts((prev) => { const n = { ...prev }; delete n[reviewId]; return n; });
      }
    } finally {
      setReplying((prev) => ({ ...prev, [reviewId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة التقييمات</h1>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr><th className="text-start p-3">المنتج</th><th className="text-start p-3">المستخدم</th><th className="text-start p-3">التقييم</th><th className="text-start p-3">التعليق</th><th className="text-start p-3">الرد</th><th className="text-start p-3">التاريخ</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-semibold">{locale === "ar" ? r.product?.name : (r.product?.nameEn || r.product?.name) || "—"}</td>
                <td className="p-3">{r.user?.name || r.user?.email || "—"}</td>
                <td className="p-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />)}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground max-w-[200px]">{r.comment || "—"}</td>
                <td className="p-3 max-w-[200px]">
                  {r.reply ? (
                    <div className="text-xs bg-muted p-2 rounded">
                      <span className="font-medium text-foreground">الرد: </span>
                      <span className="text-muted-foreground">{r.reply}</span>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={replyTexts[r.id] || ""}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        placeholder="رد..."
                        className="w-24 rounded border border-border px-2 py-1 text-xs outline-none focus:border-primary bg-background"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReply(r.id)}
                        loading={replying[r.id]}
                        disabled={replying[r.id] || !replyTexts[r.id]?.trim()}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => del(r.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">لا توجد تقييمات بعد</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
