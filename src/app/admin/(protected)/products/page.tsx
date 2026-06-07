import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";

export default async function AdminProductsPage() {
  const locale = await getServerLocale();
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold"><T k="admin.products" /></h1>
        <Link href="/admin/products/new">
          <Button><Plus className="ml-2 h-4 w-4" /><T k="admin.new_product" /></Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><T k="admin.product_name" /></TableHead>
            <TableHead><T k="admin.price" /></TableHead>
            <TableHead><T k="admin.category_name" /></TableHead>
            <TableHead><T k="admin.stock" /></TableHead>
            <TableHead><T k="admin.featured" /></TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{localizedName(p, locale)}</TableCell>
              <TableCell>{Number(p.price).toFixed(2)} <T k="merchant.currency" /></TableCell>
              <TableCell>{localizedName(p.category, locale)}</TableCell>
              <TableCell>
                <Badge variant={p.stock > 0 ? "success" : "danger"}>{p.stock}</Badge>
              </TableCell>
              <TableCell>{p.featured ? "Yes" : "No"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/products/${p.id}/edit`}>
                    <Button variant="outline" size="sm"><T k="admin.edit" /></Button>
                  </Link>
                  <DeleteProductButton productId={p.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                <T k="merchant.no_products" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
