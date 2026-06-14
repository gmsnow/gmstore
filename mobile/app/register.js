import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { Input } from "../src/components/ui/Input";
import { Button } from "../src/components/ui/Button";

export default function RegisterPage() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/login");
      else Alert.alert("", "فشل التسجيل");
    } catch (e) {
      Alert.alert("", e.message);
    }
    setLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("common.register")}</Text>
      <View style={styles.form}>
        <Input label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
        <Input label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" />
        <Input label="Password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
        <Button onPress={handleRegister} loading={loading}>{t("common.register")}</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 32 },
  form: { gap: 12 },
});
