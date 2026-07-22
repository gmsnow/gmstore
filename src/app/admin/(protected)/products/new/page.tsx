import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function NewProductPage() {
  const [categories, existing, { t }] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ select: { slug: true } }),
    getServerTranslations(),
  ]);
  const existingSlugs = existing.map(p => p.slug);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.add_product")}</h1>
      <ProductForm categories={categories} existingSlugs={existingSlugs} />
    </div>
  );
}
