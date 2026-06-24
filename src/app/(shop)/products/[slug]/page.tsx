import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ProductGallery } from "@/components/shop/product-gallery";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { FadeIn, FadeInUp } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName, localizedDescription } from "@/lib/i18n/localized";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const session = await auth();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) notFound();

  const cartProduct = { id: product.id, name: localizedName(product, locale), price: Number(product.price), images: product.images, stock: product.stock };
  const sessionUserId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "MERCHANT";

  return (
    <FadeIn>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {isAdmin && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <span className="text-sm font-medium text-muted-foreground">لوحة التحكم:</span>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Button variant="outline" size="sm">تعديل المنتج</Button>
            </Link>
            <DeleteProductButton productId={product.id} redirectTo="/admin/products" />
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} videoUrl={product.videoUrl} alt={localizedName(product, locale)} />
          <FadeInUp delay={0.15}>
            <div className="space-y-6">
              <Badge>{localizedName(product.category, locale)}</Badge>
              <h1 className="text-3xl font-bold">{localizedName(product, locale)}</h1>
              <p className="text-3xl font-bold text-primary">{Number(product.price).toFixed(2)} ريال</p>
              <p className="text-muted-foreground leading-relaxed">{localizedDescription(product, locale)}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground"><T k="detail.stock" /></span>
                <Badge variant={product.stock > 0 ? "success" : "danger"}>
                  {product.stock > 0 ? `${product.stock}` : <T k="detail.not_available" />}
                </Badge>
              </div>
              <ProductActions product={cartProduct} colors={product.colors} sizes={product.sizes ?? []} stock={product.stock} />
            </div>
          </FadeInUp>
        </div>
        <ProductReviews productId={product.id} sessionUserId={sessionUserId} />
      </div>
    </FadeIn>
  );
}
