import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useI18n } from "../../src/lib/i18n";
import { useTheme } from "../../src/lib/theme";
import { api, formatPrice, currencyLabel } from "../../src/lib/api";

export default function ProductsPage() {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const { category, q } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q || "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    api(`/products?${params}`).then((data) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, [category]);

  function handleSearch() {
    setLoading(true);
    api(`/products?q=${encodeURIComponent(search)}`).then((data) => {
      setProducts(data || []);
      setLoading(false);
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { borderColor: theme.border }]}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          placeholder={t("common.search")}
          placeholderTextColor={theme.mutedForeground}
          style={[styles.input, { color: theme.foreground }]}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.primary} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/products/${item.slug}`)} style={[styles.card, { borderColor: theme.border }]}>
              <Image source={{ uri: item.images?.[0] }} style={styles.img} />
              <View style={styles.info}>
                <Text numberOfLines={2} style={[styles.name, { color: theme.foreground }]}>{locale === "en" && item.nameEn ? item.nameEn : item.name}</Text>
                <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(Number(item.price))} {currencyLabel.yer}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 12, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  input: { fontSize: 14, paddingVertical: 10 },
  card: { flex: 1, margin: 6, borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  img: { width: "100%", height: 160, backgroundColor: "#f1f5f9" },
  info: { padding: 8 },
  name: { fontSize: 13, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: "700" },
});
