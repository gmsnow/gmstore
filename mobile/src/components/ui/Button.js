import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../lib/theme";

export function Button({ title, onPress, variant = "primary", loading, disabled, style, children }) {
  const { theme } = useTheme();
  const bg =
    variant === "outline" ? "transparent" :
    variant === "danger" ? theme.destructive : theme.primary;
  const txt =
    variant === "outline" ? theme.foreground : theme.primaryForeground;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, { backgroundColor: bg, borderColor: theme.border, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={txt} size="small" /> : null}
      {children || <Text style={[styles.text, { color: txt }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
    borderWidth: 1, gap: 8,
  },
  text: { fontSize: 14, fontWeight: "600" },
});
