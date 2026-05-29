"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/admin/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data.error || "تعذّر تسجيل الدخول.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-ink/10 shadow-card p-6 space-y-4"
    >
      <div>
        <label className="label">اسم المستخدم</label>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input pr-10"
            autoComplete="username"
            required
          />
        </div>
      </div>
      <div>
        <label className="label">كلمة المرور</label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pr-10"
            autoComplete="current-password"
            required
          />
        </div>
      </div>
      {error && (
        <div className="text-sm bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "جاري الدخول…" : "دخول"}
      </button>
    </form>
  );
}
