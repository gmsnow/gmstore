import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  const userId = (req.auth?.user as any)?.id;
  if (role !== "MERCHANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const take = parseInt(searchParams.get("take") || "20");

  const productIds = await prisma.product.findMany({
    where: { userId },
    select: { id: true },
  });
  const ids = productIds.map((p) => p.id);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { items: { some: { productId: { in: ids } } } },
      include: {
        items: {
          where: { productId: { in: ids } },
          include: { product: { select: { id: true, name: true, nameEn: true, images: true, price: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({
      where: { items: { some: { productId: { in: ids } } } },
    }),
  ]);

  const serialized = orders.map((order) => ({
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({ ...item, price: Number(item.price) })),
  }));

  return NextResponse.json({ orders: serialized, total, skip, take });
});
