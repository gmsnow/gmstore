import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Search, X } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { LocalizedName } from "@/components/localized";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";
import { ProductFilters } from "@/components/shop/product-filters";

function serialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; featured?: string; q?: string; sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }> }) {
  const params = await searchParams;
  const locale = await getServerLocale();
  const where: any = {};
  const orderBy: any = { createdAt: "desc" };

  if (params.featured === "true") where.featured = true;
  if (params.category) where.category = { slug: params.category };
  if (params.q) {
    const q = params.q;
    where.OR = [
      { name: { contains: q } },
      { nameEn: { contains: q } },
      { description: { contains: q } },
      { descriptionEn: { contains: q } },
    ];
  }
  if (params.inStock === "true") where.stock = { gt: 0 };
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }
  if (params.sort === "price_asc") { orderBy.price = "asc"; delete orderBy.createdAt; }
  else if (params.sort === "price_desc") { orderBy.price = "desc"; delete orderBy.createdAt; }
  else if (params.sort === "name") { orderBy.name = "asc"; delete orderBy.createdAt; }

  const [rawProducts, rawCategories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true, reviews: { select: { rating: true } } }, orderBy }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const products = serialize(rawProducts);
  const categories = serialize(rawCategories);

  function filterUrl(overrides: Record<string, string | null | undefined>) {
    const p = new URLSearchParams();
    if (params.q) p.set("q", params.q);
    if (params.category && !("category" in overrides)) p.set("category", params.category);
    if (params.sort && params.sort !== "newest" && !("sort" in overrides)) p.set("sort", params.sort);
    if (params.minPrice && !("minPrice" in overrides)) p.set("minPrice", params.minPrice);
    if (params.maxPrice && !("maxPrice" in overrides)) p.set("maxPrice", params.maxPrice);
    if (params.inStock && !("inStock" in overrides)) p.set("inStock", params.inStock);
    if (params.featured && !("featured" in overrides)) p.set("featured", params.featured);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  function activeFilterTag(label: string, param: string) {
    return (
      <Link
        href={filterUrl({ [param]: null })}
        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-3 py-1 hover:bg-primary/20 transition-colors"
      >
        {label}
        <X className="h-3 w-3" />
      </Link>
    );
  }

  const activeTags: React.ReactNode[] = [];
  if (params.q) activeTags.push(activeFilterTag(`"${params.q}"`, "q"));
  if (params.category) {
    const cat = categories.find((c: any) => c.slug === params.category);
    if (cat) activeTags.push(activeFilterTag(localizedName(cat, locale), "category"));
  }
  if (params.inStock === "true") activeTags.push(activeFilterTag(locale === "en" ? "In stock" : "متوفر", "inStock"));
  if (params.featured === "true") activeTags.push(activeFilterTag(locale === "en" ? "Featured" : "مميز", "featured"));
  if (params.minPrice) activeTags.push(activeFilterTag(`≥ ${params.minPrice}`, "minPrice"));
  if (params.maxPrice) activeTags.push(activeFilterTag(`≤ ${params.maxPrice}`, "maxPrice"));
  if (params.sort && params.sort !== "newest") {
    const sortLabels: Record<string, string> = { price_asc: locale === "en" ? "Price ↑" : "السعر ↑", price_desc: locale === "en" ? "Price ↓" : "السعر ↓", name: locale === "en" ? "Name" : "الاسم" };
    activeTags.push(activeFilterTag(sortLabels[params.sort] || params.sort, "sort"));
  }

  return (
    <FadeIn>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {params.q ? (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Search className="h-6 w-6" />
              <T k="products.search_results" />: &quot;{params.q}&quot;
            </h1>
            <p className="text-sm text-muted-foreground">
              {products.length} <T k="products.search_count" />
            </p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold mb-8"><T k="products.title" /></h1>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <ProductFilters categories={categories} />
          {activeTags.length > 0 && (
            <Link href="/products" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              <T k="products.clear_filters" />
            </Link>
          )}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeTags}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={filterUrl({ category: null })}
            className={`rounded-full px-4 py-1.5 text-sm border border-border transition-colors ${!params.category ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
          >
            <T k="products.all" />
          </Link>
          {categories.map((c: any) => (
            <Link
              key={c.id}
              href={filterUrl({ category: c.slug })}
              className={`rounded-full px-4 py-1.5 text-sm border border-border transition-colors ${params.category === c.slug ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
            >
              <LocalizedName item={c} />
            </Link>
          ))}
        </div>
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p: any) => (
            <StaggerItem key={p.id}>
              <Link href={`/products/${p.slug}`}>
                <HoverCard>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><T k="product.no_image" /></div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <Badge variant="outline"><LocalizedName item={p.category} /></Badge>
                      <h3 className="font-semibold truncate"><LocalizedName item={p} /></h3>
                      {p.reviews?.length > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(p.reviews.reduce((a: number, r: any) => a + r.rating, 0) / p.reviews.length) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                          <span className="text-xs text-muted-foreground">({p.reviews.length})</span>
                        </div>
                      )}
                      {p.colors?.length > 0 && (
                        <div className="flex gap-1">
                          {p.colors.slice(0, 5).map((c: string) => (
                            <div key={c} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />
                          ))}
                          {p.colors.length > 5 && <span className="text-[10px] text-muted-foreground self-center">+{p.colors.length - 5}</span>}
                        </div>
                      )}
                      <p className="text-lg font-bold text-primary">{Number(p.price).toFixed(2)} ريال</p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </Link>
            </StaggerItem>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12"><T k="products.empty" /></p>
          )}
        </StaggerContainer>
      </div>
    </FadeIn>
  );
}
