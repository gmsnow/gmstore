import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BannerForm } from "@/components/admin/banner-form";
import { T } from "@/components/translate";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold"><T k="admin.edit_banner" /></h1>
      <BannerForm banner={banner} />
    </div>
  );
}
