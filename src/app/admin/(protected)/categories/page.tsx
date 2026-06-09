import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الفئات</h1>
        <Link href="/admin/categories/new">
          <Button><Plus className="ml-2 h-4 w-4" />إضافة فئة</Button>
        </Link>
      </div>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الصورة</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>الرابط</TableHead>
            <TableHead>عدد المنتجات</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                {c.image ? (
                  <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.slug}</TableCell>
              <TableCell>{c._count.products}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/categories/${c.id}/edit`}>
                    <Button variant="outline" size="sm">تعديل</Button>
                  </Link>
                  <DeleteCategoryButton categoryId={c.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                لا توجد فئات بعد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
