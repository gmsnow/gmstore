import { ensureValidToken, getCjCategories } from "../src/lib/cj-dropshipping";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^[-]+|[-]+$/g,"").substring(0,80);
}

async function main() {
  const settings = await prisma.cjSettings.findFirst();
  if (!settings?.apiKey) { console.error("No API key"); process.exit(1); }
  await ensureValidToken(settings.apiKey);
  const tree = await getCjCategories();

  // Build parent mapping: childSlug -> parentSlug
  const pairs: [string, string][] = [];
  for (const l1 of tree) {
    const l1Slug = slugify(l1.categoryFirstName);
    for (const l2 of l1.categoryFirstList) {
      pairs.push([slugify(l2.categorySecondName), l1Slug]);
      for (const l3 of l2.categorySecondList) {
        pairs.push([slugify(l3.categoryName), slugify(l2.categorySecondName)]);
      }
    }
  }

  // Get ID mapping for all these slugs
  const allSlugs = [...new Set(pairs.flat())];
  const cats = await prisma.category.findMany({ where: { slug: { in: allSlugs } } });
  const slugToId = new Map(cats.map((c) => [c.slug, c.id]));
  console.log(`Found ${cats.length} categories in DB for ${pairs.length} pairs`);

  // Build VALUES clause for raw SQL
  // UPDATE category c SET parent_id = v.parent_id::text::uuid FROM (VALUES ...) v WHERE c.id = v.id::uuid
  const updates: { id: string; parentId: string }[] = [];
  for (const [childSlug, parentSlug] of pairs) {
    const childId = slugToId.get(childSlug);
    const parentId = slugToId.get(parentSlug);
    if (childId && parentId) updates.push({ id: childId, parentId });
  }

  console.log(`Setting parentId for ${updates.length} categories via raw SQL...`);

  // Batch in transactions of 500
  for (let i = 0; i < updates.length; i += 500) {
    const batch = updates.slice(i, i + 500);
    const cases = batch.map((u) => `WHEN id = '${u.id}' THEN '${u.parentId}'`).join(" ");
    const ids = batch.map((u) => `'${u.id}'`).join(",");
    const sql = `UPDATE "Category" SET "parentId" = CASE ${cases} END WHERE id IN (${ids})`;
    await prisma.$executeRawUnsafe(sql);
    process.stdout.write(`\r  ${Math.min(i + 500, updates.length)}/${updates.length}`);
  }
  console.log("\nDone.");

  await prisma.cjSettings.update({
    where: { id: settings.id },
    data: { lastCategorySyncAt: new Date() },
  });
  await prisma.cjLog.create({
    data: { action: "SYNC_CATEGORIES", status: "SUCCESS", message: `Synced ${pairs.length + 14} categories`, synced: pairs.length + 14 },
  });
  console.log(`✅ Synced. ${updates.length} parent relationships set.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
