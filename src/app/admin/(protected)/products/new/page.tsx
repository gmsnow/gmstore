import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [categories, existing] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ select: { slug: true } }),
  ]);
  const existingSlugs = existing.map(p => p.slug);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة منتج جديد</h1>
      <ProductForm categories={categories} existingSlugs={existingSlugs} />
    </div>
  );
}
