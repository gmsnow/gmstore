"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  banner?: { id: string; image: string; title?: string | null; titleEn?: string | null; desc?: string | null; descEn?: string | null; link: string; order: number; active: boolean };
}

export function BannerForm({ banner }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(banner?.image || null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      image,
      title: form.get("title") || null,
      titleEn: form.get("titleEn") || null,
      desc: form.get("desc") || null,
      descEn: form.get("descEn") || null,
      link: form.get("link") || "/products",
      order: Number(form.get("order")) || 0,
      active: form.get("active") === "on",
    };
    const url = banner ? `/api/banners/${banner.id}` : "/api/banners";
    const method = banner ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.push("/admin/banners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input id="title" name="title" label="العنوان (عربي)" defaultValue={banner?.title ?? ""} />
      <Input id="titleEn" name="titleEn" label="Title (English)" defaultValue={banner?.titleEn ?? ""} />
      <Input id="desc" name="desc" label="الوصف (عربي)" defaultValue={banner?.desc ?? ""} />
      <Input id="descEn" name="descEn" label="Description (English)" defaultValue={banner?.descEn ?? ""} />
      <Input id="link" name="link" label="رابط الزر" defaultValue={banner?.link ?? "/products"} />
      <Input id="order" name="order" label="الترتيب" type="number" defaultValue={banner?.order ?? 0} />
      <div className="flex items-center gap-3">
        <input id="active" name="active" type="checkbox" defaultChecked={banner?.active ?? true} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
        <label htmlFor="active" className="text-sm font-medium">نشط</label>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">صورة البانر</label>
        <input type="file" accept="image/*" onChange={handleImage} className="block w-full text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90" />
        {image && <img src={image} alt="" className="mt-2 h-32 w-full rounded-lg object-cover border border-border" />}
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{banner ? "تحديث" : "إضافة"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
      </div>
    </form>
  );
}
