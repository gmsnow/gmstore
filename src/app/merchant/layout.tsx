import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Store, ArrowRight } from "lucide-react";
import { T } from "@/components/translate";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "MERCHANT") redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/merchant" className="text-lg font-bold"><T k="merchant.title" /></Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowRight className="h-4 w-4" />
            <T k="nav.back_to_shop" />
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
