import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.cjSettings.findFirst();
  return NextResponse.json(settings || {});
});

export const PUT = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const existing = await prisma.cjSettings.findFirst();
  const safe = {
    apiKey: body.apiKey,
    syncCategories: body.syncCategories,
    autoSyncProducts: body.autoSyncProducts,
    syncInterval: body.syncInterval,
  };
  const settings = existing
    ? await prisma.cjSettings.update({ where: { id: existing.id }, data: safe })
    : await prisma.cjSettings.create({ data: safe });
  return NextResponse.json(settings);
});
