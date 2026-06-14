import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { api, formatPrice, currencyLabel } from "../src/lib/api";
import { Card } from "../src/components/ui/Card";

export default function HomePage() {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/categories").catch(() => []),
      api("/products?limit=10").catch(() => []),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <Text style={styles.heroTitle}>{t("home.hero_title")}</Text>
        <Text style={styles.heroSub}>{t("home.hero_subtitle")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t("home.categories")}</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/products?category=${item.id}`)} style={styles.catCard}>
              {item.image && <Image source={{ uri: item.image }} style={styles.catImg} />}
              <Text style={[styles.catName, { color: theme.foreground }]}>{locale === "en" && item.nameEn ? item.nameEn : item.name}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t("home.featured")}</Text>
        <FlatList
          horizontal
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/products/${item.slug}`)} style={styles.prodCard}>
              <Image source={{ uri: item.images?.[0] }} style={styles.prodImg} />
              <View style={styles.prodInfo}>
                <Text numberOfLines={2} style={[styles.prodName, { color: theme.foreground }]}>{locale === "en" && item.nameEn ? item.nameEn : item.name}</Text>
                <Text style={[styles.prodPrice, { color: theme.primary }]}>{formatPrice(Number(item.price))} {currencyLabel.yer}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 32, alignItems: "center" },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 4 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, paddingHorizontal: 16 },
  catCard: { width: 100, alignItems: "center" },
  catImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 6 },
  catName: { fontSize: 12, fontWeight: "500", textAlign: "center" },
  prodCard: { width: 160, borderRadius: 12, overflow: "hidden" },
  prodImg: { width: 160, height: 160, backgroundColor: "#f1f5f9" },
  prodInfo: { padding: 8 },
  prodName: { fontSize: 13, marginBottom: 4 },
  prodPrice: { fontSize: 14, fontWeight: "700" },
});
