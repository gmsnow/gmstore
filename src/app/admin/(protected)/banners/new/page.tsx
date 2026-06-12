import { BannerForm } from "@/components/admin/banner-form";

export default function NewBannerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold">إضافة بانر جديد</h1>
      <BannerForm />
    </div>
  );
}
