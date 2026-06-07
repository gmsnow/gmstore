import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nServerProvider } from "@/components/i18n-server-provider";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GM Store",
  description: "Modern e-commerce store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            <I18nServerProvider>{children}</I18nServerProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
