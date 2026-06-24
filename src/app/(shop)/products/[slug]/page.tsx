import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug?.normalize("NFC") ?? "";
  const product = await prisma.product.findFirst({ where: { slug } });
  if (!product) notFound();

  return (
    <div style={{ padding: 40 }}>
      <h1>{product.name}</h1>
      <p>Slug: {product.slug}</p>
      <p>ID: {product.id}</p>
      <p>Price: {Number(product.price)}</p>
    </div>
  );
}
