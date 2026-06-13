import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Search, X } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { LocalizedName } from "@/components/localized";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";
import { ProductFilters } from "@/components/shop/product-filters";
import { SwipeableProductCard } from "@/components/shop/swipeable-product-card";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; featured?: string; q?: string; sort?: string; minPrice?: string; maxPrice?: string; inStock?: string; brand?: string; color?: string; size?: string; minRating?: string; newArrivals?: string; onSale?: string }> }) {
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
  if (params.brand) where.brand = params.brand;
  if (params.color) where.colors = { has: params.color };
  if (params.size) where.sizes = { has: params.size };
  if (params.minRating) where.reviews = { some: { rating: { gte: parseInt(params.minRating) } } };
  if (params.newArrivals === "true") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    where.createdAt = { gte: thirtyDaysAgo };
  }
  if (params.onSale === "true") where.discount = { gt: 0 };

  if (params.sort === "price_asc") { orderBy.price = "asc"; delete orderBy.createdAt; }
  else if (params.sort === "price_desc") { orderBy.price = "desc"; delete orderBy.createdAt; }
  else if (params.sort === "name") { orderBy.name = "asc"; delete orderBy.createdAt; }
  else if (params.sort === "discount_asc") { orderBy.discount = "asc"; delete orderBy.createdAt; }
  else if (params.sort === "discount_desc") { orderBy.discount = "desc"; delete orderBy.createdAt; }

  const productSelect = { id: true, name: true, nameEn: true, slug: true, price: true, images: true, colors: true, sizes: true, featured: true, stock: true, discount: true, brand: true, brandLogo: true, createdAt: true, category: { select: { id: true, name: true, nameEn: true, slug: true } }, reviews: { select: { rating: true } } } as const;

  const [products, categories, brands, colorRows, sizeRows, userFavs] = await Promise.all([
    prisma.product.findMany({ where, select: productSelect, orderBy }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }),
    prisma.product.findMany({ select: { colors: true } }),
    prisma.product.findMany({ select: { sizes: true } }),
    isLoggedIn ? prisma.favorite.findMany({ where: { userId: sessionUserId }, select: { productId: true } }) : [],
  ]);
  const uniqueBrands = brands.map((b: any) => b.brand).filter(Boolean);
  const uniqueColors = [...new Set(colorRows.flatMap((r: any) => r.colors))].sort();
  const uniqueSizes = [...new Set(sizeRows.flatMap((r: any) => r.sizes))].sort();
  const favoriteIds = new Set(isLoggedIn ? (userFavs as any[]).map((f: any) => f.productId) : []);
  const productList = (products as any[]).map((p: any) => ({ ...p, price: Number(p.price) }));

  function filterUrl(overrides: Record<string, string | null | undefined>) {
    const p = new URLSearchParams();
    const preserveKeys = ["q", "category", "sort", "minPrice", "maxPrice", "inStock", "featured", "brand", "color", "size", "minRating", "newArrivals", "onSale"];
    for (const key of preserveKeys) {
      if ((params as any)[key] && !(key in overrides)) p.set(key, (params as any)[key]);
    }
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
        key={param}
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
  if (params.brand) activeTags.push(activeFilterTag(params.brand, "brand"));
  if (params.color) activeTags.push(activeFilterTag(params.color, "color"));
  if (params.size) activeTags.push(activeFilterTag(params.size, "size"));
  if (params.minRating) activeTags.push(activeFilterTag(`★${params.minRating}+`, "minRating"));
  if (params.newArrivals === "true") activeTags.push(activeFilterTag(locale === "en" ? "New" : "جديد", "newArrivals"));
  if (params.onSale === "true") activeTags.push(activeFilterTag(locale === "en" ? "Sale" : "خصم", "onSale"));
  if (params.sort && params.sort !== "newest") {
    const sortLabels: Record<string, string> = {
      price_asc: locale === "en" ? "Price ↑" : "السعر ↑",
      price_desc: locale === "en" ? "Price ↓" : "السعر ↓",
      name: locale === "en" ? "Name" : "الاسم",
      discount_asc: locale === "en" ? "Discount ↑" : "الخصم ↑",
      discount_desc: locale === "en" ? "Discount ↓" : "الخصم ↓",
    };
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
          <ProductFilters categories={categories} brands={uniqueBrands} colors={uniqueColors} sizes={uniqueSizes} />
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
