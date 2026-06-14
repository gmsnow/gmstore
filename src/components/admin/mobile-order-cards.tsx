"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { OrderLocationLink } from "@/components/admin/order-location-link";

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

export function MobileOrderCards({ orders }: { orders: any[] }) {
  const router = useRouter();

  if (orders.length === 0) {
    return <div className="text-center text-muted-foreground py-8">لا توجد طلبات بعد</div>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o: any) => {
        const nonDelivered = o.status !== "DELIVERED" && o.status !== "CANCELLED";
        const actions = nonDelivered
          ? [
              ...(o.status !== "SHIPPED" ? [{
                key: "next",
                label: o.status === "PENDING" ? "معالجة" : "شحن",
                color: "#eab308",
                onSwipe: async () => {
                  const next = o.status === "PENDING" ? "PROCESSING" : "SHIPPED";
                  await fetch(`/api/orders/${o.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: next }),
                  });
                  router.refresh();
                },
              }] : []),
              {
                key: "deliver",
                label: "توصيل",
                color: "#22c55e",
                onSwipe: async () => {
                  await fetch(`/api/orders/${o.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "DELIVERED" }),
                  });
                  router.refresh();
                },
              },
            ]
          : [];

        return (
          <SwipeableCard
            key={o.id}
            onTap={() => router.push(`/admin/orders/${o.id}`)}
            actions={actions}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                <Badge variant={statusVariant[o.status] || "default"}>{statusLabels[o.status] || o.status}</Badge>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {o.items.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden" title={`${item.product?.name || ""}${item.color ? ` (${item.color})` : ""}${item.size ? ` [${item.size}]` : ""}`}>
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
                <span className="text-sm font-medium">{o.items.length} منتج</span>
              </div>
              <div className="text-sm mb-1"><span className="text-muted-foreground">العميل: </span>{o.customerName}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</span>
                <div className="flex items-center gap-2">
                  <OrderLocationLink shippingAddress={o.shippingAddress} />
                  <span className="text-sm font-semibold">{Number(o.total).toFixed(2)} ريال</span>
                </div>
              </div>
            </div>
          </SwipeableCard>
        );
      })}
    </div>
  );
}
