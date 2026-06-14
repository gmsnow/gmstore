import { useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../src/lib/theme";
import { useI18n } from "../../src/lib/i18n";
import { useAuth } from "../../src/lib/auth";
import { useRouter, useSegments } from "expo-router";
import { LayoutDashboard, ShoppingCart, Store, Star, Wallet, Settings } from "@expo/vector-icons";

const links = [
  { label: "merchant.dashboard", icon: LayoutDashboard, route: "/(merchant)" },
  { label: "merchant.orders", icon: ShoppingCart, route: "/(merchant)/orders" },
  { label: "merchant.store", icon: Store, route: "/(merchant)/store" },
  { label: "merchant.reviews", icon: Star, route: "/(merchant)/reviews" },
  { label: "merchant.withdrawals", icon: Wallet, route: "/(merchant)/withdrawals" },
  { label: "merchant.settings", icon: Settings, route: "/(merchant)/settings" },
];

export default function MerchantLayout() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "MERCHANT")) {
      router.replace("/login");
    }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== "MERCHANT") {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={styles.sidebar}>
        <Text style={[styles.brand, { color: theme.primary }]}>Merchant</Text>
        {links.map((link) => {
          const active = segments.join("/") === link.route.replace("/(merchant)", "").replace("/", "");
          return (
            <TouchableOpacity
              key={link.route}
              onPress={() => router.push(link.route)}
              style={[styles.link, active && { backgroundColor: theme.primary }]}
            >
              <link.icon size={16} color={active ? "#fff" : theme.mutedForeground} />
              <Text style={[styles.linkText, { color: active ? "#fff" : theme.foreground }]}>{t(link.label)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="store" />
        <Stack.Screen name="reviews" />
        <Stack.Screen name="withdrawals" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { maxHeight: 60, paddingHorizontal: 12 },
  brand: { fontSize: 16, fontWeight: "700", padding: 12 },
  link: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8 },
  linkText: { fontSize: 13, fontWeight: "500" },
});
