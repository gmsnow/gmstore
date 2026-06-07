import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تعديل الفئة</h1>
      <CategoryForm category={category} />
    </div>
  );
}
