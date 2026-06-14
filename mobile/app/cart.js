import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { useCart } from "../src/lib/cart";
import { api, formatPrice, currencyLabel } from "../src/lib/api";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { useState } from "react";
import { TextInput } from "react-native";
import { Minus, Plus, Trash2 } from "@expo/vector-icons";

export default function CartPage() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, subtotal, shippingCost, isFreeShipping, freeThreshold, applyCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const total = subtotal - discount + (isFreeShipping ? 0 : shippingCost);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    try {
      const res = await api(`/coupons/validate/${couponCode.trim()}`);
      if (res?.valid && res.discount) {
        const d = res.isPercentage ? Math.round(subtotal * res.discount / 100) : res.discount;
        setDiscount(Math.min(d, subtotal));
        setCouponMsg(t("cart.coupon_applied"));
        await applyCoupon(couponCode.trim());
      } else {
        setDiscount(0);
        setCouponMsg(t("cart.coupon_invalid"));
      }
    } catch {
      setDiscount(0);
      setCouponMsg(t("cart.coupon_invalid"));
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("cart.drawer_title")}</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>{t("cart.empty")}</Text>
          <Button title={t("cart.continue_shopping")} onPress={() => router.push("/products")} variant="outline" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.productId}-${item.color}-${i}`}
          renderItem={({ item }) => (
            <View style={[styles.item, { borderColor: theme.border }]}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.foreground }]}>{item.name}</Text>
                {item.color && <Text style={[styles.itemMeta, { color: theme.mutedForeground }]}>{item.color}</Text>}
                {item.size && <Text style={[styles.itemMeta, { color: theme.mutedForeground }]}>{item.size}</Text>}
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.productId, item.color, -1)} style={styles.qtyBtn}>
                    <Minus size={14} color={theme.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.qty, { color: theme.foreground }]}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.productId, item.color, 1)} style={styles.qtyBtn}>
                    <Plus size={14} color={theme.foreground} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>{formatPrice(item.price)} {currencyLabel.yer}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.productId, item.color)}>
                  <Trash2 size={16} color={theme.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <View style={styles.couponRow}>
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder={t("cart.coupon_placeholder")}
                  placeholderTextColor={theme.mutedForeground}
                  style={[styles.couponInput, { borderColor: theme.border, color: theme.foreground }]}
                />
                <Button title={t("cart.coupon_apply")} onPress={handleApplyCoupon} />
              </View>
              {couponMsg ? <Text style={{ color: discount > 0 ? "green" : "red", fontSize: 12 }}>{couponMsg}</Text> : null}
              <View style={styles.totalRow}>
                <Text style={{ color: theme.mutedForeground }}>{t("cart.subtotal")}</Text>
                <Text style={{ color: theme.foreground, fontWeight: "600" }}>{formatPrice(subtotal)} {currencyLabel.yer}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={{ color: theme.mutedForeground }}>{t("cart.coupon_discount")}</Text>
                  <Text style={{ color: "green" }}>-{formatPrice(discount)} {currencyLabel.yer}</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={{ color: theme.mutedForeground }}>{t("cart.shipping")}</Text>
                <Text style={{ color: isFreeShipping ? "green" : theme.foreground, fontWeight: "600" }}>
                  {isFreeShipping ? t("cart.free_shipping") : `${formatPrice(shippingCost)} ${currencyLabel.yer}`}
                </Text>
              </View>
              <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 }]}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.foreground }}>{t("cart.total")}</Text>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.primary }}>{formatPrice(total)} {currencyLabel.yer}</Text>
              </View>
              <Button title={t("cart.checkout")} onPress={() => router.push("/checkout")} style={{ marginTop: 12 }} />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", padding: 16, paddingBottom: 0 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  emptyText: { fontSize: 14 },
  item: { flexDirection: "row", padding: 12, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderRadius: 12, gap: 12 },
  itemImg: { width: 64, height: 64, borderRadius: 8, backgroundColor: "#f1f5f9" },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 11 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  qtyBtn: { padding: 4 },
  qty: { fontSize: 14, fontWeight: "600", width: 24, textAlign: "center" },
  itemRight: { alignItems: "flex-end", justifyContent: "space-between" },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  footer: { padding: 16, gap: 8 },
  couponRow: { flexDirection: "row", gap: 8 },
  couponInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
});
