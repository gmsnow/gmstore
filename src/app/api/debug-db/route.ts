import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ status: "error", message: "DATABASE_URL is not set" });
  
  try {
    const result = await prisma.$queryRaw`SELECT current_database() as db`;
    return NextResponse.json({ status: "ok", db: (result as any)[0]?.db });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message?.substring(0, 200) });
  }
}
