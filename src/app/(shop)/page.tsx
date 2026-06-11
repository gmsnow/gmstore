import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { SwipeableProductCard } from "@/components/shop/swipeable-product-card";
import { PromoBanner } from "@/components/shop/promo-banner";

const productSelect = { id: true, name: true, nameEn: true, slug: true, price: true, images: true, colors: true, featured: true, stock: true, category: { select: { id: true, name: true, nameEn: true, slug: true } }, reviews: { select: { rating: true } } } as const;

export default async function HomePage() {
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id;
  const isLoggedIn = !!sessionUserId;

  const [rawFeatured, rawLatest, categories, userFavs] = await Promise.all([
    prisma.product.findMany({ where: { featured: true }, select: productSelect, take: 4 }),
    prisma.product.findMany({ select: productSelect, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.category.findMany({ select: { id: true, name: true, nameEn: true, slug: true, image: true }, take: 6 }),
    isLoggedIn ? prisma.favorite.findMany({ where: { userId: sessionUserId }, select: { productId: true } }) : [],
  ]);
  const favoriteIds = new Set(isLoggedIn ? (userFavs as any[]).map((f: any) => f.productId) : []);
  const featured = (rawFeatured as any[]).map((p: any) => ({ ...p, price: Number(p.price) }));
  const latest = (rawLatest as any[]).map((p: any) => ({ ...p, price: Number(p.price) }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <FadeIn>
        <section className="text-center space-y-4 py-12">
          <h1 className="text-4xl font-bold tracking-tight"><T k="home.hero_title" /></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <T k="home.hero_desc" />
          </p>
          <Link href="/products">
            <Button size="lg"><ArrowLeft className="ml-2 h-4 w-4" /><T k="home.shop_now" /></Button>
          </Link>
        </section>
      </FadeIn>

      <FadeInUp>
        <PromoBanner />
      </FadeInUp>

      {categories.length > 0 && (
        <FadeInUp>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold"><T k="nav.categories" /></h2>
              <Link href="/categories" className="text-sm text-primary hover:underline"><T k="home.view_all" /></Link>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted relative">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-muted-foreground">📁</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="text-white font-bold text-xs drop-shadow-lg truncate">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </FadeInUp>
      )}

      {featured.length > 0 && (
        <FadeInUp>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold"><T k="home.featured" /></h2>
            <Link href="/products?featured=true" className="text-sm text-primary hover:underline"><T k="home.view_all" /></Link>
            </div>
            <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {featured.map((p: any) => (
                <StaggerItem key={p.id}>
                  <SwipeableProductCard product={p} isLoggedIn={isLoggedIn} favoriteIds={favoriteIds} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </FadeInUp>
      )}

      <FadeInUp delay={0.15}>
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold"><T k="home.latest" /></h2>
          <Link href="/products" className="text-sm text-primary hover:underline"><T k="home.view_all" /></Link>
          </div>
          <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {latest.map((p: any) => (
              <StaggerItem key={p.id}>
                <SwipeableProductCard product={p} isLoggedIn={isLoggedIn} favoriteIds={favoriteIds} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </FadeInUp>
    </div>
  );
}
