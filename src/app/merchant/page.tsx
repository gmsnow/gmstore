import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Package, Plus, DollarSign, TrendingUp, Layers, Eye, Pencil, Trash2, Tags, Crown, Clock, AlertCircle } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
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
      select: { id: true, name: true, nameEn: true, slug: true, price: true, images: true, stock: true, discount: true, dealEnd: true, category: { select: { id: true, name: true, nameEn: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold"><T k="merchant.title" /></h1>
          <Link href="/merchant/products/new"><Button><Plus className="ms-2 h-4 w-4" /><T k="merchant.add_product" /></Button></Link>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-4 grid-cols-2 md:grid-cols-4">
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
            <CardContent><p className="text-3xl font-bold">{totalValue.toFixed(0)} <T k="merchant.currency" /></p></CardContent>
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
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground"><T k="merchant.out_of_stock" /></CardTitle>
              <AlertCircle className={`h-5 w-5 ${outOfStock > 0 ? "text-red-500" : "text-green-500"}`} />
            </CardHeader>
            <CardContent><p className={`text-3xl font-bold ${outOfStock > 0 ? "text-red-500" : ""}`}>{outOfStock}</p></CardContent>
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold"><T k="merchant.my_products" /></h2>
        </div>
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
                <T k="merchant.no_products" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-44 bg-muted overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={localizedName(p, locale)} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/40">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 start-2 flex flex-col gap-1">
                    {p.discount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        -{p.discount}%
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        <T k="merchant.out_of_stock" />
                      </span>
                    )}
                    {p.dealEnd && new Date(p.dealEnd) > new Date() && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.ceil((new Date(p.dealEnd).getTime() - Date.now()) / 3600000)}h
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-bold line-clamp-1">{localizedName(p, locale)}</h3>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tags className="h-3 w-3" />
                    <span>{localizedName(p.category, locale)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {p.discount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-primary">{(Number(p.price) * (1 - p.discount / 100)).toFixed(0)} <T k="merchant.currency" /></span>
                          <span className="text-[10px] text-muted-foreground line-through">{Number(p.price).toFixed(0)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-primary">{Number(p.price).toFixed(0)} <T k="merchant.currency" /></span>
                      )}
                    </div>
                    <Badge variant={p.stock > 0 ? "success" : "danger"} className="text-[10px]">
                      {p.stock} <T k="merchant.in_stock" />
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-border">
                    <Link href={`/products/${p.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        <T k="merchant.view" />
                      </Button>
                    </Link>
                    <Link href={`/merchant/products/${p.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                        <Pencil className="h-3 w-3" />
                        <T k="merchant.edit" />
                      </Button>
                    </Link>
                    <DeleteProductButton productId={p.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
