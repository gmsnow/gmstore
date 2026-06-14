import { View, StyleSheet } from "react-native";
import { useTheme } from "../../lib/theme";

export function Card({ children, style }) {
  const { theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>{children}</View>;
}

export function CardHeader({ children }) {
  return <View style={styles.header}>{children}</View>;
}

export function CardTitle({ children }) {
  const { theme } = useTheme();
  return <View style={{ marginBottom: 8 }}>{children}</View>;
}

export function CardContent({ children, style }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  header: { padding: 16, paddingBottom: 0 },
  content: { padding: 16 },
});
