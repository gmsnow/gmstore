import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../../lib/theme";

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline, error, style }) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: theme.foreground }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedForeground}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
            borderColor: error ? theme.destructive : theme.border,
            color: theme.foreground,
            minHeight: multiline ? 80 : undefined,
          },
          style,
        ]}
      />
      {error && <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { fontSize: 13, fontWeight: "500" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  error: { fontSize: 11 },
});
