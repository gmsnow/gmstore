"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ShoppingBag, LayoutDashboard, LogIn, UserPlus, LogOut, Search, Package, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function MobileNav({ session, role }: { session: any; role: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, direction } = useI18n();
  const router = useRouter();
  const isRtl = direction === "rtl";

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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg>
      </button>
      <div className={`fixed inset-y-0 z-50 w-72 border-border bg-background p-6 transition-transform duration-300 md:hidden ${isRtl ? "right-0 border-r" : "left-0 border-l"} ${open ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"}`}
        dir={direction}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
            <Store className="h-5 w-5 text-primary" />
            {t("nav.store_name")}
          </Link>
          <button onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSearch} className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "بحث عن منتجات..." : "Search products..."}
            className="w-full rounded-full border border-border bg-muted/50 px-4 py-2 ps-9 text-sm outline-none focus:border-primary transition-colors"
          />
          <button type="submit" className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"} text-muted-foreground`}>
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
          <Link href="/favorites" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
            <Heart className="h-4 w-4 text-rose-500" /> {t("nav.favorites")}
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
              <button
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted transition-colors w-full text-sm"
                onClick={() => setOpen(false)}
              >
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
