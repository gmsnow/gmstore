import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, shippingAddress, items, couponCode } = body;

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

    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
      if (!coupon || !coupon.active) {
        return NextResponse.json({ error: "القسيمة غير صالحة" }, { status: 400 });
      }
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return NextResponse.json({ error: "انتهت صلاحية القسيمة" }, { status: 400 });
      }
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "تم استنفاذ استخدامات القسيمة" }, { status: 400 });
      }
      if (coupon.minAmount && total < Number(coupon.minAmount)) {
        return NextResponse.json({ error: `أقل مبلغ للطلب ${coupon.minAmount} ريال` }, { status: 400 });
      }
      const discount = Math.round(total * coupon.discount / 100);
      total -= discount;
      couponId = coupon.id;
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        total,
        status: "PENDING",
        couponId,
        items: { create: orderItems },
      },
      include: { items: { include: { product: { select: { name: true, nameEn: true, images: true } } } } },
    });

    logger.info("Order created", { orderId: order.id, couponCode, discount: couponId ? true : false });
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
