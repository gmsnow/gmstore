import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ensureValidToken, searchCjProducts, getCjProductDetail, flattenCjProducts } from "@/lib/cj-dropshipping";
import type { CjProductListItem } from "@/lib/cj-dropshipping";

export const POST = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = await prisma.cjSettings.findFirst();
    if (!settings?.apiKey) return NextResponse.json({ error: "CJ API key not configured" }, { status: 400 });
    await ensureValidToken(settings.apiKey);

    const body = await req.json().catch(() => ({}));
    const keyword = body.keyword || "";
    const maxPages = Math.min(body.pages || 1, 10);
    const categorySlug = body.categorySlug || "";

    let results: CjProductListItem[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const data = await searchCjProducts({
        keyWord: keyword,
        page,
        size: 100,
        features: ["enable_description"],
      });
      results = results.concat(flattenCjProducts(data));
      if (data.pageNumber >= data.totalPages) break;
    }

    let imported = 0;
    let failed = 0;

    for (const item of results) {
      try {
        const detail = await getCjProductDetail(item.id);
        const mainImage = detail.productImageSet?.[0] || detail.bigImage || item.bigImage || "";
        const images = detail.productImageSet?.slice(0, 10) || [detail.bigImage, item.bigImage].filter(Boolean);

        const price = parseFloat(detail.sellPrice || item.sellPrice || "0");
        const priceYer = Math.round(price * 535);

        const slugBase = (detail.productNameEn || item.nameEn || "cj-product")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        const slug = `${slugBase}-${item.id.slice(-8)}`;

        const colors: string[] = [];
        const sizes: string[] = [];
        const specs: Record<string, string[]> = {};

        for (const v of detail.variants || []) {
          const key = v.variantKey || "";
          if (key.includes("/") || key.includes(",")) {
            const parts = key.split(/[/,]/).map((s: string) => s.trim()).filter(Boolean);
            parts.forEach((p: string) => {
              if (!colors.includes(p) && !sizes.includes(p)) {
                if (/\d/.test(p) && /(cm|mm|m|g|kg|oz|lb)/i.test(p)) sizes.push(p);
                else colors.push(p);
              }
            });
          } else {
            if (!colors.includes(key)) {
              if (/[a-zA-Z]/.test(key) && !/\d/.test(key.slice(0, 1))) colors.push(key);
              else sizes.push(key);
            }
          }
        }

        const existingProduct = await prisma.product.findFirst({ where: { slug } });
        const productData = {
          name: detail.productNameEn || item.nameEn,
          nameEn: detail.productNameEn || item.nameEn,
          slug,
          price: priceYer,
          images,
          description: detail.description || item.description || "",
          colors,
          sizes,
          stock: 999,
          userId: null,
          categoryId: body.categoryId || undefined,
        };

        const product = existingProduct
          ? await prisma.product.update({ where: { id: existingProduct.id }, data: productData })
          : await prisma.product.create({ data: productData as any });

        await prisma.cjProductMapping.upsert({
          where: { productId: product.id },
          update: { cjProductId: item.id, lastSyncAt: new Date() },
          create: { productId: product.id, cjProductId: item.id },
        });

        imported++;
      } catch {
        failed++;
      }
    }

    await prisma.cjLog.create({
      data: {
        action: "IMPORT_PRODUCTS",
        status: "SUCCESS",
        message: `Imported ${imported} products, ${failed} failed`,
        synced: imported,
        failed,
      },
    });

    return NextResponse.json({ success: true, imported, failed, total: results.length });
  } catch (e: any) {
    await prisma.cjLog.create({
      data: { action: "IMPORT_PRODUCTS", status: "FAILED", message: e.message },
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
});
