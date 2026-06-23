import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

export default async function CjOrdersPage() {
  const mappings = await prisma.cjOrderMapping.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalCjItems = mappings.length;
  const pendingCount = mappings.filter((m) => m.status === "SUBMITTED" || m.status === "PENDING").length;
  const shippedCount = mappings.filter((m) => m.status === "SHIPPED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">طلبات CJ</h1>
        <Link href="/admin/cj" className="text-sm text-blue-600 hover:underline">← العودة إلى CJ</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 bg-white">
          <p className="text-sm text-muted-foreground">إجمالي العناصر</p>
          <p className="text-2xl font-bold">{totalCjItems}</p>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <p className="text-sm text-muted-foreground">قيد المعالجة</p>
          <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <p className="text-sm text-muted-foreground">تم الشحن</p>
          <p className="text-2xl font-bold text-green-600">{shippedCount}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-medium">رقم الطلب</th>
              <th className="text-right p-3 font-medium">رمز CJ</th>
              <th className="text-right p-3 font-medium">الحالة</th>
              <th className="text-right p-3 font-medium">رقم التتبع</th>
              <th className="text-right p-3 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {mappings.length === 0 && (
              <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">لا توجد طلبات CJ بعد</td></tr>
            )}
            {mappings.map((m) => (
              <tr key={m.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <Link href={`/admin/orders/${m.orderId}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {m.orderId.slice(0, 12)}...
                  </Link>
                </td>
                <td className="p-3 font-mono text-xs">{m.cjOrderCode || "-"}</td>
                <td className="p-3">
                  <Badge className={statusColors[m.status] || "bg-gray-100"}>{m.status}</Badge>
                </td>
                <td className="p-3 text-xs">
                  {m.trackingNo ? (
                    <a href={m.trackingUrl || "#"} target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">{m.trackingNo}</a>
                  ) : "-"}
                </td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("ar-SA")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
