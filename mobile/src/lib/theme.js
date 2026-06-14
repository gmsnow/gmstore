import { createContext, useContext, useState } from "react";

const colors = {
  primary: "#2563eb",
  primaryForeground: "#ffffff",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  destructive: "#ef4444",
  success: "#22c55e",
  warning: "#eab308",
};

const darkColors = {
  ...colors,
  background: "#0f172a",
  foreground: "#f1f5f9",
  muted: "#1e293b",
  mutedForeground: "#94a3b8",
  border: "#334155",
  card: "#1e293b",
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkColors : colors;

  function toggleTheme() { setIsDark((p) => !p); }

  return <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
