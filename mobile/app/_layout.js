import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../src/lib/theme";
import { I18nProvider, useI18n } from "../src/lib/i18n";
import { AuthProvider } from "../src/lib/auth";
import { CartProvider } from "../src/lib/cart";
import { ShoppingBag, User, Heart, Home, Search } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function TabBar() {
  const { theme } = useTheme();
  const { direction } = useI18n();
  const router = useRouter();
  const segments = useSegments();
  const hideTabs = segments[0] === "(admin)" || segments[0] === "(merchant)" || segments[0] === "checkout" || segments[0] === "login" || segments[0] === "register";

  if (hideTabs) return null;

  const tabs = [
    { icon: Home, label: "common.home", route: "/" },
    { icon: Search, label: "common.search", route: "/products" },
    { icon: ShoppingBag, label: "common.cart", route: "/cart" },
    { icon: Heart, label: "common.favorites", route: "/favorites" },
    { icon: User, label: "common.account", route: "/login" },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = segments[segments.length - 1] === tab.route.replace("/", "") || (!segments[segments.length - 1] && tab.route === "/");
        return (
          <TouchableOpacity key={tab.route} onPress={() => router.push(tab.route)} style={styles.tabItem}>
            <Icon size={22} color={active ? theme.primary : theme.mutedForeground} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RootLayout() {
  const { theme, isDark } = useTheme();
  const { direction } = useI18n();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="products" />
        <Stack.Screen name="products/[slug]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="track" />
        <Stack.Screen name="track/[id]" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(merchant)" />
      </Stack>
      <TabBar />
    </View>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <RootLayout />
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 28,
    justifyContent: "space-around",
  },
  tabItem: { alignItems: "center", flex: 1 },
});
