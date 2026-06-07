import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion-wrappers";
import { T } from "@/components/translate";
import { getServerLocale } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/localized";

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
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center space-y-2">
                      <h2 className="text-xl font-semibold">{localizedName(c, locale)}</h2>
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
