"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import { T } from "@/components/translate";
import { OrderMap } from "@/components/admin/order-map";
import { useI18n } from "@/lib/i18n/provider";

const itemStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

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

const statusOptions = itemStatuses.map((s) => ({ value: s, label: statusLabels[s] }));

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { t } = useI18n();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itemUpdating, setItemUpdating] = useState<string | null>(null);

  async function fetchOrder() {
    const res = await fetch(`/api/orders/${params.id}`);
    if (res.ok) setOrder(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchOrder(); }, []);

  async function updateItemStatus(itemId: string, status: string) {
    setItemUpdating(itemId);
    await fetch(`/api/orders/${params.id}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchOrder();
    setItemUpdating(null);
  }

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;
  if (!order) return <p className="text-destructive">الطلب غير موجود</p>;

  let address: Record<string, string> = {};
  try { address = JSON.parse(order.shippingAddress || "{}"); } catch { address = { address: order.shippingAddress || "" }; }

  const lat = address.lat ? Number(address.lat) : null;
  const lng = address.lng ? Number(address.lng) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm"><ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">{t("admin.order_detail") || "تفاصيل الطلب"}</h1>
        <span className="mr-auto font-mono text-xs text-muted-foreground">{order.id}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle><T k="checkout.shipping_details" /></CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium text-muted-foreground"><T k="checkout.city" />:</span> {address.city || "—"}</p>
            <p><span className="font-medium text-muted-foreground"><T k="checkout.street" />:</span> {address.street || "—"}</p>
            {address.notes && <p><span className="font-medium text-muted-foreground"><T k="checkout.notes" />:</span> {address.notes}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle><T k="checkout.customer" /></CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium text-muted-foreground"><T k="checkout.full_name" />:</span> {order.customerName}</p>
            <p><span className="font-medium text-muted-foreground"><T k="checkout.email" />:</span> {order.customerEmail}</p>
            <p><span className="font-medium text-muted-foreground"><T k="checkout.phone_label" />:</span> {order.customerPhone}</p>
          </CardContent>
        </Card>
      </div>

      {lat && lng && (
        <Card>
          <CardHeader><CardTitle>موقع العميل</CardTitle></CardHeader>
          <CardContent>
            <OrderMap lat={lat} lng={lng} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle><T k="checkout.items" /></CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead><T k="checkout.qty" /></TableHead>
                <TableHead><T k="admin.price" /></TableHead>
                <TableHead>المجموع</TableHead>
                <TableHead>حالة المنتج</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.product?.images?.[0] ? (
                        <div className="relative">
                          <img src={item.product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0" />
                          {item.color && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-background" style={{ backgroundColor: item.color }} />}
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground">—</div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.product?.name || "—"}</p>
                        {item.color && <p className="text-[10px] text-muted-foreground">{item.color}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{Number(item.price).toFixed(2)} ريال</TableCell>
                  <TableCell>{(Number(item.price) * item.quantity).toFixed(2)} ريال</TableCell>
                  <TableCell>
                    <Select
                      value={itemUpdating === item.id ? t("general.loading") : item.status}
                      onChange={(e) => updateItemStatus(item.id, e.target.value)}
                      options={statusOptions}
                      className="w-36"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-left">
        <p className="text-xl font-bold">
          المجموع الكلي: {Number(order.total).toFixed(2)} ريال
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString("ar-SA")}
        </p>
      </div>
    </div>
  );
}
