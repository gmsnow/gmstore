import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Package, Plus, DollarSign, TrendingUp, Layers } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";

export default async function MerchantDashboard() {
  const locale = await getServerLocale();
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== "MERCHANT") redirect("/login");

  const userId = (session.user as any).id;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      select: { id: true, name: true, nameEn: true, slug: true, price: true, stock: true, category: { select: { id: true, name: true, nameEn: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold"><T k="merchant.title" /></h1>
          <Link href="/merchant/products/new"><Button><Plus className="ml-2 h-4 w-4" /><T k="merchant.add_product" /></Button></Link>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-4 md:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground"><T k="merchant.total_products" /></CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{products.length}</p></CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground"><T k="merchant.stock_value" /></CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{totalValue.toFixed(2)} <T k="merchant.currency" /></p></CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground"><T k="merchant.total_stock" /></CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{totalStock}</p></CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <FadeIn>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Layers className="h-5 w-5" /><T k="merchant.categories_title" /></h2>
          <div className="flex flex-wrap gap-3">
            {categories.length === 0 ? (
              <p className="text-muted-foreground"><T k="merchant.no_categories" /></p>
            ) : (
              categories.map((c) => (
                <Badge key={c.id} variant="outline" className="px-4 py-2 text-sm">{localizedName(c, locale)}</Badge>
              ))
            )}
          </div>
        </div>
      </FadeIn>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold"><T k="merchant.my_products" /></h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
                <T k="merchant.no_products" />
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><T k="merchant.product_name" /></TableHead>
                <TableHead><T k="merchant.price" /></TableHead>
                <TableHead><T k="merchant.category" /></TableHead>
                <TableHead><T k="merchant.stock" /></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{localizedName(p, locale)}</TableCell>
                  <TableCell>{Number(p.price).toFixed(2)} <T k="merchant.currency" /></TableCell>
                  <TableCell>{localizedName(p.category, locale)}</TableCell>
                  <TableCell><Badge variant={p.stock > 0 ? "success" : "danger"}>{p.stock}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/merchant/products/${p.id}/edit`}>
                        <Button variant="outline" size="sm"><T k="merchant.edit" /></Button>
                      </Link>
                      <DeleteProductButton productId={p.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
