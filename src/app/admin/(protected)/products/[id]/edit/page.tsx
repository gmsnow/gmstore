import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  const plainProduct = { ...product, price: Number(product.price) };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تعديل المنتج</h1>
      <ProductForm categories={categories} product={plainProduct} />
    </div>
  );
}
