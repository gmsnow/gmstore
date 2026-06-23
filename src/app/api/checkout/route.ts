import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { calculateShippingCost } from "@/lib/shipping";
import { createCjOrder, ensureValidToken } from "@/lib/cj-dropshipping";

function extractAddressParts(raw: string) {
  const obj: Record<string, string> = {};
  try { Object.assign(obj, JSON.parse(raw || "{}")); } catch {}
  return obj;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, shippingAddress, items, couponCode } = body;
    if (!items?.length) return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        user: { include: { store: { select: { lat: true, lng: true } } } },
      },
    });
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const price = Number(product.price);
      subtotal += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price, color: item.color || null, size: item.size || null, status: "PENDING" };
    });

    let discount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date()) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && (!coupon.minAmount || Number(coupon.minAmount) <= subtotal)) {
        discount = Math.round(subtotal * coupon.discount / 100);
        couponId = coupon.id;
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const addressObj = extractAddressParts(shippingAddress);
    const uniqueStores = products
      .map((p) => p.user?.store)
      .filter((s): s is { lat: any; lng: any } => s != null && s.lat != null && s.lng != null);
    const store = uniqueStores.length > 0 ? uniqueStores[0] : null;
    const shippingCost = calculateShippingCost({
      subtotal,
      lat: addressObj.lat ? Number(addressObj.lat) : undefined,
      lng: addressObj.lng ? Number(addressObj.lng) : undefined,
      storeLat: store ? Number(store.lat) : undefined,
      storeLng: store ? Number(store.lng) : undefined,
    });
    const total = subtotal + shippingCost - discount;

    const order = await prisma.order.create({
      data: {
        customerName, customerEmail, customerPhone, shippingAddress,
        subtotal, shippingCost, discount, total, couponId, status: "PENDING",
        items: { create: orderItems },
      },
      include: { items: true },
    });

    for (const item of orderItems) {
      const product = productMap.get(item.productId);
      if (product) {
        const colorStock = (product.colorStock as Record<string, number> | null) || {};
        const newStock = Number(product.stock) - item.quantity;
        if (item.color && colorStock[item.color] !== undefined) {
          colorStock[item.color] = Math.max(0, Number(colorStock[item.color]) - item.quantity);
        }
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: newStock, colorStock },
        });
      }
    }

    // ── CJ Order Submission ──
    const cjMappings = await prisma.cjProductMapping.findMany({
      where: { productId: { in: productIds } },
    });
    if (cjMappings.length > 0) {
      try {
        const cjSettings = await prisma.cjSettings.findFirst();
        if (cjSettings?.apiKey) {
          await ensureValidToken(cjSettings.apiKey);

          const countryMapping: Record<string, string> = {
            "اليمن": "YE", "Yemen": "YE",
            "السعودية": "SA", "Saudi Arabia": "SA",
            "الإمارات": "AE", "UAE": "AE",
          };
          const countryName = addressObj.country || "Yemen";
          const countryCode = countryMapping[countryName] || "YE";
          const province = addressObj.province || addressObj.city || "";
          const city = addressObj.city || "";
          const zip = addressObj.zip || "";

          // Build CJ products array
          const cjProducts: { vid: string; quantity: number; storeLineItemId: string }[] = [];
          const itemMapping: { orderItemId: string; productId: string; cjProductId: string; vid: string | null }[] = [];

          for (const item of order.items) {
            const mapping = cjMappings.find((m) => m.productId === item.productId);
            if (mapping) {
              const vid = mapping.cjVariantSku || mapping.cjProductId;
              cjProducts.push({ vid, quantity: item.quantity, storeLineItemId: item.id });
              itemMapping.push({ orderItemId: item.id, productId: item.productId, cjProductId: mapping.cjProductId, vid });
            }
          }

          if (cjProducts.length > 0) {
            const cjAddress = [addressObj.street || addressObj.address || "", addressObj.address2 || ""].filter(Boolean).join(", ") || shippingAddress;
            const cjResult = await createCjOrder({
              orderNumber: order.id,
              shippingCountryCode: countryCode,
              shippingCountry: countryName,
              shippingProvince: province,
              shippingCity: city,
              shippingZip: zip,
              shippingPhone: customerPhone,
              shippingCustomerName: customerName,
              shippingAddress: cjAddress,
              email: customerEmail,
              remark: `GMStore order ${order.id}`,
              payType: "3",
              logisticName: "CJ Standard Shipping",
              products: cjProducts,
            });

            // Store CJ order mappings
            await prisma.cjOrderMapping.createMany({
              data: itemMapping.map((im) => ({
                orderId: order.id,
                orderItemId: im.orderItemId,
                productId: im.productId,
                cjProductId: im.cjProductId,
                cjVid: im.vid,
                cjOrderCode: cjResult.orderCode,
                status: "SUBMITTED",
              })),
            });
            logger.info("CJ order submitted", { orderId: order.id, cjOrderCode: cjResult.orderCode });
          }
        }
      } catch (cjError) {
        logger.error("CJ order submission failed", { orderId: order.id, error: String(cjError) });
        // Don't fail the checkout; log the error
      }
    }

    logger.info("Order created", { orderId: order.id, shippingCost, discount, total });
    const serialized = {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discount),
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