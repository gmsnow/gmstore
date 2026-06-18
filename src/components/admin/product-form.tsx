"use client";
import { useState, useRef, useEffect } from "react";
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
import { removeBackground } from "@imgly/background-removal";

interface Props {
  categories: Category[];
  product?: any;
  backUrl?: string;
  existingSlugs?: string[];
}

export function ProductForm({ categories, product, backUrl = "/admin/products", existingSlugs = [] }: Props) {
  const router = useRouter();
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [colorInput, setColorInput] = useState("");
  const [colorImages, setColorImages] = useState<Record<string, string>>(product?.colorImages ?? {});
  const [colorStock, setColorStock] = useState<Record<string, number>>(product?.colorStock ?? {});
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [brandLogo, setBrandLogo] = useState<string>(product?.brandLogo ?? "");
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    const raw = product?.specs;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return Object.entries(raw).map(([k, v]) => ({ key: k, value: String(v) }));
    return [];
  });
  const [sizesStr, setSizesStr] = useState(product?.sizes?.join(", ") ?? "");
  const slugRef = useRef<HTMLSelectElement>(null);
  const [showCustomSlug, setShowCustomSlug] = useState(false);

  function slugify(text: string) {
    return text
      .normalize("NFC")
      .replace(/[\u064e\u064f\u0650\u0651\u0652]/g, "")
      .replace(/[^\u0600-\u06FF\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  const [autoSlug, setAutoSlug] = useState(!product?.slug);
  const [slugOptions, setSlugOptions] = useState<{ value: string; label: string }[]>(product?.slug ? [{ value: product.slug, label: product.slug }] : []);

  function handleNameChange(value: string) {
    if (!autoSlug || product) return;
    const base = slugify(value);
    if (!base) { setSlugOptions([]); return; }
    const taken = new Set(existingSlugs);
    const opts: { value: string; label: string }[] = [];
    if (!taken.has(base)) {
      opts.push({ value: base, label: base });
    }
    for (let i = 1; opts.length < 5 && i <= 50; i++) {
      const v = `${base}-${i}`;
      if (!taken.has(v)) opts.push({ value: v, label: v });
    }
    setSlugOptions(opts);
  }

  const presetColors = [
    "#FF0000","#DC143C","#B22222","#8B0000","#FF4500","#FF6347","#FF8C00","#FFA500",
    "#FFD700","#FFFF00","#9ACD32","#32CD32","#008000","#228B22","#006400","#2E8B57",
    "#00CED1","#008080","#20B2AA","#0000FF","#4169E1","#1E90FF","#00008B","#191970",
    "#4B0082","#800080","#9932CC","#9400D3","#8B008B","#FF1493","#FF69B4","#FFB6C1",
    "#FFFFFF","#F5F5DC","#C0C0C0","#A9A9A9","#808080","#696969","#000000","#8B4513",
  ];

  function addColor(hex: string) {
    if (hex && !colors.includes(hex)) setColors((p) => [...p, hex]);
    setColorInput("");
  }

  function removeColor(hex: string) {
    setColors((p) => p.filter((c) => c !== hex));
    setColorImages((prev) => { const n = { ...prev }; delete n[hex]; return n; });
    setColorStock((prev) => { const n = { ...prev }; delete n[hex]; return n; });
  }

  async function uploadColorImage(hex: string, file: File) {
    setUploadingColor(hex);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setColorImages((prev) => ({ ...prev, [hex]: dataUrl }));
    } catch {}
    setUploadingColor(null);
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

  async function uploadBrandLogo(file: File) {
    setUploadingBrand(true);
    try {
      const blob = await removeBackground(file);
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setBrandLogo(dataUrl);
    } catch {}
    setUploadingBrand(false);
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
      discount: parseInt(form.get("discount") as string) || 0,
      dealEnd: form.get("dealEnd") ? new Date(form.get("dealEnd") as string).toISOString() : null,
      featured: form.get("featured") === "on",
      brand: form.get("brand"),
      brandLogo: brandLogo || null,
      videoUrl: form.get("videoUrl"),
      specs: specs.length > 0 ? Object.fromEntries(specs.filter(s => s.key).map(s => [s.key, s.value])) : null,
      sizes: sizesStr.split(",").map((s: string) => s.trim()).filter(Boolean),
      images,
      colors,
      colorImages,
      colorStock,
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      router.push(backUrl);
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error || `خطأ ${res.status}`);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Input id="name" name="name" label="اسم المنتج (عربي)" defaultValue={product?.name} required onChange={(e) => handleNameChange(e.target.value)} />
      <Input id="nameEn" name="nameEn" label="Product Name (English)" defaultValue={product?.nameEn} />
      {product ? (
        <Input id="slug" name="slug" label="الرابط (Slug)" defaultValue={product.slug} required />
      ) : (
        <>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">الرابط (Slug)</label>
            {product ? (
              <Input name="slug" label="" defaultValue={product.slug} required />
            ) : (
              <>
                {showCustomSlug ? (
                  <div className="space-y-2">
                    <Input name="slug" label="" placeholder="أكتب الرابط يدوياً..." required />
                    <button type="button" onClick={() => setShowCustomSlug(false)} className="text-xs text-primary hover:underline">عودة للخيارات المقترحة</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select ref={slugRef} id="slug" name="slug" required onChange={(e) => { if (e.target.value === "__custom__") setShowCustomSlug(true); }} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
                      {slugOptions.length === 0 ? (
                        <option value="">اكتب اسم المنتج أولاً</option>
                      ) : (
                        slugOptions.map((o, i) => (
                          <option key={i} value={o.value}>{o.label}</option>
                        ))
                      )}
                      {slugOptions.length > 0 && (
                        <>
                          <option disabled>---</option>
                          <option value="__custom__">أخرى (كتابة يدوية)</option>
                        </>
                      )}
                    </select>
                    {slugOptions.length > 0 && (
                      <p className="text-xs text-muted-foreground">اختر slug من القائمة أو اختر "أخرى" لكتابة رابط مخصص</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      <Textarea id="description" name="description" label="الوصف (عربي)" defaultValue={product?.description} />
      <Textarea id="descriptionEn" name="descriptionEn" label="Description (English)" defaultValue={product?.descriptionEn} />
      <div className="grid grid-cols-2 gap-4">
        <Input id="price" name="price" type="number" step="0.01" label="السعر" defaultValue={product?.price?.toString()} required />
        <Input id="stock" name="stock" type="number" label="المخزون" defaultValue={product?.stock?.toString() ?? "0"} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input id="discount" name="discount" type="number" min="0" max="100" label="الخصم %" defaultValue={product?.discount?.toString() ?? "0"} />
        <Input id="dealEnd" name="dealEnd" type="datetime-local" label="نهاية العرض" defaultValue={product?.dealEnd ? new Date(product.dealEnd).toISOString().slice(0, 16) : ""} />
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
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">المقاسات (مفصولة بفاصلة)</label>
        <input type="text" value={sizesStr} onChange={(e) => setSizesStr(e.target.value)} placeholder="S, M, L, XL" className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1" />
      </div>
      <Input id="brand" name="brand" label="العلامة التجارية" defaultValue={product?.brand} />
      <div className="space-y-2">
        <label className="text-sm font-medium">شعار العلامة التجارية</label>
        {brandLogo ? (
          <div className="relative inline-block h-16 w-16 overflow-hidden rounded-lg border border-border group">
            <img src={brandLogo} alt="" className="h-full w-full object-contain" />
            <button type="button" onClick={() => setBrandLogo("")} className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">حذف</button>
          </div>
        ) : (
          <label className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary transition-colors ${uploadingBrand ? "opacity-50" : ""}`}>
            {uploadingBrand ? "..." : "+"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBrandLogo(f); }} />
          </label>
        )}
      </div>
      <Input id="videoUrl" name="videoUrl" label="رابط الفيديو (Video URL)" defaultValue={product?.videoUrl} placeholder="https://www.youtube.com/watch?v=..." />
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">المواصفات</p>
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={s.key} onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], key: e.target.value }; setSpecs(n); }} placeholder="الخاصية" className="flex-1 h-8 rounded border border-border bg-background px-2 text-sm" />
              <input type="text" value={s.value} onChange={(e) => { const n = [...specs]; n[i] = { ...n[i], value: e.target.value }; setSpecs(n); }} placeholder="القيمة" className="flex-1 h-8 rounded border border-border bg-background px-2 text-sm" />
              <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="h-8 w-8 rounded bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors">X</button>
            </div>
          ))}
          <button type="button" onClick={() => setSpecs([...specs, { key: "", value: "" }])} className="text-sm text-primary hover:underline">+ إضافة مواصفة</button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">الألوان المتاحة</p>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <div key={c} className="flex flex-col items-center gap-1">
                <div className="relative group">
                  <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: c }} />
                  <button type="button" onClick={() => removeColor(c)} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                </div>
                {colorImages[c] ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded border border-border">
                    <img src={colorImages[c]} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setColorImages((p) => { const n = { ...p }; delete n[c]; return n; })} className="absolute top-0 left-0 bg-black/50 text-white text-[8px] w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">حذف</button>
                  </div>
                ) : (
                  <label className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-dashed border-border text-[10px] text-muted-foreground hover:border-primary transition-colors ${uploadingColor === c ? "opacity-50" : ""}`}>
                    {uploadingColor === c ? "..." : "+"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadColorImage(c, f); }} />
                  </label>
                )}
                <input type="number" min="0" value={colorStock[c] ?? 0} onChange={(e) => setColorStock((p) => ({ ...p, [c]: parseInt(e.target.value) || 0 }))} className="h-7 w-16 rounded border border-border bg-background text-center text-xs" placeholder="مخزون" />
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
