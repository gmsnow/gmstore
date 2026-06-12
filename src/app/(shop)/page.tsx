import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { SwipeableProductCard } from "@/components/shop/swipeable-product-card";
import { HeroSlider } from "@/components/shop/hero-slider";
import { localizedName } from "@/lib/i18n/localized";
import { getServerLocale } from "@/lib/i18n/server";

const productSelect = { id: true, name: true, nameEn: true, slug: true, price: true, images: true, colors: true, featured: true, stock: true, category: { select: { id: true, name: true, nameEn: true, slug: true } }, reviews: { select: { rating: true } } } as const;

export default async function HomePage() {
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id;
  const isLoggedIn = !!sessionUserId;
  const locale = await getServerLocale();

  const [rawFeatured, rawLatest, categories, userFavs] = await Promise.all([
    prisma.product.findMany({ where: { featured: true }, select: productSelect, take: 4 }),
    prisma.product.findMany({ select: productSelect, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.category.findMany({ select: { id: true, name: true, nameEn: true, slug: true, image: true, _count: { select: { products: true } } } }),
    isLoggedIn ? prisma.favorite.findMany({ where: { userId: sessionUserId }, select: { productId: true } }) : [],
  ]);
  const favoriteIds = new Set(isLoggedIn ? (userFavs as any[]).map((f: any) => f.productId) : []);
  const featured = (rawFeatured as any[]).map((p: any) => ({ ...p, price: Number(p.price) }));
  const latest = (rawLatest as any[]).map((p: any) => ({ ...p, price: Number(p.price) }));

  return (
    <>
      <HeroSlider />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      
      {categories.length > 0 && (
        <FadeInUp>
          <section className="bg-white rounded-2xl p-4 sm:p-5 dark:bg-card">
            <h2 className="text-lg font-bold mb-5">الفئات</h2>
            <div className="grid grid-flow-col grid-rows-3 gap-x-6 gap-y-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {(categories as any[]).map((cat: any) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="text-center group">
                  <div className="w-[70px] h-[70px] rounded-[25px] overflow-hidden mx-auto transition-transform duration-300 group-hover:scale-105 max-sm:w-[60px] max-sm:h-[60px]">
                    <img src={cat.image || ""} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-sm leading-tight text-[#222] dark:text-foreground">
                    {localizedName(cat, locale)}
                  </p>
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
    </>
  );
}
