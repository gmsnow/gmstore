import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ArrowLeft } from "lucide-react";

export default async function AdminDeliveredOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { status: "DELIVERED" },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">الطلبات المكتملة</h1>
        <Link href="/admin/orders" className="mr-auto inline-flex h-8 items-center justify-center rounded-lg border border-border bg-transparent px-3 text-sm font-medium hover:bg-muted transition-colors">الحالية</Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الطلب</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>المنتجات</TableHead>
            <TableHead>المجموع</TableHead>
            <TableHead>تاريخ التوصيل</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
              <TableCell>
                <div className="text-sm">{o.customerName}</div>
                <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
              </TableCell>
              <TableCell>
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {o.items.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden" title={`${item.product?.name || ""}${item.color ? ` (${item.color})` : ""}`}>
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                      {item.color && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border border-background" style={{ backgroundColor: item.color }} />}
                    </div>
                  ))}
                  {o.items.length > 4 && <span className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground">+{o.items.length - 4}</span>}
                </div>
              </TableCell>
              <TableCell>{Number(o.total).toFixed(2)} ريال</TableCell>
              <TableCell>{o.createdAt.toLocaleDateString("ar-SA")}</TableCell>
              <TableCell>
                <Link href={`/admin/orders/${o.id}`}>
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                لا توجد طلبات مكتملة بعد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
