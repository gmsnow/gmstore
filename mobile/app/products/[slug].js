import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useI18n } from "../../src/lib/i18n";
import { useTheme } from "../../src/lib/theme";
import { useCart } from "../../src/lib/cart";
import { api, formatPrice, currencyLabel } from "../../src/lib/api";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";

export default function ProductDetailPage() {
  const { slug } = useLocalSearchParams();
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    api(`/products/${slug}`).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;
  if (!product) return <Text style={{ textAlign: "center", marginTop: 100, color: theme.mutedForeground }}>{t("common.error")}</Text>;

  function handleAdd() {
    addToCart({
      productId: product.id,
      name: locale === "en" && product.nameEn ? product.nameEn : product.name,
      price: Number(product.price),
      image: product.images?.[0] || "",
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      colors: product.colors,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const specs = product.specs ? (typeof product.specs === "object" ? product.specs : {}) : {};

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {product.images?.[0] && (
        <Image source={{ uri: product.images[0] }} style={styles.mainImg} />
      )}
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.foreground }]}>
          {locale === "en" && product.nameEn ? product.nameEn : product.name}
        </Text>
        <Text style={[styles.price, { color: theme.primary }]}>
          {formatPrice(Number(product.price))} {currencyLabel.yer}
        </Text>

        {product.colors?.length > 0 && (
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.foreground }]}>{t("product.color")}:</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {product.colors.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedColor === c && { borderWidth: 2, borderColor: theme.primary },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {product.sizes?.length > 0 && (
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.foreground }]}>{t("product.size")}:</Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {product.sizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSelectedSize(s)}
                  style={[
                    styles.sizeBtn,
                    { borderColor: theme.border },
                    selectedSize === s && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <Text style={[styles.sizeText, { color: selectedSize === s ? "#fff" : theme.foreground }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {Object.keys(specs).length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <View style={{ padding: 12, gap: 6 }}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t("product.specs")}</Text>
              {Object.entries(specs).map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.mutedForeground, fontSize: 13 }}>{k}</Text>
                  <Text style={{ color: theme.foreground, fontSize: 13, fontWeight: "500" }}>{String(v)}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Button
          onPress={handleAdd}
          disabled={product.stock <= 0}
          style={{ marginTop: 20 }}
        >
          {product.stock <= 0 ? t("product.out_of_stock") : added ? t("product.added") : t("product.add_to_cart")}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainImg: { width: "100%", height: 300, backgroundColor: "#f1f5f9" },
  body: { padding: 16 },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  price: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  optionLabel: { fontSize: 14, fontWeight: "500" },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  sizeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  sizeText: { fontSize: 13, fontWeight: "500" },
});
