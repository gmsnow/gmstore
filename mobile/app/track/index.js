import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../../src/lib/i18n";
import { useTheme } from "../../src/lib/theme";
import { Button } from "../../src/components/ui/Button";

export default function TrackSearchPage() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const [id, setId] = useState("");

  function handleSearch() {
    if (id.trim()) router.push(`/track/${id.trim()}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("track.title")}</Text>
      <View style={styles.form}>
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder={t("track.order_id")}
          placeholderTextColor={theme.mutedForeground}
          style={[styles.input, { borderColor: theme.border, color: theme.foreground }]}
        />
        <Button title={t("track.search")} onPress={handleSearch} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  form: { gap: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 14 },
});
