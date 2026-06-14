import { useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../src/lib/theme";
import { useI18n } from "../../src/lib/i18n";
import { useAuth } from "../../src/lib/auth";
import { useRouter, useSegments } from "expo-router";
import { LayoutDashboard, ShoppingCart, Package, Tags, Users, Star, BarChart3, Ticket, Image } from "@expo/vector-icons";

const links = [
  { label: "admin.dashboard", icon: LayoutDashboard, route: "/(admin)" },
  { label: "admin.orders", icon: ShoppingCart, route: "/(admin)/orders" },
  { label: "admin.products", icon: Package, route: "/(admin)/products" },
  { label: "admin.categories", icon: Tags, route: "/(admin)/categories" },
  { label: "admin.customers", icon: Users, route: "/(admin)/customers" },
  { label: "admin.reviews", icon: Star, route: "/(admin)/reviews" },
  { label: "admin.analytics", icon: BarChart3, route: "/(admin)/analytics" },
  { label: "admin.coupons", icon: Ticket, route: "/(admin)/coupons" },
  { label: "admin.banners", icon: Image, route: "/(admin)/banners" },
];

export default function AdminLayout() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== "ADMIN") {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={styles.sidebar}>
        <Text style={[styles.brand, { color: theme.primary }]}>GMStore Admin</Text>
        {links.map((link) => {
          const active = segments.join("/") === link.route.replace("/(admin)", "").replace("/", "");
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
        <Stack.Screen name="orders/[id]" />
        <Stack.Screen name="products" />
        <Stack.Screen name="coupons" />
        <Stack.Screen name="customers" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="reviews" />
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
