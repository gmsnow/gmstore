import { View, Text, StyleSheet } from "react-native";

const variants = {
  default: { bg: "#f1f5f9", text: "#475569" },
  success: { bg: "#dcfce7", text: "#166534" },
  warning: { bg: "#fef9c3", text: "#854d0e" },
  danger: { bg: "#fee2e2", text: "#991b1b" },
  outline: { bg: "transparent", text: "#64748b" },
};

export function Badge({ label, variant = "default" }) {
  const v = variants[variant] || variants.default;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "600" },
});
