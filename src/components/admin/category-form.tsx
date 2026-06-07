"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  category?: { id: string; name: string; nameEn?: string | null; slug: string; description?: string | null };
}

export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = { name: form.get("name"), nameEn: form.get("nameEn"), slug: form.get("slug"), description: form.get("description") };
    const url = category ? `/api/categories/${category.id}` : "/api/categories";
    const method = category ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Input id="name" name="name" label="اسم الفئة (عربي)" defaultValue={category?.name} required />
      <Input id="nameEn" name="nameEn" label="Category Name (English)" defaultValue={category?.nameEn ?? ""} />
      <Input id="slug" name="slug" label="الرابط (Slug)" defaultValue={category?.slug} required />
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{category ? "تحديث" : "إضافة"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
      </div>
    </form>
  );
}
