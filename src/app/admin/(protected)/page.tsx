import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tags, ShoppingBag, DollarSign, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
import { T } from "@/components/translate";

interface MonthlyIncome {
  month: string;
  income: number;
}



function IncomeBarChart({ data, maxIncome }: { data: MonthlyIncome[]; maxIncome: number }) {
  return (
    <div className="flex items-end gap-3 h-48 pt-4">
      {data.map((d) => {
        const pct = maxIncome > 0 ? (d.income / maxIncome) * 100 : 0;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-xs font-semibold">{d.income.toFixed(0)}</span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary transition-all hover:opacity-80"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-xs text-muted-foreground">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminDashboard() {
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [productCount, categoryCount, orderCount, deliveredCount, dailyIncome, weeklyIncome, monthlyIncome, monthlyAgg] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count({ where: { status: { not: "DELIVERED" } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: startOfWeek } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: startOfMonth } } }),
    prisma.$queryRawUnsafe<Array<{ year: number; month: number; income: number }>>(
      `SELECT EXTRACT(YEAR FROM "createdAt")::int as year, EXTRACT(MONTH FROM "createdAt")::int as month, SUM("total")::float8 as income FROM "Order" WHERE "status" = 'DELIVERED' AND "createdAt" >= $1::timestamp GROUP BY year, month ORDER BY year, month`,
      sixMonthsAgo.toISOString(),
    ),
  ]);

  const monthlyMap = new Map<string, number>();
  for (const row of monthlyAgg) {
    monthlyMap.set(`${row.year}-${String(row.month).padStart(2, "0")}`, row.income);
  }

  const monthlyData: MonthlyIncome[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = (now.getMonth() - i + 12) % 12;
    const y = now.getMonth() - i < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    monthlyData.push({ month: monthNames[m], income: monthlyMap.get(key) || 0 });
  }
  const maxIncome = Math.max(...monthlyData.map((d) => d.income), 1);

  const stats = [
    { titleKey: "admin.products", value: productCount, icon: Package, color: "text-blue-600" },
    { titleKey: "admin.categories", value: categoryCount, icon: Tags, color: "text-green-600" },
    { titleKey: "admin.orders", value: orderCount, icon: ShoppingBag, color: "text-purple-600" },
    { titleKey: "admin.delivered_orders", value: deliveredCount, icon: CheckCircle, color: "text-emerald-600" },
  ];

  const incomeStats = [
    { titleKey: "admin.income_daily", value: Number(dailyIncome._sum.total || 0), icon: Calendar, color: "text-emerald-600" },
    { titleKey: "admin.income_weekly", value: Number(weeklyIncome._sum.total || 0), icon: TrendingUp, color: "text-orange-600" },
    { titleKey: "admin.income_monthly", value: Number(monthlyIncome._sum.total || 0), icon: DollarSign, color: "text-rose-600" },
  ];

  return (
    <FadeIn>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold"><T k="admin.dashboard" /></h1>
        <StaggerContainer className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.titleKey}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground"><T k={s.titleKey} /></CardTitle>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />الدخل الشهري (آخر 6 أشهر)</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeBarChart data={monthlyData} maxIncome={maxIncome} />
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold">الدخل</h2>
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {incomeStats.map((s) => (
            <StaggerItem key={s.titleKey}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground"><T k={s.titleKey} /></CardTitle>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{s.value.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">ريال</span></p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </FadeIn>
  );
}
