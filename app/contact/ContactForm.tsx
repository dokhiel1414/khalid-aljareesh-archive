"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const empty = { name: "", email: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { emailed: boolean }>(null);
  const [error, setError] = useState<string | null>(null);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "تعذّر إرسال الرسالة.");
        return;
      }
      setDone({ emailed: !!data.emailed });
      setForm(empty);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 grid place-items-center text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-display font-bold text-ink dark:text-sand text-xl">
          تم استلام رسالتك
        </h3>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          {done.emailed
            ? "تم إرسالها إلى البريد الإلكتروني وحفظها في الأرشيف."
            : "تم حفظ رسالتك في الأرشيف وسيتم الاطلاع عليها قريباً."}
        </p>
        <button
          type="button"
          onClick={() => setDone(null)}
          className="mt-6 btn-ghost"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      {/* Honeypot — hidden from humans, attractive to bots */}
      <input
        type="text"
        value={form.website}
        onChange={(e) => up("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">الاسم *</label>
          <input
            required
            value={form.name}
            onChange={(e) => up("name", e.target.value)}
            className="input"
            maxLength={120}
          />
        </div>
        <div>
          <label className="label">البريد الإلكتروني</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => up("email", e.target.value)}
            className="input"
            dir="ltr"
            maxLength={200}
          />
        </div>
      </div>

      <div>
        <label className="label">الموضوع</label>
        <input
          value={form.subject}
          onChange={(e) => up("subject", e.target.value)}
          className="input"
          maxLength={200}
        />
      </div>

      <div>
        <label className="label">الرسالة *</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => up("message", e.target.value)}
          className="input min-h-[180px]"
          maxLength={5000}
        />
        <p className="text-xs text-muted mt-1">
          {form.message.length} / 5000
        </p>
      </div>

      {error && (
        <div className="text-sm rounded-lg px-3 py-2 bg-red-50 border border-red-100 text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
        <Send className="h-4 w-4" />
        {loading ? "جاري الإرسال…" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
