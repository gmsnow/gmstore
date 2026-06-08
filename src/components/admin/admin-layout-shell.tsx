"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { LayoutDashboard, Package, Tags, ShoppingBag, CheckCheck, LogOut, Menu, X, Store } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t, direction } = useI18n();

  const links = [
    { href: "/admin", labelKey: "admin.home", icon: LayoutDashboard },
    { href: "/admin/products", labelKey: "admin.products", icon: Package },
    { href: "/admin/categories", labelKey: "admin.categories", icon: Tags },
    { href: "/admin/orders", labelKey: "admin.orders", icon: ShoppingBag },
    { href: "/admin/orders/delivered", labelKey: "admin.delivered_orders", icon: CheckCheck },
  ];

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden" dir={direction}>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-border bg-card p-6 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
            <LayoutDashboard className="h-5 w-5 text-primary" />
            {t("admin.dashboard")}
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${pathname === l.href ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              <l.icon className="h-4 w-4" /> {t(l.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 space-y-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <LangToggle />
            <span className="flex-1">{t("lang.switch")}</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            <span className="flex-1">{t("admin.night_mode")}</span>
            <ThemeToggle />
          </div>
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <LogOut className="h-4 w-4" />
            {t("admin.back_to_shop")}
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg>
          </button>
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            {t("admin.dashboard")}
          </Link>
          <div className="w-5" />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
