import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, error: "رمز القسيمة مطلوب" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "القسيمة غير موجودة" });
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: "القسيمة غير نشطة" });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: "انتهت صلاحية القسيمة" });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "تم استنفاذ عدد استخدامات القسيمة" });
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      code: coupon.code,
      minAmount: Number(coupon.minAmount),
    });
  } catch {
    return NextResponse.json({ valid: false, error: "فشل التحقق من القسيمة" }, { status: 500 });
  }
}
