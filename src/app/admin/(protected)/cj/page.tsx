"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Database, Search, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface Log {
  id: string;
  action: string;
  status: string;
  message: string;
  synced: number;
  failed: number;
  createdAt: string;
}

export default function CjDropshippingPage() {
  const { t, locale } = useI18n();
  const [settings, setSettings] = useState<any>(null);
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [maxPages, setMaxPages] = useState(1);
  const [categoryId, setCategoryId] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, tRes, lRes] = await Promise.all([
        fetch("/api/cj/settings"),
        fetch("/api/cj/auth"),
        fetch("/api/cj/logs"),
      ]);
      if (sRes.ok) {
        const s = await sRes.json();
        setSettings(s);
        setApiKey(s.apiKey || "");
      }
      if (tRes.ok) setTokenStatus(await tRes.json());
      if (lRes.ok) setLogs(await lRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveSettings = async () => {
    setError("");
    const res = await fetch("/api/cj/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to save");
      return;
    }
    await fetchAll();
  };

  const getToken = async () => {
    setError("");
    setSyncing("token");
    const res = await fetch("/api/cj/auth", { method: "POST" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to get token");
      setSyncing(null);
      return;
    }
    await fetchAll();
    setSyncing(null);
  };

  const syncCategories = async () => {
    setError("");
    setSyncing("categories");
    const res = await fetch("/api/cj/sync/categories", { method: "POST" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Sync failed");
      setSyncing(null);
      return;
    }
    await fetchAll();
    setSyncing(null);
  };

  const importProducts = async () => {
    setError("");
    setSyncing("products");
    const res = await fetch("/api/cj/sync/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: searchKeyword,
        pages: maxPages,
        categoryId: categoryId || undefined,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Import failed");
      setSyncing(null);
      return;
    }
    await fetchAll();
    setSyncing(null);
  };

  const actionLabel = (a: string) => {
    const map: Record<string, string> = {
      SYNC_CATEGORIES: t("admin.cj_sync_categories"),
      IMPORT_PRODUCTS: t("admin.cj_import"),
    };
    return map[a] || a;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">{t("admin.cj_title")}</h1>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("admin.cj_refresh")}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t("admin.cj_api_key")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              dir="ltr"
              placeholder={t("admin.cj_api_key_placeholder")}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={saveSettings}>{t("admin.cj_save")}</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("admin.cj_api_key_help")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {t("admin.cj_access_token")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={tokenStatus?.hasToken ? "default" : "outline"}>
              {tokenStatus?.hasToken ? t("admin.cj_token_active") : t("admin.cj_token_inactive")}
            </Badge>
            {tokenStatus?.expiresAt && (
              <span className="text-xs text-muted-foreground">
                {t("admin.cj_token_expires")}: {new Date(tokenStatus.expiresAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
              </span>
            )}
          </div>
          <Button onClick={getToken} disabled={syncing === "token" || !apiKey}>
            {syncing === "token" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            {t("admin.cj_get_token")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t("admin.cj_sync")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={syncCategories}
              disabled={syncing === "categories" || !tokenStatus?.hasToken}
            >
              {syncing === "categories" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              {t("admin.cj_sync_categories")}
            </Button>
            {settings?.lastCategorySyncAt && (
              <span className="text-xs text-muted-foreground self-center">
                {t("admin.cj_last_sync")}: {new Date(settings.lastCategorySyncAt).toLocaleString(locale === "ar" ? "ar" : "en")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("admin.cj_import")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{t("admin.cj_keyword")}</label>
              <Input
                dir="ltr"
                placeholder={t("admin.cj_keyword_placeholder")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{t("admin.cj_pages")}</label>
              <Input
                type="number"
                min={1}
                max={10}
                dir="ltr"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{t("admin.cj_category_id")}</label>
              <Input
                dir="ltr"
                placeholder={t("admin.cj_category_id_placeholder")}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={importProducts}
            disabled={syncing === "products" || !tokenStatus?.hasToken}
          >
            {syncing === "products" ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            {syncing === "products" ? t("admin.cj_importing") : t("admin.cj_import_btn")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("admin.cj_logs")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("admin.cj_no_logs")}</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.status === "SUCCESS" ? "success" : "danger"}>
                      {log.status === "SUCCESS" ? t("admin.cj_success") : t("admin.cj_fail")}
                    </Badge>
                    <span className="font-medium">{actionLabel(log.action)}</span>
                    <span className="text-muted-foreground">{log.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
