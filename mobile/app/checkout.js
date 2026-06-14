import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { useCart } from "../src/lib/cart";
import { api } from "../src/lib/api";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { Card } from "../src/components/ui/Card";

export default function CheckoutPage() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const { items, setItems, setLastOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", street: "", notes: "" });

  useEffect(() => {
    AsyncStorage.getItem("appliedCoupon").then((c) => {
      if (c) setCouponCode(c);
    });
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.email || !form.phone || !form.city || !form.street) {
      Alert.alert("", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setLoading(true);
    try {
      const res = await api("/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          shippingAddress: JSON.stringify({ city: form.city, street: form.street, notes: form.notes }),
          items,
          couponCode: couponCode || undefined,
        }),
      });
      await AsyncStorage.removeItem("appliedCoupon");
      setItems([]);
      setLastOrder(res);
      router.push(`/track/${res.id}`);
    } catch (e) {
      Alert.alert("", e.message);
    }
    setLoading(false);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("checkout.title")}</Text>
      <Card style={{ margin: 16 }}>
        <View style={{ padding: 16, gap: 12 }}>
          <Input label={t("checkout.full_name")} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Input label={t("checkout.email")} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" />
          <Input label={t("checkout.phone")} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
          <Input label={t("checkout.city")} value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
          <Input label={t("checkout.street")} value={form.street} onChangeText={(v) => setForm({ ...form, street: v })} />
          <Input label={t("checkout.notes")} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline />
        </View>
      </Card>
      <View style={{ padding: 16 }}>
        <Button onPress={handleSubmit} loading={loading}>{t("checkout.confirm")}</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", padding: 16, paddingBottom: 0 },
});
