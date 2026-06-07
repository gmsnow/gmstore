import type { Locale } from "./dictionary";

export function localizedName(item: { name: string; nameEn?: string | null } | null | undefined, locale: Locale): string {
  if (!item) return "";
  if (locale === "en" && item.nameEn) return item.nameEn;
  return item.name;
}

export function localizedDescription(item: { description?: string | null; descriptionEn?: string | null } | null | undefined, locale: Locale): string | null | undefined {
  if (!item) return undefined;
  if (locale === "en" && item.descriptionEn) return item.descriptionEn;
  return item.description;
}
