"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Store, ShoppingBag, LayoutDashboard, LogIn, UserPlus, LogOut, Search, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function MobileNav({ session, role }: { session: any; role: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
    setTimeout(() => setOpen(false), 100);
  }

  return (
    <>
      <button className="md:hidden p-2 hover:text-primary transition-colors" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {open && <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-l border-border p-6 transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`} dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
            <Store className="h-5 w-5 text-primary" />
            {t("nav.store_name")}
          </Link>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSearch} className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("nav.search")}
            className="w-full rounded-full border border-border bg-muted/50 px-4 py-2 ps-9 text-sm outline-none focus:border-primary transition-colors"
          />
          <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </button>
        </form>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
            <ShoppingBag className="h-4 w-4" /> {t("nav.products")}
          </Link>
          <Link href="/categories" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
            <ShoppingBag className="h-4 w-4" /> {t("nav.categories")}
          </Link>
          <Link href="/track" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
            <Package className="h-4 w-4" /> {t("track.nav_link")}
          </Link>
          <hr className="my-2 border-border" />
          {session ? (
            <>
              {role === "MERCHANT" && (
                <Link href="/merchant" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" /> {t("nav.my_merchant")}
                </Link>
              )}
              {role === "ADMIN" && (
                <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" /> {t("nav.admin")}
                </Link>
              )}
              <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted transition-colors w-full text-right text-sm" onClick={() => setOpen(false)}>
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
                <UserPlus className="h-4 w-4" /> {t("nav.register")}
              </Link>
              <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
                <LogIn className="h-4 w-4" /> {t("nav.login")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
