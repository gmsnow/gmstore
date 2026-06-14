import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "../src/lib/i18n";
import { useTheme } from "../src/lib/theme";
import { useAuth } from "../src/lib/auth";
import { setAuthToken } from "../src/lib/api";
import { Input } from "../src/components/ui/Input";
import { Button } from "../src/components/ui/Button";

export default function LoginPage() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await login(email, password);
      setAuthToken(res.token);
      const role = res.user.role;
      if (role === "ADMIN") router.replace("/(admin)");
      else if (role === "MERCHANT") router.replace("/(merchant)");
      else router.replace("/");
    } catch (e) {
      Alert.alert("", e.message || "فشل تسجيل الدخول");
    }
    setLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>{t("common.login")}</Text>
      <View style={styles.form}>
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button onPress={handleLogin} loading={loading}>{t("common.login")}</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 32 },
  form: { gap: 12 },
});
