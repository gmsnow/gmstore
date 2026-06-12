import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = auth(async () => {
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(banners);
});

export const POST = auth(async (req) => {
  if (!req.auth || (req.auth.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const banner = await prisma.banner.create({
    data: {
      image: body.image,
      title: body.title || null,
      titleEn: body.titleEn || null,
      desc: body.desc || null,
      descEn: body.descEn || null,
      link: body.link || "/products",
      order: body.order ?? 0,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(banner);
});
