import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await prisma.cjLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(logs);
});
