import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCheck } from "lucide-react";
import { MobileOrderCards } from "@/components/admin/mobile-order-cards";

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

const statusVariant: Record<string, "warning" | "success" | "danger" | "default"> = {
  PENDING: "warning",
  PROCESSING: "warning",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "danger",
};

function OrderThumbs({ items }: { items: any[] }) {
  return (
    <div className="flex -space-x-2 rtl:space-x-reverse">
      {items.slice(0, 4).map((item: any) => (
        <div key={item.id} className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden" title={`${item.product?.name || ""}${item.color ? ` (${item.color})` : ""}`}>
          {item.product?.images?.[0] ? (
            <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          {item.color && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border border-background" style={{ backgroundColor: item.color }} />}
        </div>
      ))}
      {items.length > 4 && <span className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground">+{items.length - 4}</span>}
    </div>
  );
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "DELIVERED" } },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <div className="mr-auto flex gap-2">
          <Link href="/admin/orders" className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-colors">الحالية</Link>
          <Link href="/admin/orders/delivered" className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-transparent px-3 text-sm font-medium hover:bg-muted transition-colors"><CheckCheck className="h-4 w-4 ml-1" />المكتملة</Link>
        </div>
      </div>

      <div className="max-md:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>المنتجات</TableHead>
              <TableHead>المجموع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">لا توجد طلبات بعد</TableCell></TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div className="text-sm">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                </TableCell>
                <TableCell><OrderThumbs items={o.items} /></TableCell>
                <TableCell>{Number(o.total).toFixed(2)} ريال</TableCell>
                <TableCell><Badge variant={statusVariant[o.status] || "default"}>{statusLabels[o.status] || o.status}</Badge></TableCell>
                <TableCell>{o.createdAt.toLocaleDateString("ar-SA")}</TableCell>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`}>
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden">
        <MobileOrderCards orders={orders} />
      </div>
    </div>
  );
}
