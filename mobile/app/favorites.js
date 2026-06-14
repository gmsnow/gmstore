import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { api, formatPrice, currencyLabel } from "../src/lib/api";

export default function FavoritesPage() {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/favorites").then((data) => { setItems(data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("common.favorites")}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/products/${item.product?.slug}`)} style={[styles.item, { borderColor: theme.border }]}>
            <Image source={{ uri: item.product?.images?.[0] }} style={styles.img} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.foreground }]}>{locale === "en" && item.product?.nameEn ? item.product.nameEn : item.product?.name}</Text>
              <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(Number(item.product?.price))} {currencyLabel.yer}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 40, color: theme.mutedForeground }}>{t("common.no_data")}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", padding: 16 },
  item: { flexDirection: "row", padding: 12, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderRadius: 12, gap: 12 },
  img: { width: 60, height: 60, borderRadius: 8, backgroundColor: "#f1f5f9" },
  name: { fontSize: 14, fontWeight: "600" },
  price: { fontSize: 14, fontWeight: "700", marginTop: 4 },
});
