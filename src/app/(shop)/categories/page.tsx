import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";

function catImage(cat: { slug: string; name: string; nameEn?: string | null; image: string | null }, locale: string) {
  if (locale !== "ar") return cat.image;
  const colors = ["4A90D9","E91E63","FF9800","9C27B0","00BCD4","4CAF50","607D8B","795548","F44336","8BC34A","FF5722","3F51B5","6D4C41","37474F","2196F3","9E9E9E"];
  const idx = cat.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const text = encodeURIComponent(cat.name);
  return `https://placehold.co/400x200/${colors[idx]}/FFFFFF?text=${text}&font=raleway`;
}

export default async function CategoriesPage() {
  const locale = await getServerLocale();
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <FadeIn>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-2xl font-bold"><T k="categories.title" /></h1>
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <Link href={`/products?category=${c.slug}`}>
                <HoverCard>
                  <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-[2/1] overflow-hidden bg-muted">
                      {c.image || locale === "ar" ? (
                        <img src={catImage(c, locale)} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 text-center space-y-1">
                      <h2 className="text-lg font-semibold">{localizedName(c, locale)}</h2>
                      <p className="text-sm text-muted-foreground">{c._count.products} <T k="categories.product_count" /></p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </FadeIn>
  );
}
