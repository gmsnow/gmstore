import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/lib/theme";
import { useI18n } from "../../src/lib/i18n";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";

export default function MerchantSettingsPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [name, setName] = useState("");

  async function handleSave() {
    await fetch("http://localhost:3000/api/merchant/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
    });
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("merchant.settings")}</Text>
      <Card>
        <View style={{ padding: 16, gap: 12 }}>
          <Input label="Name" value={name} onChangeText={setName} />
          <Button onPress={handleSave}>{t("merchant.save")}</Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
});
