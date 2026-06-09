import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { LocalizedName } from "@/components/localized";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";
import { ProductFilters } from "@/components/shop/product-filters";
import { SwipeableProductCard } from "@/components/shop/swipeable-product-card";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; featured?: string; q?: string; sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }> }) {
  const params = await searchParams;
  const locale = await getServerLocale();
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id;
  const isLoggedIn = !!sessionUserId;
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

  const productSelect = { id: true, name: true, nameEn: true, slug: true, price: true, images: true, colors: true, featured: true, stock: true, category: { select: { id: true, name: true, nameEn: true, slug: true } }, reviews: { select: { rating: true } } } as const;

  const [products, categories, userFavs] = await Promise.all([
    prisma.product.findMany({ where, select: productSelect, orderBy }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    isLoggedIn ? prisma.favorite.findMany({ where: { userId: sessionUserId }, select: { productId: true } }) : [],
  ]);
  const favoriteIds = new Set(isLoggedIn ? (userFavs as any[]).map((f: any) => f.productId) : []);
  const productList = (products as any[]).map((p: any) => ({ ...p, price: Number(p.price) }));

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
              {productList.length} <T k="products.search_count" />
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
        <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {productList.map((p: any) => (
            <StaggerItem key={p.id}>
              <SwipeableProductCard product={p} isLoggedIn={isLoggedIn} favoriteIds={favoriteIds} />
            </StaggerItem>
          ))}
          {productList.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12"><T k="products.empty" /></p>
          )}
        </StaggerContainer>
      </div>
    </FadeIn>
  );
}
