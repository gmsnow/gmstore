import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../src/lib/theme";
import { useI18n } from "../../src/lib/i18n";
import { api } from "../../src/lib/api";
import { Card } from "../../src/components/ui/Card";

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api("/products").then((d) => d?.length || 0).catch(() => 0),
      api("/categories").then((d) => d?.length || 0).catch(() => 0),
      api("/orders/xxx/stats").catch(() => null),
    ]).then(([products, categories, orders]) => {
      setStats({ products, categories, totalOrders: 0, totalRevenue: 0 });
    });
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("admin.dashboard")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Card style={{ flex: 1, minWidth: 140 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{t("admin.total_orders")}</Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: theme.foreground }}>{stats?.totalOrders || 0}</Text>
          </View>
        </Card>
        <Card style={{ flex: 1, minWidth: 140 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{t("admin.total_revenue")}</Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: theme.primary }}>{stats?.totalRevenue?.toFixed(2) || "0.00"} ريال</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
});
