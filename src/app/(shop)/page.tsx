import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { LocalizedName, LocalizedDesc } from "@/components/localized";

function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
}

export default async function HomePage() {
  const [rawFeatured, rawLatest] = await Promise.all([
    prisma.product.findMany({ where: { featured: true }, include: { category: true, reviews: { select: { rating: true } } }, take: 4 }),
    prisma.product.findMany({ include: { category: true, reviews: { select: { rating: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const featured = serialize(rawFeatured);
  const latest = serialize(rawLatest);

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

      {featured.length > 0 && (
        <FadeInUp>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold"><T k="home.featured" /></h2>
            <Link href="/products?featured=true" className="text-sm text-primary hover:underline"><T k="home.view_all" /></Link>
            </div>
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p: any) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
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
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((p: any) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </FadeInUp>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const avgRating = product.reviews?.length ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length : 0;
  return (
    <Link href={`/products/${product.slug}`}>
      <HoverCard>
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-muted">
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><T k="product.no_image" /></div>
            )}
          </div>
          <CardContent className="p-4 space-y-2">
            <Badge variant="outline"><LocalizedName item={product.category} /></Badge>
            <h3 className="font-semibold truncate"><LocalizedName item={product} /></h3>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                ))}
                <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div className="flex gap-1">
                {product.colors.slice(0, 5).map((c: string) => (
                  <div key={c} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />
                ))}
                {product.colors.length > 5 && <span className="text-[10px] text-muted-foreground self-center">+{product.colors.length - 5}</span>}
              </div>
            )}
            <p className="text-lg font-bold text-primary">{Number(product.price).toFixed(2)} ريال</p>
          </CardContent>
        </Card>
      </HoverCard>
    </Link>
  );
}
