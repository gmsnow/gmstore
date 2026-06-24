import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug param required" });
  }

  const normalized = slug.normalize("NFC");
  const uniques = [slug, normalized].map((s) => s);
  const results: any[] = [];

  for (const s of uniques) {
    const product = await prisma.product.findFirst({ where: { slug: s }, select: { id: true, name: true, slug: true } });
    results.push({ query: s, found: !!product, product });
  }

  const allProducts = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });

  return NextResponse.json({
    slugReceived: slug,
    slugNormalized: normalized,
    slugEqualsNormalized: slug === normalized,
    slugChars: [...slug].map(c => c.codePointAt(0)?.toString(16)),
    normalizedChars: [...normalized].map(c => c.codePointAt(0)?.toString(16)),
    queries: results,
    totalProducts: allProducts.length,
    allSlugs: allProducts.map(p => ({ id: p.id, name: p.name, slug: p.slug, slugChars: [...p.slug].map(c => c.codePointAt(0)?.toString(16)) })),
  });
};
