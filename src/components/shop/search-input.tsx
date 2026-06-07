"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function SearchInput() {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-48">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("nav.search")}
        className="w-full rounded-full border border-border bg-muted/50 px-4 py-1.5 ps-9 text-sm outline-none focus:border-primary transition-colors"
      />
      <button type="submit" className="absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
