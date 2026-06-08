import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const POST = auth(async (req) => {
  const role = (req.auth?.user as any)?.role;
  if (!req.auth || (role !== "ADMIN" && role !== "MERCHANT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const mime = file.type || "image/jpeg";
  const dataUrl = `data:${mime};base64,${base64}`;

  return NextResponse.json({ url: dataUrl });
});
