import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { T } from "@/components/translate";
import { ShoppingCart, Store, LogIn, LayoutDashboard, UserPlus, LogOut, Heart } from "lucide-react";
import { MobileNav } from "@/components/shop/mobile-nav";
import { SearchInput } from "@/components/shop/search-input";

function SignOutForm() {
  return (
    <form action={async () => {
      "use server";
      await signOut();
    }}>
      <button type="submit" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline"><T k="nav.logout" /></span>
      </button>
    </form>
  );
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Store className="h-6 w-6 text-primary" />
            <T k="nav.store_name" />
          </Link>
          <nav className="max-md:hidden flex items-center gap-4 text-sm font-medium">
            <Link href="/products" className="hover:text-primary transition-colors"><T k="nav.products" /></Link>
            <Link href="/categories" className="hover:text-primary transition-colors"><T k="nav.categories" /></Link>
            <Link href="/favorites" className="hover:text-primary transition-colors flex items-center gap-1">
              <Heart className="h-4 w-4 text-rose-500" />
              <T k="nav.favorites" />
            </Link>
            <div className="border-e border-border h-5" />
            <SearchInput />
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <LangToggle />
            <ThemeToggle />
            {session ? (
              <>
                {role === "MERCHANT" && (
                  <Link href="/merchant" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline"><T k="nav.my_merchant" /></span>
                  </Link>
                )}
                {role === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline"><T k="nav.admin" /></span>
                  </Link>
                )}
                <SignOutForm />
              </>
            ) : (
              <div className="flex items-center gap-0 sm:gap-2">
                <Link href="/register" className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline"><T k="nav.register" /></span>
                </Link>
                <Link href="/login" className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline"><T k="nav.login" /></span>
                </Link>
              </div>
            )}
            <Link href="/cart" className="relative p-2 hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <MobileNav session={session} role={role} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Link
        href="/track"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        title="تتبع الطلب"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24a1 1 0 0 0-1.1 0L2 6.5v11l4.45 2.26a1 1 0 0 0 1.1 0L16.5 14.6a1 1 0 0 0 .5-.87V10.3a1 1 0 0 0-.5-.9Z"/><path d="m2 6.5 4.45 2.26a1 1 0 0 0 1.1 0L16.5 6.5"/><path d="M7.55 18.26V10.76"/></svg>
      </Link>
      <footer className="border-t border-border bg-muted py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} <T k="nav.store_name" />. <T k="footer.rights" />
        </div>
      </footer>
    </div>
  );
}
