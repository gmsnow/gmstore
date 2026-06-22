import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ensureValidToken, getCjCategories, getCjProductDetail } from "@/lib/cj-dropshipping";

export const POST = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = await prisma.cjSettings.findFirst();
    if (!settings?.apiKey) return NextResponse.json({ error: "CJ API key not configured" }, { status: 400 });
    await ensureValidToken(settings.apiKey);
    const tree = await getCjCategories();
    let synced = 0;
    for (const l1 of tree) {
      const l1Slug = slugify(l1.categoryFirstName);
      const l1Cat = await prisma.category.upsert({
        where: { slug: l1Slug },
        update: { nameEn: l1.categoryFirstName },
        create: { name: l1.categoryFirstName, nameEn: l1.categoryFirstName, slug: l1Slug },
      });
      for (const l2 of l1.categoryFirstList) {
        const l2Slug = slugify(l2.categorySecondName);
        const l2Cat = await prisma.category.upsert({
          where: { slug: l2Slug },
          update: { nameEn: l2.categorySecondName, parentId: l1Cat.id },
          create: { name: l2.categorySecondName, nameEn: l2.categorySecondName, slug: l2Slug, parentId: l1Cat.id },
        });
        for (const l3 of l2.categorySecondList) {
          const l3Slug = slugify(l3.categoryName);
          await prisma.category.upsert({
            where: { slug: l3Slug },
            update: { nameEn: l3.categoryName, parentId: l2Cat.id },
            create: { name: l3.categoryName, nameEn: l3.categoryName, slug: l3Slug, parentId: l2Cat.id },
          });
          synced++;
        }
      }
    }
    await prisma.cjSettings.update({
      where: { id: settings.id },
      data: { lastCategorySyncAt: new Date() },
    });
    await prisma.cjLog.create({
      data: { action: "SYNC_CATEGORIES", status: "SUCCESS", message: `Synced ${synced} categories`, synced },
    });
    return NextResponse.json({ success: true, synced });
  } catch (e: any) {
    await prisma.cjLog.create({
      data: { action: "SYNC_CATEGORIES", status: "FAILED", message: e.message },
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-]+|[-]+$/g, "")
    .substring(0, 80);
}
