"use client";
import { useState, useEffect } from "react";
import { User, Bell, Shield, Lock, Mail, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";

interface Profile {
  name: string;
  email: string;
  image: string;
}

export default function MerchantSettingsPage() {
  const { t, direction } = useI18n();
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", image: "" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    paymentUpdate: false,
  });

  useEffect(() => {
    fetch("/api/merchant/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          image: data.image || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: t("merchant.load_error") });
        setLoading(false);
      });
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: t("merchant.password_mismatch") });
      setSaving(false);
      return;
    }

    try {
      const body: Record<string, string> = { name: profile.name, image: profile.image };
      if (password) body.password = password;

      const res = await fetch("/api/merchant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: t("merchant.saved") });
      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "error", text: t("merchant.save_error") });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div dir={direction} className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={direction} className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          {t("merchant.account_settings")}
        </h1>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("merchant.profile_info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={t("merchant.account_name")}
              value={profile.name}
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label={t("merchant.account_email")}
              type="email"
              value={profile.email}
              disabled
            />
            <Input
              label={t("merchant.profile_image")}
              value={profile.image}
              onChange={(e) => setProfile((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("merchant.change_password")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("merchant.new_password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label={t("merchant.confirm_password")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("merchant.notifications")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {([
              { key: "newOrder" as const, label: t("merchant.notif_new_order") },
              { key: "lowStock" as const, label: t("merchant.notif_low_stock") },
              { key: "paymentUpdate" as const, label: t("merchant.notif_payment") },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <button
                  type="button"
                  onClick={() => toggleNotification(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[item.key] ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} disabled={saving}>
            <Save className="h-4 w-4 ms-2" />
            {t("merchant.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
