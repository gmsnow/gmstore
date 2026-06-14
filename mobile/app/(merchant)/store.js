import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { useTheme } from "../../src/lib/theme";
import { useI18n } from "../../src/lib/i18n";
import { api } from "../../src/lib/api";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";

export default function MerchantStorePage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [profile, setProfile] = useState({ name: "", nameEn: "", description: "", descriptionEn: "", phone: "", email: "", address: "", whatsapp: "", telegram: "", instagram: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/merchant/store").then((data) => {
      if (data) setProfile((prev) => ({ ...prev, ...data }));
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    await api("/merchant/store", { method: "PUT", body: JSON.stringify(profile) });
    Alert.alert("", t("merchant.saved"));
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("merchant.store_settings")}</Text>
      <Card>
        <View style={{ padding: 16, gap: 12 }}>
          <Input label="Name (Ar)" value={profile.name} onChangeText={(v) => setProfile({ ...profile, name: v })} />
          <Input label="Name (En)" value={profile.nameEn} onChangeText={(v) => setProfile({ ...profile, nameEn: v })} />
          <Input label="Phone" value={profile.phone} onChangeText={(v) => setProfile({ ...profile, phone: v })} />
          <Input label="Email" value={profile.email} onChangeText={(v) => setProfile({ ...profile, email: v })} />
          <Input label="Address" value={profile.address} onChangeText={(v) => setProfile({ ...profile, address: v })} />
          <Button onPress={handleSave}>{t("merchant.save")}</Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
});
