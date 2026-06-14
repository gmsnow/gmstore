import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let total = 0;
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const price = Number(product.price);
      total += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price, color: item.color || null, status: "PENDING" };
    });

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        total,
        status: "PENDING",
        items: { create: orderItems },
      },
      include: { items: { include: { product: { select: { name: true, nameEn: true, images: true } } } } },
    });

    logger.info("Order created", { orderId: order.id });
    const serialized = {
      ...order,
      total: Number(order.total),
      items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
    };
    return NextResponse.json(serialized);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "فشل إنشاء الطلب";
    logger.error("Checkout failed", { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
