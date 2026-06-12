import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { DeleteBannerButton } from "@/components/admin/delete-banner-button";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">البانرات</h1>
        <Link href="/admin/banners/new">
          <Button size="sm" className="w-full sm:w-auto"><Plus className="ml-2 h-4 w-4" />إضافة بانر</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الصورة</TableHead>
            <TableHead>العنوان</TableHead>
            <TableHead>الترتيب</TableHead>
            <TableHead>نشط</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((b) => (
            <TableRow key={b.id}>
              <TableCell data-label="الصورة">
                <img src={b.image} alt="" className="h-14 w-28 rounded-lg object-cover border border-border" />
              </TableCell>
              <TableCell className="font-medium" data-label="العنوان">{b.title || b.titleEn || "-"}</TableCell>
              <TableCell data-label="الترتيب">{b.order}</TableCell>
              <TableCell data-label="نشط">{b.active ? "نعم" : "لا"}</TableCell>
              <TableCell data-label="">
                <div className="flex gap-1">
                  <Link href={`/admin/banners/${b.id}/edit`}>
                    <Button variant="outline" size="sm">تعديل</Button>
                  </Link>
                  <DeleteBannerButton bannerId={b.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {banners.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                لا توجد بانرات بعد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
