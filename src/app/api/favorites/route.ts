import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const userId = (req.auth.user as any).id;
  const favs = await prisma.favorite.findMany({
    where: { userId },
    include: { product: { include: { category: true, reviews: { select: { rating: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favs.map((f) => f.product));
});

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const userId = (req.auth.user as any).id;
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId مطلوب" }, { status: 400 });
  const existing = await prisma.favorite.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId, productId } });
  return NextResponse.json({ favorited: true });
});
