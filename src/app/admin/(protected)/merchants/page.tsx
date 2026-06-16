import { prisma } from "@/lib/prisma";
import { Store, Package, Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminMerchantsPage() {
  const merchants = await prisma.user.findMany({
    where: { role: "MERCHANT" },
    include: {
      store: true,
      _count: { select: { products: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalMerchants = merchants.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Store className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">التجار</h1>
        <span className="text-sm text-muted-foreground">({totalMerchants})</span>
      </div>

      <div className="max-md:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم التاجر</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>اسم المتجر</TableHead>
              <TableHead>المنتجات</TableHead>
              <TableHead>التقييمات</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">لا يوجد تجار بعد</TableCell></TableRow>
            ) : merchants.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {m.name?.[0] || "?"}
                    </div>
                    <span className="font-medium">{m.name || "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                <TableCell>
                  <span className="text-sm">{m.store ? (m.store.name || m.store.nameEn || "—") : "—"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    {m._count.products}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 text-muted-foreground" />
                    {m._count.reviews}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.createdAt.toLocaleDateString("ar-SA")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {merchants.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">لا يوجد تجار بعد</CardContent></Card>
        ) : merchants.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {m.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Store className="h-3 w-3" />{m.store?.name || m.store?.nameEn || "لا يوجد متجر"}</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" />{m._count.products} منتج</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.createdAt.toLocaleDateString("ar-SA")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
