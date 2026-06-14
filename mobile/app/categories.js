import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { api } from "../src/lib/api";

export default function CategoriesPage() {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/categories").then((data) => { setCategories(data || []); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("common.categories")}</Text>
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/products?category=${item.id}`)} style={[styles.card, { borderColor: theme.border }]}>
            {item.image && <Image source={{ uri: item.image }} style={styles.img} />}
            <Text style={[styles.name, { color: theme.foreground }]}>{locale === "en" && item.nameEn ? item.nameEn : item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", padding: 16 },
  card: { flex: 1, margin: 6, borderWidth: 1, borderRadius: 12, overflow: "hidden", alignItems: "center", padding: 16 },
  img: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: "600", textAlign: "center" },
});
