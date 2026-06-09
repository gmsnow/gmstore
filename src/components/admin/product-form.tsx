"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Category } from "@prisma/client";
import { useI18n } from "@/lib/i18n/provider";
import { localizedName } from "@/lib/i18n/localized";

interface Props {
  categories: Category[];
  product?: any;
  backUrl?: string;
}

export function ProductForm({ categories, product, backUrl = "/admin/products" }: Props) {
  const router = useRouter();
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [colorInput, setColorInput] = useState("");

  const presetColors = ["#FF0000","#FF4500","#FF8C00","#FFD700","#FFFF00","#9ACD32","#008000","#00CED1","#0000FF","#4B0082","#8B008B","#FF1493","#FF69B4","#FFFFFF","#808080","#000000"];

  function addColor(hex: string) {
    if (hex && !colors.includes(hex)) setColors((p) => [...p, hex]);
    setColorInput("");
  }

  function removeColor(hex: string) {
    setColors((p) => p.filter((c) => c !== hex));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        urls.push(dataUrl);
      } catch {} 
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      nameEn: form.get("nameEn"),
      slug: form.get("slug"),
      description: form.get("description"),
      descriptionEn: form.get("descriptionEn"),
      price: parseFloat(form.get("price") as string),
      categoryId: form.get("categoryId"),
      stock: parseInt(form.get("stock") as string) || 0,
      featured: form.get("featured") === "on",
      videoUrl: form.get("videoUrl"),
      images,
      colors,
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error || `خطأ ${res.status}`);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Input id="name" name="name" label="اسم المنتج (عربي)" defaultValue={product?.name} required />
      <Input id="nameEn" name="nameEn" label="Product Name (English)" defaultValue={product?.nameEn} />
      <Input id="slug" name="slug" label="الرابط (Slug)" defaultValue={product?.slug} required />
      <Textarea id="description" name="description" label="الوصف (عربي)" defaultValue={product?.description} />
      <Textarea id="descriptionEn" name="descriptionEn" label="Description (English)" defaultValue={product?.descriptionEn} />
      <div className="grid grid-cols-2 gap-4">
        <Input id="price" name="price" type="number" step="0.01" label="السعر" defaultValue={product?.price?.toString()} required />
        <Input id="stock" name="stock" type="number" label="المخزون" defaultValue={product?.stock?.toString() ?? "0"} />
      </div>
      <Select
        id="categoryId"
        name="categoryId"
        label="الفئة"
        defaultValue={product?.categoryId}
        options={categories.map((c) => ({ value: c.id, label: localizedName(c, locale) }))}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4" />
        منتج مميز
      </label>
      <Input id="videoUrl" name="videoUrl" label="رابط الفيديو (Video URL)" defaultValue={product?.videoUrl} placeholder="https://www.youtube.com/watch?v=..." />
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">الألوان المتاحة</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <div key={c} className="relative group">
                <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: c }} />
                <button type="button" onClick={() => removeColor(c)} className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presetColors.map((c) => (
              <button key={c} type="button" onClick={() => addColor(c)} className={`h-6 w-6 rounded-full border ${colors.includes(c) ? "border-primary ring-2 ring-primary/30" : "border-border"} hover:scale-110 transition-transform`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input type="color" value={colorInput || "#000000"} onChange={(e) => setColorInput(e.target.value)} className="h-8 w-8 rounded cursor-pointer border border-border" />
            <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="أو أدخل Hex (#FF0000)" className="flex-1 h-8 rounded border border-border bg-background px-2 text-sm" />
            <Button type="button" size="sm" variant="outline" onClick={() => addColor(colorInput)}>إضافة</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">الصور (يمكن اختيار عدة صور)</p>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border group">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 left-0 bg-black/60 text-white text-xs w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="text-sm" />
          {uploading && <p className="text-xs text-muted-foreground">جاري الرفع...</p>}
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{product ? "تحديث" : "إضافة"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(backUrl)}>إلغاء</Button>
      </div>
    </form>
  );
}
