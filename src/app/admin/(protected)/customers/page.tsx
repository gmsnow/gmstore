import { prisma } from "@/lib/prisma";
import { Mail, ShoppingBag, Star, Coins } from "lucide-react";

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true, name: true, email: true, points: true, referralCode: true,
      orders: { select: { id: true } },
      reviews: { select: { id: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">العملاء</h1>
      <p className="text-sm text-muted-foreground">إجمالي العملاء: {customers.length}</p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-start p-3">الاسم</th>
              <th className="text-start p-3">البريد</th>
              <th className="text-start p-3"><ShoppingBag className="h-3.5 w-3.5 inline" /> الطلبات</th>
              <th className="text-start p-3"><Star className="h-3.5 w-3.5 inline" /> التقييمات</th>
              <th className="text-start p-3"><Coins className="h-3.5 w-3.5 inline" /> النقاط</th>
              <th className="text-start p-3">كود الإحالة</th>
              <th className="text-start p-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-semibold">{c.name || "—"}</td>
                <td className="p-3 flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" />{c.email}</td>
                <td className="p-3">{c.orders.length}</td>
                <td className="p-3">{c.reviews.length}</td>
                <td className="p-3 font-semibold text-amber-600">{c.points}</td>
                <td className="p-3 text-xs text-muted-foreground">{c.referralCode || "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
