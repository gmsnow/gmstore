import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";

export default async function MerchantProductsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== "MERCHANT") redirect("/login");
  const userId = (session.user as any).id;

  const locale = await getServerLocale();
  const products = await prisma.product.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold"><T k="merchant.my_products" /></h1>
        <Link href="/merchant/products/new">
          <Button size="sm" className="w-full sm:w-auto"><Plus className="ml-2 h-4 w-4" /><T k="merchant.add_product" /></Button>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground"><T k="merchant.product_name" /></th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground"><T k="merchant.price" /></th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground"><T k="merchant.category" /></th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground"><T k="merchant.stock" /></th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{localizedName(p, locale)}</td>
                <td className="px-4 py-3">{Number(p.price).toFixed(2)} <T k="merchant.currency" /></td>
                <td className="px-4 py-3 text-muted-foreground">{localizedName(p.category, locale)}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.stock > 0 ? "success" : "danger"}>{p.stock}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Link href={`/products/${encodeURIComponent(p.slug)}`}>
                      <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                    </Link>
                    <Link href={`/merchant/products/${p.id}/edit`}>
                      <Button variant="outline" size="sm"><T k="merchant.edit" /></Button>
                    </Link>
                    <DeleteProductButton productId={p.id} redirectTo="/merchant" />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  <T k="merchant.no_products" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
