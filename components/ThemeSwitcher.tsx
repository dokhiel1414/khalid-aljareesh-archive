"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Palette, Check } from "lucide-react";

type ThemeName = "classic" | "ocean";

const OPTIONS: {
  value: ThemeName;
  label: string;
  desc: string;
  swatches: string[];
}[] = [
  {
    value: "classic",
    label: "الكلاسيكي",
    desc: "ذهبي دافئ على خلفية رملية — خط ثُمانية",
    swatches: ["#072C49", "#DEA470", "#C17E5A", "#ECE6DD"],
  },
  {
    value: "ocean",
    label: "المحيط",
    desc: "أزرق سماوي هادئ على خلفية فاتحة — خط Tajawal",
    swatches: ["#4F9CFF", "#3EC6D7", "#7FB7FF", "#F4F7FC"],
  },
];

export default function ThemeSwitcher({ current }: { current: ThemeName }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ThemeName>(current);
  const [saving, setSaving] = useState<ThemeName | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function pick(theme: ThemeName) {
    if (theme === selected || saving) return;
    setSaving(theme);
    setMsg(null);
    try {
      const r = await fetch("/api/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg(data.error || "تعذّر الحفظ.");
        return;
      }
      setSelected(theme);
      setMsg("تم تطبيق التصميم على كامل الموقع.");
      router.refresh();
    } catch {
      setMsg("تعذّر الاتصال بالخادم.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border rounded-2xl shadow-soft p-6 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="h-5 w-5 text-gold" />
        <h2 className="font-display font-bold text-ink dark:text-sand">
          تصميم الموقع
        </h2>
      </div>
      <p className="text-sm text-muted mb-4">
        اختر الثيم الذي يظهر لجميع الزوار. يُطبَّق فوراً.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((o) => {
          const active = selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              disabled={!!saving}
              className={
                "text-right rounded-xl border p-4 transition relative " +
                (active
                  ? "border-gold ring-2 ring-gold/40 bg-gold/5"
                  : "border-ink/10 dark:border-dark-border hover:border-gold/50")
              }
            >
              {active && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check className="h-4 w-4" /> مُفعّل
                </span>
              )}
              {saving === o.value && (
                <span className="absolute top-3 left-3 text-xs text-muted">
                  جاري الحفظ…
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-3">
                {o.swatches.map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="font-display font-bold text-ink dark:text-sand">
                {o.label}
              </div>
              <div className="text-xs text-muted mt-1 leading-relaxed">
                {o.desc}
              </div>
            </button>
          );
        })}
      </div>

      {msg && (
        <p className="text-sm mt-3 text-emerald-700 dark:text-emerald-400">{msg}</p>
      )}
    </section>
  );
}
