import { cache } from "react";
import { prisma } from "@/lib/prisma";

const productSelect = { id: true, name: true, nameEn: true, slug: true, price: true, images: true, colors: true, featured: true, stock: true, discount: true, dealEnd: true, brand: true, brandLogo: true, category: { select: { id: true, name: true, nameEn: true, slug: true } }, reviews: { select: { rating: true } } } as const;

const CACHE_TTL = 60_000;
const cacheStore = new Map<string, { data: unknown; expiry: number }>();

function withTtl<T>(key: string, fn: () => Promise<T>, ttl = CACHE_TTL): Promise<T> {
  const cached = cacheStore.get(key);
  if (cached && cached.expiry > Date.now()) return Promise.resolve(cached.data as T);
  return fn().then((data) => {
    cacheStore.set(key, { data, expiry: Date.now() + ttl });
    return data;
  });
}

export async function getFeaturedProducts() {
  return withTtl("featured", cache(() =>
    prisma.product.findMany({ where: { featured: true }, select: productSelect, take: 4 })
  ));
}

export async function getLatestProducts() {
  return withTtl("latest", cache(() =>
    prisma.product.findMany({ select: productSelect, orderBy: { createdAt: "desc" }, take: 8 })
  ));
}

export async function getCategories() {
  return withTtl("categories", cache(() =>
    prisma.category.findMany({ select: { id: true, name: true, nameEn: true, slug: true, image: true, _count: { select: { products: true } } } })
  ), 300_000);
}

export async function getBestSellers() {
  return withTtl("bestSellers", cache(async () => {
    const bestRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    });
    const bestIds = bestRaw.map((b) => b.productId);
    if (bestIds.length === 0) return [];
    const bestProducts = await prisma.product.findMany({ where: { id: { in: bestIds } }, select: productSelect });
    const bestMap = new Map(bestProducts.map((p) => [p.id, p]));
    return bestIds.map((id) => bestMap.get(id)).filter(Boolean);
  }));
}

export async function getDealProducts() {
  return withTtl("deals", cache(() =>
    prisma.product.findMany({
      where: { discount: { gt: 0 } },
      select: productSelect,
      orderBy: { discount: "desc" },
      take: 8,
    })
  ));
}

export async function getActiveBanners() {
  return withTtl("banners", cache(() =>
    prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" } })
  ), 300_000);
}