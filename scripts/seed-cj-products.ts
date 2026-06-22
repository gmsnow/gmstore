/**
 * CLI script to import products from CJ Dropshipping.
 *
 * Usage:
 *   npx tsx scripts/seed-cj-products.ts --keyword "phone" --pages 2 --categoryId <optional>
 *
 * Environment variables required:
 *   DATABASE_URL  — PostgreSQL connection string
 *   CJ_API_KEY    — CJ Dropshipping API key (or pass via --apiKey)
 */

import { PrismaClient } from "@prisma/client";
import {
  ensureValidToken,
  getAccessToken,
  searchCjProducts,
  getCjProductDetail,
  flattenCjProducts,
} from "../src/lib/cj-dropshipping";
import type { CjProductListItem } from "../src/lib/cj-dropshipping";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const map = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      map.set(key, args[i + 1] || "");
      if (args[i + 1] && !args[i + 1].startsWith("--")) i++;
    }
  }
  return {
    keyword: map.get("keyword") || "",
    pages: Math.min(Number(map.get("pages")) || 1, 10),
    categoryId: map.get("categoryId") || "",
    apiKey: map.get("apiKey") || process.env.CJ_API_KEY || "",
  };
}

async function main() {
  const args = parseArgs();

  if (!args.apiKey) {
    console.error("❌ CJ_API_KEY required. Set CJ_API_KEY env or pass --apiKey");
    process.exit(1);
  }

  console.log("🔑 Authenticating with CJ Dropshipping...");
  await ensureValidToken(args.apiKey);
  console.log("✅ Authenticated");

  let allResults: CjProductListItem[] = [];
  for (let page = 1; page <= args.pages; page++) {
    console.log(`📦 Fetching page ${page}/${args.pages}...`);
    const data = await searchCjProducts({
      keyWord: args.keyword,
      page,
      size: 100,
      features: ["enable_description"],
    });
    allResults = allResults.concat(flattenCjProducts(data));
    console.log(`   Found ${data.content?.length || 0} items (total: ${data.totalRecords})`);
    if (page >= data.totalPages) break;
  }

  // Build category lookup table once
  const allCats = await prisma.category.findMany({ select: { id: true, nameEn: true, slug: true } });
  const catByName = new Map<string, string>();
  for (const c of allCats) {
    const key = (c.nameEn || c.slug || "").toLowerCase().trim();
    if (key) catByName.set(key, c.id);
  }
  const fallbackCatId = allCats[0]?.id || "";

  console.log(`\n📋 Total products to import: ${allResults.length}`);
  let imported = 0;
  let failed = 0;

  for (const item of allResults) {
    try {
      console.log(`   ⏳ Importing: ${item.nameEn} (${item.id})`);
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
        categoryId: catByName.get((detail.categoryName || "").toLowerCase().trim()) || fallbackCatId,
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
      console.log(`   ✅ Imported: ${item.nameEn}`);
    } catch (err: any) {
      failed++;
      console.error(`   ❌ Failed: ${item.nameEn} — ${err.message}`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Imported: ${imported}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`📦 Total:    ${allResults.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
