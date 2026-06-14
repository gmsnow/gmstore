"use client";
import { useState, useEffect } from "react";
import { Store, Save, Upload, Link, Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";

interface StoreProfile {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  logo: string;
  cover: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  shippingAddress: string;
}

const emptyProfile: StoreProfile = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  logo: "",
  cover: "",
  phone: "",
  email: "",
  address: "",
  whatsapp: "",
  telegram: "",
  instagram: "",
  facebook: "",
  twitter: "",
  tiktok: "",
  shippingAddress: "",
};

export default function MerchantStorePage() {
  const { t, direction } = useI18n();
  const [profile, setProfile] = useState<StoreProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/merchant/store")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        const sanitized = { ...emptyProfile };
        for (const key of Object.keys(emptyProfile) as (keyof StoreProfile)[]) {
          sanitized[key] = data[key] ?? "";
        }
        setProfile(sanitized);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: t("merchant.load_error") });
        setLoading(false);
      });
  }, [t]);

  const update = (field: keyof StoreProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/merchant/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: t("merchant.saved") });
    } catch {
      setMessage({ type: "error", text: t("merchant.save_error") });
    } finally {
      setSaving(false);
    }
  };

  const socialFields: { key: keyof StoreProfile; icon: typeof Globe; label: string }[] = [
    { key: "whatsapp", icon: Link, label: "WhatsApp" },
    { key: "telegram", icon: Link, label: "Telegram" },
    { key: "instagram", icon: Link, label: "Instagram" },
    { key: "facebook", icon: Link, label: "Facebook" },
    { key: "twitter", icon: Link, label: "Twitter" },
    { key: "tiktok", icon: Link, label: "TikTok" },
  ];

  if (loading) {
    return (
      <div dir={direction} className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            {t("merchant.store_settings")}
          </h1>
        </div>
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
            <CardTitle>{t("merchant.basic_info")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("merchant.store_name")}
                value={profile.name}
                onChange={(e) => update("name", e.target.value)}
              />
              <Input
                label={t("merchant.store_name_en")}
                value={profile.nameEn}
                onChange={(e) => update("nameEn", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Textarea
                label={t("merchant.description")}
                value={profile.description}
                onChange={(e) => update("description", e.target.value)}
              />
              <Textarea
                label={t("merchant.description_en")}
                value={profile.descriptionEn}
                onChange={(e) => update("descriptionEn", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t("merchant.media")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={t("merchant.logo_url")}
              value={profile.logo}
              onChange={(e) => update("logo", e.target.value)}
              placeholder="https://..."
            />
            <Input
              label={t("merchant.cover_url")}
              value={profile.cover}
              onChange={(e) => update("cover", e.target.value)}
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("merchant.contact_info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("merchant.phone")}
                value={profile.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
              <Input
                label={t("merchant.email")}
                type="email"
                value={profile.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <Textarea
              label={t("merchant.address")}
              value={profile.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("merchant.social_links")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {socialFields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  value={profile[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder="https://..."
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("merchant.shipping_address")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.shippingAddress}
              onChange={(e) => update("shippingAddress", e.target.value)}
            />
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
