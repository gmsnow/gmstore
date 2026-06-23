import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    logger.info("CJ webhook received", { body });

    const { messageType, type, params } = body;

    // Order status update
    if (type === "ORDERSTATUS" && params) {
      const { orderCode, orderStatus, trackingNumber, trackingUrl } = params;
      if (orderCode) {
        const statusMap: Record<string, string> = {
          "0": "PENDING",
          "1": "PROCESSING",
          "2": "SHIPPED",
          "3": "DELIVERED",
          "4": "CANCELLED",
        };
        const status = statusMap[String(orderStatus)] || "PROCESSING";
        const updateData: any = { status };
        if (trackingNumber) updateData.trackingNo = trackingNumber;
        if (trackingUrl) updateData.trackingUrl = trackingUrl;
        await prisma.cjOrderMapping.updateMany({
          where: { cjOrderCode: orderCode },
          data: updateData,
        });
        logger.info("CJ order status updated", { orderCode, status, trackingNumber });
      }
    }

    // Order split
    if (type === "ORDERSPLIT" && params) {
      const { originalOrderId, splitOrderList } = params;
      if (originalOrderId && splitOrderList?.length > 0) {
        for (const split of splitOrderList) {
          await prisma.cjOrderMapping.create({
            data: {
              orderId: originalOrderId,
              cjOrderCode: split.orderCode,
              status: "PROCESSING",
            },
          });
        }
        logger.info("CJ order split", { originalOrderId, splits: splitOrderList.length });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("CJ webhook error", { error: String(error) });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
