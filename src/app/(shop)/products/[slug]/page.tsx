import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { ProductTrust } from "@/components/shop/product-trust";
import { ProductSpecs } from "@/components/shop/product-specs";
import { DeliveryEstimate } from "@/components/shop/delivery-estimate";
import { FrequentlyBoughtTogether } from "@/components/shop/frequently-bought-together";
import { CompareButton } from "@/components/shop/compare-button";
import { CurrencyToggle } from "@/components/shop/currency-toggle";
import { CountdownTimer } from "@/components/shop/countdown-timer";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { FadeIn, FadeInUp } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName, localizedDescription } from "@/lib/i18n/localized";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true }, orderBy: { createdAt: "desc" } });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const session = await auth();
  const serverFavs = session?.user
    ? await prisma.favorite.findMany({ where: { userId: (session.user as any).id }, select: { productId: true } })
    : [];
  const favoriteIds = new Set(serverFavs.map((f) => f.productId));

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true, name: true, nameEn: true, slug: true, price: true,
      images: true, colors: true, sizes: true, stock: true, description: true, descriptionEn: true, videoUrl: true, userId: true, discount: true, dealEnd: true, specs: true, colorImages: true, colorStock: true,
      category: { select: { id: true, name: true, nameEn: true, slug: true } },
    },
  });
  if (!product) notFound();

  const relatedRaw = await prisma.product.findMany({
    where: { categoryId: product.category.id, id: { not: product.id } },
    select: {
      id: true, name: true, nameEn: true, slug: true, price: true,
      images: true, colors: true, sizes: true, featured: true, stock: true, discount: true, dealEnd: true,
      brand: true, brandLogo: true,
      category: { select: { id: true, name: true, nameEn: true, slug: true } },
      reviews: { select: { rating: true } },
    },
    take: 8,
  });
  const related = relatedRaw.map(r => ({ ...r, price: Number(r.price) }));

  const cartProduct = { id: product.id, name: localizedName(product, locale), price: Number(product.price), images: product.images, stock: product.stock };
  const sessionUserId = (session?.user as any)?.id;
  const isLoggedIn = !!sessionUserId;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
  const isOwner = role === "MERCHANT" && product.userId === sessionUserId;
  const canManage = isAdmin || isOwner;
  const specs = product.specs as Record<string, string> | null;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <FadeIn>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {canManage && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <span className="text-sm font-medium text-muted-foreground">لوحة التحكم:</span>
            <Link href={isOwner ? `/merchant/products/${product.id}/edit` : `/admin/products/${product.id}/edit`}>
              <Button variant="outline" size="sm">تعديل المنتج</Button>
            </Link>
            <DeleteProductButton productId={product.id} redirectTo={isOwner ? "/merchant" : "/admin/products"} />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} videoUrl={product.videoUrl} alt={localizedName(product, locale)} />
          <FadeInUp delay={0.15}>
            <div className="space-y-5">
              <Badge>{localizedName(product.category, locale)}</Badge>
              <h1 className="text-3xl font-bold">{localizedName(product, locale)}</h1>

              <div className="flex items-center justify-between">
                {product.discount > 0 ? (
                  <div>
                    <CurrencyToggle priceYer={Number(product.price)} />
                    <p className="text-xs text-muted-foreground">توفير {product.discount}%</p>
                  </div>
                ) : (
                  <CurrencyToggle priceYer={Number(product.price)} />
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">{localizedDescription(product, locale)}</p>

              {product.dealEnd && new Date(product.dealEnd) > new Date() && (
                <div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">العرض ينتهي خلال:</span>
                  <CountdownTimer target={product.dealEnd.toISOString()} />
                </div>
              )}

              <DeliveryEstimate />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground"><T k="detail.stock" /></span>
                  <Badge variant={product.stock > 0 ? "success" : "danger"}>
                    {product.stock > 0 ? <T k="detail.in_stock" /> : <T k="detail.not_available" />}
                  </Badge>
                </div>
                {lowStock && (
                  <p className="text-xs text-amber-600">لم يتبق سوى {product.stock} قطع</p>
                )}
              </div>

              <ProductActions product={cartProduct} colors={product.colors} sizes={product.sizes} stock={product.stock} colorStock={product.colorStock as Record<string, number> | null} colorImages={product.colorImages as Record<string, string> | null} />

              <div className="flex items-center gap-2">
                <CompareButton productId={product.id} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors" />
                <span className="text-sm text-muted-foreground"><T k="comparison.add" /></span>
              </div>
            </div>
          </FadeInUp>
        </div>

        {specs && Object.keys(specs).length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4"><T k="detail.specs" /></h2>
            <ProductSpecs specs={specs} />
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-6"><T k="detail.why_trust" /></h2>
          <ProductTrust />
        </section>

        <ProductReviews productId={product.id} sessionUserId={sessionUserId} />

        <FrequentlyBoughtTogether productId={product.id} isLoggedIn={isLoggedIn} favoriteIds={favoriteIds} />

        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6"><T k="detail.also_like" /></h2>
            <ProductCarousel products={related} isLoggedIn={!!session} />
          </section>
        )}
      </div>
    </FadeIn>
  );
}
