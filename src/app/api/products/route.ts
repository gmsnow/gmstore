import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");
    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      const products = await prisma.product.findMany({
        where: { id: { in: idList } },
        include: { category: true, reviews: { select: { rating: true } } },
      });
      return NextResponse.json(products);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
};

export const POST = auth(async (req) => {
  try {
    const role = (req.auth?.user as any)?.role;
    if (!req.auth || (role !== "ADMIN" && role !== "MERCHANT")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const body = await req.json();
    const userId = (req.auth.user as any).id;

    if (!body.categoryId) {
      return NextResponse.json({ error: "يرجى اختيار فئة" }, { status: 400 });
    }

    let slug = body.slug;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        slug,
        description: body.description,
        descriptionEn: body.descriptionEn || null,
        price: parseFloat(body.price),
        categoryId: body.categoryId,
        userId,
        stock: parseInt(body.stock) || 0,
        featured: body.featured ?? false,
        images: body.images ?? [],
        colors: body.colors ?? [],
        videoUrl: body.videoUrl || null,
      },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "فشل إنشاء المنتج" }, { status: 500 });
  }
});

export const PATCH = auth(async (req) => {
  try {
    const role = (req.auth?.user as any)?.role;
    const userId = (req.auth?.user as any)?.id;
    if (!req.auth || (role !== "ADMIN" && role !== "MERCHANT")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const body = await req.json();
    const product = await prisma.product.findUnique({ where: { id: body.id } });
    if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    if (role !== "ADMIN" && product.userId !== userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    let slug = body.slug;
    const slugConflict = await prisma.product.findUnique({ where: { slug } });
    if (slugConflict && slugConflict.id !== body.id) slug = `${slug}-${Date.now()}`;
    const updated = await prisma.product.update({
      where: { id: body.id },
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
        videoUrl: body.videoUrl || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "فشل تحديث المنتج" }, { status: 500 });
  }
});
