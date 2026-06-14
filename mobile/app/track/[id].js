import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useI18n } from "../../src/lib/i18n";
import { useTheme } from "../../src/lib/theme";
import { api } from "../../src/lib/api";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Package, MapPin, Calendar } from "@expo/vector-icons";

const statusSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
const statusBadgeVariant = { PENDING: "warning", PROCESSING: "warning", SHIPPED: "success", DELIVERED: "success", CANCELLED: "danger" };

export default function TrackOrderPage() {
  const { id } = useLocalSearchParams();
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/orders/${id}`).then((data) => {
      setOrder(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;
  if (!order) return <Text style={{ textAlign: "center", marginTop: 100, color: theme.mutedForeground }}>{t("track.not_found")}</Text>;

  const isCancelled = order.status === "CANCELLED";
  let address = {};
  try { address = JSON.parse(order.shippingAddress || "{}"); } catch { address = { address: order.shippingAddress || "" }; }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Package size={32} color={theme.primary} />
        <Text style={[styles.title, { color: theme.foreground }]}>{t("track.title")}</Text>
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        <Text style={[styles.orderId, { color: theme.mutedForeground }]}>{order.id}</Text>

        {order.items?.map((item) => (
          <Card key={item.id}>
            <View style={{ padding: 12, gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {item.product?.images?.[0] && (
                  <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: theme.foreground }]}>
                    {locale === "en" && item.product?.nameEn ? item.product.nameEn : item.product?.name}
                  </Text>
                  <Text style={[styles.itemMeta, { color: theme.mutedForeground }]}>
                    {t("track.quantity")}: {item.quantity} × {Number(item.price).toFixed(2)}
                    {item.color ? ` · ${item.color}` : ""}
                    {item.size ? ` · ${item.size}` : ""}
                  </Text>
                </View>
                <Badge label={t(`track.status_${item.status}`)} variant={statusBadgeVariant[item.status]} />
              </View>
            </View>
          </Card>
        ))}

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <View style={{ padding: 12, gap: 4 }}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t("track.customer")}</Text>
              <Text style={{ color: theme.foreground, fontSize: 13 }}>{order.customerName}</Text>
              <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{order.customerEmail}</Text>
              <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{order.customerPhone}</Text>
            </View>
          </Card>
          <Card style={{ flex: 1 }}>
            <View style={{ padding: 12, gap: 4 }}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t("track.shipping_address")}</Text>
              <Text style={{ color: theme.mutedForeground, fontSize: 13 }}>{address.city}{address.street ? `، ${address.street}` : ""}</Text>
            </View>
          </Card>
        </View>

        <Card>
          <View style={{ padding: 16, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: theme.mutedForeground }}>{t("cart.subtotal")}</Text>
              <Text style={{ color: theme.foreground }}>{Number(order.subtotal || order.total).toFixed(2)} ريال</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: theme.mutedForeground }}>{t("cart.shipping")}</Text>
              <Text style={{ color: Number(order.shippingCost) === 0 ? "green" : theme.foreground }}>
                {Number(order.shippingCost) === 0 ? t("cart.free_shipping") : `${Number(order.shippingCost).toFixed(2)} ريال`}
              </Text>
            </View>
            {Number(order.discount) > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: theme.mutedForeground }}>{t("cart.coupon_discount")}</Text>
                <Text style={{ color: "green" }}>-{Number(order.discount).toFixed(2)} ريال</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: theme.foreground }}>{t("track.total")}</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: theme.primary }}>{Number(order.total).toFixed(2)} ريال</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 4 }}>
              <Calendar size={14} color={theme.mutedForeground} />
              <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString("ar-SA")}</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", padding: 24, gap: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  orderId: { fontSize: 12, fontFamily: "monospace", textAlign: "center" },
  itemImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#f1f5f9" },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
});
