import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const PATCH = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const role = (req.auth?.user as any)?.role;
  const userId = (req.auth?.user as any)?.id;
  if (!req.auth || (role !== "ADMIN" && role !== "MERCHANT")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  if (role !== "ADMIN" && product.userId !== userId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const body = await req.json();
  let slug = body.slug;
  const slugConflict = await prisma.product.findUnique({ where: { slug } });
  if (slugConflict && slugConflict.id !== id) slug = `${slug}-${Date.now()}`;
  const updated = await prisma.product.update({
    where: { id },
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        slug,
        description: body.description,
        descriptionEn: body.descriptionEn || null,
        price: parseFloat(body.price),
        categoryId: body.categoryId,
        stock: parseInt(body.stock) || 0,
        featured: body.featured ?? false,
        images: body.images ?? [],
        colors: body.colors ?? [],
        colorImages: body.colorImages ?? undefined,
        brand: body.brand || null,
        brandLogo: body.brandLogo || null,
        videoUrl: body.videoUrl || null,
      },
  });
  return NextResponse.json(updated);
});

export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const role = (req.auth?.user as any)?.role;
  const userId = (req.auth?.user as any)?.id;
  if (!req.auth || (role !== "ADMIN" && role !== "MERCHANT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "ADMIN" && product.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    return NextResponse.json({ error: "لا يمكن حذف منتج عليه طلبات سابقة" }, { status: 400 });
  }
  await prisma.favorite.deleteMany({ where: { productId: id } });
  await prisma.review.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
