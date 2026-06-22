import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAccessToken, getCachedToken } from "@/lib/cj-dropshipping";

export const POST = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = await prisma.cjSettings.findFirst();
    const apiKey = settings?.apiKey;
    if (!apiKey) return NextResponse.json({ error: "CJ API key not configured" }, { status: 400 });
    const data = await getAccessToken(apiKey);
    await prisma.cjSettings.update({
      where: { id: settings!.id },
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: new Date(data.accessTokenExpiryDate),
      },
    });
    return NextResponse.json({ success: true, openId: data.openId, expiresAt: data.accessTokenExpiryDate });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
});

export const GET = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cached = getCachedToken();
  const settings = await prisma.cjSettings.findFirst();
  return NextResponse.json({
    hasToken: !!cached?.accessToken,
    expiresAt: cached?.expiresAt ? new Date(cached.expiresAt).toISOString() : null,
    hasApiKey: !!settings?.apiKey,
  });
});
