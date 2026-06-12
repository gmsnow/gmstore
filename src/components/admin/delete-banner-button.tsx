"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function DeleteBannerButton({ bannerId }: { bannerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/banners/${bannerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
      setOpen(false);
    } catch {
      alert("فشل الحذف");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>حذف</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="تأكيد الحذف">
        <p className="mb-4 text-sm text-muted-foreground">هل أنت متأكد من حذف هذا البانر؟</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>حذف</Button>
        </div>
      </Modal>
    </>
  );
}
