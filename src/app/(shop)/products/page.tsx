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

        <div className="grid grid-flow-col grid-rows-2 gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none auto-cols-[72px]">
          <Link
            href={filterUrl({ category: null })}
            className={`flex flex-col items-center gap-0.5 rounded-2xl border p-1.5 transition-all ${!params.category ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            </div>
            <div className="text-[9px] font-medium truncate w-full text-center leading-tight"><T k="products.all" /></div>
          </Link>
          {categories.map((c: any) => (
            <Link
              key={c.id}
              href={filterUrl({ category: c.slug })}
              className={`flex flex-col items-center gap-0.5 rounded-2xl border p-1.5 transition-all ${params.category === c.slug ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
            >
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                {c.image ? (
                  <img src={c.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                  </div>
                )}
              </div>
              <div className="text-[9px] font-medium truncate w-full text-center leading-tight"><LocalizedName item={c} /></div>
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
