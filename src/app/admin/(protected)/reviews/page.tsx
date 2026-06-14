"use client";
import { useState, useEffect } from "react";
import { Star, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => { fetch("/api/admin/reviews").then(r => r.json()).then(setReviews).catch(() => {}); }, []);

  async function del(id: string) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setReviews(reviews.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة التقييمات</h1>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr><th className="text-start p-3">المنتج</th><th className="text-start p-3">المستخدم</th><th className="text-start p-3">التقييم</th><th className="text-start p-3">التعليق</th><th className="text-start p-3">التاريخ</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-semibold">{r.product?.name || r.product?.nameEn || "—"}</td>
                <td className="p-3">{r.user?.name || r.user?.email || "—"}</td>
                <td className="p-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />)}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground max-w-[200px] truncate">{r.comment || "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => del(r.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">لا توجد تقييمات بعد</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
