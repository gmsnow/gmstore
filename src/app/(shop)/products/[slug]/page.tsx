import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
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

async function ProductInfo({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return product;
}

async function ProductDetails({ slug, locale, sessionUserId, isLoggedIn, isAdmin, isOwner }: { slug: string; locale: any; sessionUserId: string | undefined; isLoggedIn: boolean; isAdmin: boolean; isOwner: boolean }) {
  const product = await ProductInfo({ slug });
  const canManage = isAdmin || isOwner;
  const cartProduct = { id: product.id, name: localizedName(product, locale), price: Number(product.price), images: product.images, stock: product.stock };
  const specs = product.specs as Record<string, string> | null;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
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

            {localizedDescription(product, locale) ? (
              <div className="text-muted-foreground leading-relaxed space-y-3 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:h-auto [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: localizedDescription(product, locale)! }} />
            ) : null}

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
    </div>
  );
}

async function RelatedSection({ productId, categoryId }: { productId: string; categoryId: string | null }) {
  if (!categoryId) return null;
  const relatedRaw = await getRelatedProducts(categoryId, productId);
  if (relatedRaw.length === 0) return null;
  const related = relatedRaw.map(r => ({ ...r, price: Number(r.price) }));
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6"><T k="detail.also_like" /></h2>
      <ProductCarousel products={related} isLoggedIn={true} />
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 animate-pulse">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square bg-muted rounded-xl" />
        <div className="space-y-4">
          <div className="h-6 w-24 bg-muted rounded" />
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id;
  const isLoggedIn = !!sessionUserId;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";

  const serverFavs = session?.user
    ? await prisma.favorite.findMany({ where: { userId: (session.user as any).id }, select: { productId: true } })
    : [];
  const favoriteIds = new Set(serverFavs.map((f) => f.productId));

  // Quick check if product exists without loading full data
  const productExists = await prisma.product.findUnique({ where: { slug }, select: { id: true, userId: true, categoryId: true } });
  if (!productExists) notFound();

  const isOwner = role === "MERCHANT" && productExists.userId === sessionUserId;

  return (
    <FadeIn>
      <Suspense fallback={<DetailSkeleton />}>
        <ProductDetails slug={slug} locale={locale} sessionUserId={sessionUserId} isLoggedIn={isLoggedIn} isAdmin={isAdmin} isOwner={isOwner} />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        <Suspense fallback={<div className="h-40 bg-muted rounded-xl animate-pulse" />}>
          <ProductReviews productId={productExists.id} sessionUserId={sessionUserId} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FrequentlyBoughtTogether productId={productExists.id} isLoggedIn={isLoggedIn} favoriteIds={favoriteIds} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <RelatedSection productId={productExists.id} categoryId={productExists.categoryId} />
        </Suspense>
      </div>
    </FadeIn>
  );
}
