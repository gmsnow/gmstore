"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { House, ShoppingBag, Tags, Heart, Package, Search, User, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function MobileNav({ session, role }: { session: any; role: string | undefined }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, direction } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const isRtl = direction === "rtl";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    setSearchQuery("");
  }

  const links = [
    { href: "/", labelKey: "nav.home", icon: House },
    { href: "/products", labelKey: "nav.products", icon: ShoppingBag },
    { href: "/categories", labelKey: "nav.categories", icon: Tags },
    { href: "/favorites", labelKey: "nav.favorites", icon: Heart },
    { href: "/track", labelKey: "track.nav_link", icon: Package },
  ];

  return (
    <>
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/95 backdrop-blur-sm pt-4 md:hidden">
          <form onSubmit={handleSearch} className="relative w-full max-w-md mx-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "بحث عن منتجات..." : "Search products..."}
              className="w-full rounded-full border border-border bg-muted/50 px-4 py-3 ps-12 text-sm outline-none focus:border-primary transition-colors"
              autoFocus
            />
            <button type="submit" className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-4" : "left-4"} text-muted-foreground`}>
              <Search className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setSearchOpen(false)} className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-4" : "right-4"} text-muted-foreground hover:text-foreground`}>
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center overflow-x-auto border-t border-border bg-card shadow-lg px-2 py-1 md:hidden scrollbar-none" dir={direction} style={{ WebkitOverflowScrolling: "touch" }}>
        {links.map((l) => {
          const isActive = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 text-[10px] transition-colors shrink-0 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <l.icon className={`h-5 w-5 transition-all ${isActive ? "text-primary scale-110" : ""}`} />
              <span className="truncate font-medium">{t(l.labelKey)}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-[10px] transition-colors shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-5 w-5" />
          <span className="truncate font-medium">{t("nav.search")}</span>
        </button>
        <Link
          href={session ? (role === "ADMIN" ? "/admin" : role === "MERCHANT" ? "/merchant" : "/favorites") : "/login"}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 text-[10px] transition-colors shrink-0 ${session ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <User className={`h-5 w-5 ${session ? "text-primary" : ""}`} />
          <span className="truncate font-medium">{session ? t("nav.account") : t("nav.login")}</span>
        </Link>
      </nav>
    </>
  );
}
