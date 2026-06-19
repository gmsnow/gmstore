import { prisma } from "@/lib/prisma";
import { Mail, ShoppingBag, Star, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const [customers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true, name: true, email: true, points: true, referralCode: true,
        orders: { select: { id: true } },
        reviews: { select: { id: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">العملاء</h1>
      <p className="text-sm text-muted-foreground">إجمالي العملاء: {totalCount}</p>

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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/customers?page=${page - 1}`}>
              <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/customers?page=${page + 1}`}>
              <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
