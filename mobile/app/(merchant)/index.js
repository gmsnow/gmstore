import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../src/lib/theme";
import { useI18n } from "../../src/lib/i18n";
import { api } from "../../src/lib/api";
import { Card } from "../../src/components/ui/Card";

export default function MerchantDashboardPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/merchant/stats").then(setStats).catch(() => {});
  }, []);

  if (!stats) return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.primary} />;

  const cards = [
    { label: t("merchant.total_products"), value: stats.totalProducts, color: theme.foreground },
    { label: t("merchant.revenue"), value: `${stats.totalRevenue?.toFixed(2)} ريال`, color: theme.primary },
    { label: "القابل للسحب", value: `${stats.withdrawableBalance?.toFixed(2)} ريال`, color: "green" },
    { label: t("merchant.orders_count"), value: stats.totalOrders, color: theme.foreground },
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={[styles.title, { color: theme.foreground }]}>Merchant Dashboard</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {cards.map((c, i) => (
          <Card key={i} style={{ flex: 1, minWidth: 140 }}>
            <View style={{ padding: 16 }}>
              <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>{c.label}</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: c.color }}>{c.value}</Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
});
