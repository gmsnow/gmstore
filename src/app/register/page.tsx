"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role"),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but login failed");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Store className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle>{t("auth.register")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" name="name" label={t("auth.name")} required />
            <Input id="email" name="email" type="email" label={t("auth.email")} required />
            <Input id="password" name="password" type="password" label={t("auth.password")} required />
            <div className="space-y-1">
              <label htmlFor="role" className="text-sm font-medium">{t("auth.select_role")}</label>
              <select id="role" name="role" className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="CUSTOMER">{t("auth.customer")}</option>
                <option value="MERCHANT">{t("auth.merchant")}</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              <UserPlus className="ml-2 h-4 w-4" /> {t("auth.register_btn")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.have_account")}{" "}
            <a href="/login" className="text-primary hover:underline">{t("auth.login_link")}</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
