"use client";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { T } from "@/components/translate";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, XCircle, Calendar, Package } from "lucide-react";

interface OrderItem {
  id: string;
  product: { name: string; nameEn: string | null; images: string[]; specs?: Record<string, string> | null; sizes?: string[]; brand?: string | null };
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
  status: string;
}

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MerchantCancelledOrdersPage() {
  const { t, locale, direction } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/merchant/orders?status=CANCELLED&take=100")
      .then((r) => r.json())
      .then((data: any) => {
        const list = data?.orders || data || [];
        setOrders(Array.isArray(list) ? list : []);
        setTotal(data?.total ?? (Array.isArray(list) ? list.length : 0));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div dir={direction} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-24 bg-muted rounded animate-pulse" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div dir={direction} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            الطلبات الملغية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <ShoppingBag className="inline h-4 w-4 ms-1" />
            {t("merchant.orders_count")}
            <span className="font-medium ms-1">{total}</span>
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <XCircle className="mx-auto h-12 w-12 mb-4 opacity-40" />
            <p>لا توجد طلبات ملغية</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        #{order.id.slice(0, 8)}
                      </span>
                      <Badge variant="danger"><XCircle className="h-3 w-3 ml-1" />ملغي</Badge>
                    </div>
                    <h3 className="font-semibold mt-1">{order.customerName}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">
                    {Number(order.total).toFixed(0)} <T k="merchant.currency" />
                  </p>
                </div>

                <div className="space-y-2 divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pt-3 first:pt-0">
                      <div className="h-14 w-14 rounded-lg border border-border bg-muted overflow-hidden flex-shrink-0 relative">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 m-auto text-muted-foreground/40" />
                        )}
                        {item.color && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background" style={{ backgroundColor: item.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        {item.product.brand && <p className="text-[10px] text-muted-foreground mt-0.5">العلامة: {item.product.brand}</p>}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">{item.quantity} × {Number(item.price).toFixed(0)}</span>
                          {item.color && <><span className="w-1 h-1 rounded-full bg-muted-foreground/30" /><span>اللون: {item.color}</span></>}
                          {item.size && <><span className="w-1 h-1 rounded-full bg-muted-foreground/30" /><span>المقاس: {item.size}</span></>}
                        </div>
                        {item.product.specs && Object.keys(item.product.specs).length > 0 && (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
                            {Object.entries(item.product.specs).map(([k, v]) => (
                              <span key={k}>{k}: <b>{String(v)}</b></span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
