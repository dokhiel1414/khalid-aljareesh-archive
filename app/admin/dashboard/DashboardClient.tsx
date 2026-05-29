"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Pencil,
  LogOut,
  Headphones,
  Video,
  BookOpen,
  ExternalLink,
  X,
  Save,
  Eye,
  Inbox,
  Mail,
  CheckCircle2,
  Circle,
  Layers,
  ListOrdered,
} from "lucide-react";
import {
  CATEGORY_LABEL,
  TOPIC_TYPE_LABEL,
  formatArabicDate,
  toArabicDigits,
} from "@/lib/utils";
import RichTextEditor from "@/components/RichTextEditor";
import ThemeSwitcher from "@/components/ThemeSwitcher";

type Category = "AUDIO" | "VIDEO" | "WRITTEN";
type TopicType = "THEME" | "PROGRAM";
type ItemTopicRef = { topicId: string; episodeOrder: number | null };
type Topic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: TopicType;
  coverImage: string | null;
  order: number;
  _count: { items: number };
};
type Item = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: Category;
  driveLink: string | null;
  driveFileId: string | null;
  thumbnail: string | null;
  publishedAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  topics: ItemTopicRef[];
};
type Message = {
  id: string;
  name: string;
  email: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

const ICONS = { AUDIO: Headphones, VIDEO: Video, WRITTEN: BookOpen };

const emptyForm = {
  title: "",
  category: "AUDIO" as Category,
  description: "",
  content: "",
  driveLink: "",
  thumbnail: "",
  publishedAt: "",
};

export default function DashboardClient({
  initialItems,
  initialMessages,
  initialTopics,
  totalVisits,
  theme,
  dbError,
}: {
  initialItems: Item[];
  initialMessages: Message[];
  initialTopics: Topic[];
  totalVisits: number;
  theme: "classic" | "ocean";
  dbError: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [form, setForm] = useState(emptyForm);
  const [formTopics, setFormTopics] = useState<ItemTopicRef[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);

  const unreadCount = messages.filter((m) => !m.read).length;

  async function toggleRead(m: Message) {
    const next = !m.read;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: next } : x)));
    try {
      await fetch(`/api/messages/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: next }),
      });
    } catch {
      // revert on failure
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: !next } : x)));
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("هل تريد حذف هذه الرسالة؟")) return;
    const r = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (r.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    } else {
      alert("تعذّر الحذف.");
    }
  }

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim()) {
      setMsg({ kind: "err", text: "العنوان مطلوب." });
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          publishedAt: form.publishedAt || null,
          topics: formTopics,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg({ kind: "err", text: data.error || "فشل الحفظ." });
        return;
      }
      setItems((prev) => [{ ...data.item, topics: formTopics }, ...prev]);
      setForm(emptyForm);
      setFormTopics([]);
      setMsg({ kind: "ok", text: "تمت الإضافة بنجاح." });
      router.refresh();
    } catch {
      setMsg({ kind: "err", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("هل تريد حذف هذا العنصر؟")) return;
    const r = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (r.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    } else {
      alert("تعذّر الحذف.");
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  function handleSaveEdit(updated: Item) {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
            لوحة التحكم
          </h1>
          <p className="text-muted text-sm mt-1">
            إدارة محتوى الأرشيف — إضافة، تعديل، وحذف العناصر.
          </p>
        </div>
        <button onClick={onLogout} className="btn-ghost text-ink">
          <LogOut className="h-4 w-4" /> خروج
        </button>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
          {dbError}
        </div>
      )}

      <ThemeSwitcher current={theme} />

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatBox icon={Eye}   label="إجمالي الزوار"  value={totalVisits} />
        <StatBox icon={BookOpen} label="عدد المواد"  value={items.length} />
        <StatBox
          icon={Mail}
          label="رسائل غير مقروءة"
          value={unreadCount}
          badge={unreadCount > 0 ? "جديد" : undefined}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 bg-white rounded-2xl border border-ink/10 shadow-soft p-6 space-y-4 h-fit"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-gold" />
            <h2 className="font-display font-bold text-ink">إضافة عنصر جديد</h2>
          </div>

          <Field label="العنوان *">
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="input"
              placeholder="مثال: محاضرة في فضل العلم"
            />
          </Field>

          <Field label="الفئة *">
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value as Category)}
              className="input"
            >
              <option value="AUDIO">صوتيات</option>
              <option value="VIDEO">مرئيات</option>
              <option value="WRITTEN">مقالات وكتب</option>
            </select>
          </Field>

          <Field label="الوصف">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input min-h-[80px]"
              placeholder="وصف مختصر عن المحتوى…"
            />
          </Field>

          {form.category === "WRITTEN" && (
            <Field
              label="نص المقال"
              hint="نسّق النص باستخدام شريط الأدوات (سماكة، حجم، لون، محاذاة…)."
            >
              <RichTextEditor
                value={form.content}
                onChange={(html) => update("content", html)}
              />
            </Field>
          )}

          <Field
            label="رابط Google Drive"
            hint={
              form.category === "WRITTEN"
                ? "اختياري — اتركه فارغاً للمقالات النصّية."
                : "تأكد من أن الملف مشارَك «بحيث يمكن لأي شخص لديه الرابط الاطلاع»."
            }
          >
            <input
              value={form.driveLink}
              onChange={(e) => update("driveLink", e.target.value)}
              className="input"
              dir="ltr"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
            />
          </Field>

          <Field label="رابط صورة الغلاف">
            <input
              value={form.thumbnail}
              onChange={(e) => update("thumbnail", e.target.value)}
              className="input"
              dir="ltr"
              placeholder="https://… (اختياري)"
            />
          </Field>

          <Field label="تاريخ النشر">
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => update("publishedAt", e.target.value)}
              className="input"
            />
          </Field>

          <Field
            label="المواضيع والبرامج"
            hint="اختر موضوعاً أو أكثر. للبرامج يمكنك تحديد رقم الحلقة."
          >
            <TopicSelector
              topics={topics}
              value={formTopics}
              onChange={setFormTopics}
            />
          </Field>

          {msg && (
            <div
              className={
                "text-sm rounded-lg px-3 py-2 " +
                (msg.kind === "ok"
                  ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                  : "bg-red-50 border border-red-100 text-red-700")
              }
            >
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "جاري الحفظ…" : "حفظ العنصر"}
          </button>
        </form>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink">المحتوى الحالي</h2>
            <span className="chip">{items.length} عنصر</span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-ink/60">
              لا توجد عناصر بعد. ابدأ بإضافة أول محتوى من النموذج.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => {
                const Icon = ICONS[it.category];
                return (
                  <li
                    key={it.id}
                    className="bg-white border border-ink/10 rounded-2xl p-4 flex items-start gap-4 hover:shadow-soft transition"
                  >
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-sand grid place-items-center text-brown">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/item/${it.id}`}
                          target="_blank"
                          className="font-medium text-ink truncate hover:text-brown"
                        >
                          {it.title}
                        </Link>
                        <span className="chip-gold">{CATEGORY_LABEL[it.category]}</span>
                      </div>
                      {it.description && (
                        <p className="text-sm text-ink/60 mt-1 line-clamp-2">
                          {it.description}
                        </p>
                      )}
                      <div className="text-xs text-muted mt-1 flex items-center gap-3 flex-wrap">
                        <span>{formatArabicDate(it.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {toArabicDigits(it.viewCount)} مشاهدة
                        </span>
                        {it.driveLink && (
                          <a
                            href={it.driveLink}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 text-brown hover:text-ink dark:text-gold"
                          >
                            رابط Drive <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {it.topics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {it.topics.map((ref) => {
                            const t = topics.find((x) => x.id === ref.topicId);
                            if (!t) return null;
                            return (
                              <span
                                key={ref.topicId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-sand text-ink/80 border border-ink/10"
                              >
                                {t.type === "PROGRAM" ? (
                                  <ListOrdered className="h-3 w-3 text-brown" />
                                ) : (
                                  <Layers className="h-3 w-3 text-brown" />
                                )}
                                {t.name}
                                {t.type === "PROGRAM" && ref.episodeOrder != null && (
                                  <span className="text-muted">
                                    · {toArabicDigits(ref.episodeOrder)}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(it)}
                        className="btn-ghost text-ink hover:bg-ink/5 px-2 h-9"
                        aria-label="تعديل"
                        title="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(it.id)}
                        className="btn-ghost text-red-600 hover:bg-red-50 px-2 h-9"
                        aria-label="حذف"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Topics & programs management */}
      <TopicsManager
        topics={topics}
        setTopics={setTopics}
        onChanged={() => router.refresh()}
      />

      {/* Contact messages */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-ink dark:text-sand flex items-center gap-2">
            <Inbox className="h-5 w-5 text-gold" />
            رسائل التواصل
          </h2>
          <span className="chip">
            {toArabicDigits(messages.length)} رسالة
            {unreadCount > 0 && (
              <span className="mr-1 text-brown">· غير مقروءة {toArabicDigits(unreadCount)}</span>
            )}
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card p-10 text-center text-muted">
            لا توجد رسائل واردة بعد.
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`bg-white dark:bg-dark-card border rounded-2xl p-4 flex items-start gap-3 hover:shadow-soft transition ${
                  m.read
                    ? "border-ink/10 dark:border-dark-border"
                    : "border-gold/50 ring-1 ring-gold/20"
                }`}
              >
                <button
                  onClick={() => toggleRead(m)}
                  className="mt-1 text-ink/60 hover:text-ink dark:text-sand/60 dark:hover:text-sand"
                  aria-label={m.read ? "وضع كغير مقروء" : "وضع كمقروء"}
                  title={m.read ? "وضع كغير مقروء" : "وضع كمقروء"}
                >
                  {m.read ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gold" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink dark:text-sand">{m.name}</span>
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="text-brown dark:text-gold text-sm hover:underline"
                        dir="ltr"
                      >
                        {m.email}
                      </a>
                    )}
                    {!m.read && <span className="chip-gold">جديد</span>}
                  </div>
                  {m.subject && (
                    <div className="text-sm text-muted mt-1">
                      <span className="font-medium">الموضوع:</span> {m.subject}
                    </div>
                  )}
                  <p className="text-sm text-ink/80 dark:text-sand/80 mt-2 whitespace-pre-wrap leading-relaxed">
                    {m.message}
                  </p>
                  <div className="text-xs text-muted mt-2">
                    {formatArabicDate(m.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => deleteMessage(m.id)}
                  className="btn-ghost text-red-600 hover:bg-red-50 px-2 h-9"
                  aria-label="حذف"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <EditModal
          item={editing}
          topics={topics}
          onClose={() => setEditing(null)}
          onSaved={handleSaveEdit}
        />
      )}
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  badge?: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-sand dark:bg-dark-surface grid place-items-center text-brown dark:text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted">{label}</div>
        <div className="font-display text-xl font-bold text-ink dark:text-sand">
          {toArabicDigits(value.toLocaleString("en-US"))}
        </div>
      </div>
      {badge && <span className="chip-gold">{badge}</span>}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink/50 mt-1">{hint}</p>}
    </div>
  );
}

function toDateInput(iso: string) {
  // Format as YYYY-MM-DD for <input type="date">
  try {
    const d = new Date(iso);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  } catch {
    return "";
  }
}

function EditModal({
  item,
  topics,
  onClose,
  onSaved,
}: {
  item: Item;
  topics: Topic[];
  onClose: () => void;
  onSaved: (item: Item) => void;
}) {
  const [form, setForm] = useState({
    title: item.title,
    category: item.category,
    description: item.description ?? "",
    content: item.content ?? "",
    driveLink: item.driveLink ?? "",
    thumbnail: item.thumbnail ?? "",
    publishedAt: toDateInput(item.publishedAt),
  });
  const [itemTopics, setItemTopics] = useState<ItemTopicRef[]>(item.topics ?? []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.title.trim()) {
      setErr("العنوان مطلوب.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          publishedAt: form.publishedAt || null,
          topics: itemTopics,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data.error || "فشل الحفظ.");
        return;
      }
      onSaved({ ...data.item, topics: itemTopics });
    } catch {
      setErr("تعذّر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-sand dark:bg-dark-bg rounded-2xl shadow-card border border-ink/10 dark:border-dark-border overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-ink/10">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-gold" />
            <h3 className="font-display font-bold text-ink">تعديل العنصر</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/60 hover:text-ink p-1"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <Field label="العنوان *">
            <input
              required
              value={form.title}
              onChange={(e) => up("title", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="الفئة *">
            <select
              value={form.category}
              onChange={(e) => up("category", e.target.value as Category)}
              className="input"
            >
              <option value="AUDIO">صوتيات</option>
              <option value="VIDEO">مرئيات</option>
              <option value="WRITTEN">مقالات وكتب</option>
            </select>
          </Field>

          <Field label="الوصف">
            <textarea
              value={form.description}
              onChange={(e) => up("description", e.target.value)}
              className="input min-h-[80px]"
            />
          </Field>

          {form.category === "WRITTEN" && (
            <Field label="نص المقال">
              <RichTextEditor
                value={form.content}
                onChange={(html) => up("content", html)}
              />
            </Field>
          )}

          <Field label="رابط Google Drive">
            <input
              value={form.driveLink}
              onChange={(e) => up("driveLink", e.target.value)}
              className="input"
              dir="ltr"
            />
          </Field>

          <Field label="رابط صورة الغلاف">
            <input
              value={form.thumbnail}
              onChange={(e) => up("thumbnail", e.target.value)}
              className="input"
              dir="ltr"
            />
          </Field>

          <Field label="تاريخ النشر">
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => up("publishedAt", e.target.value)}
              className="input"
            />
          </Field>

          <Field
            label="المواضيع والبرامج"
            hint="اختر موضوعاً أو أكثر. للبرامج يمكنك تحديد رقم الحلقة."
          >
            <TopicSelector
              topics={topics}
              value={itemTopics}
              onChange={setItemTopics}
            />
          </Field>

          {err && (
            <div className="text-sm rounded-lg px-3 py-2 bg-red-50 border border-red-100 text-red-700">
              {err}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white border-t border-ink/10">
          <button type="button" onClick={onClose} className="btn-ghost text-ink hover:bg-ink/5">
            إلغاء
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ…" : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Topic selector — used in both the add form and the edit modal.     */
/* ------------------------------------------------------------------ */
function TopicSelector({
  topics,
  value,
  onChange,
}: {
  topics: Topic[];
  value: ItemTopicRef[];
  onChange: (next: ItemTopicRef[]) => void;
}) {
  if (topics.length === 0) {
    return (
      <p className="text-xs text-ink/50">
        لا توجد مواضيع بعد. أضِف موضوعاً أو برنامجاً من قسم «المواضيع والبرامج» في الأسفل.
      </p>
    );
  }

  function toggle(id: string) {
    const exists = value.some((v) => v.topicId === id);
    if (exists) {
      onChange(value.filter((v) => v.topicId !== id));
    } else {
      onChange([...value, { topicId: id, episodeOrder: null }]);
    }
  }

  function setOrder(id: string, order: number | null) {
    onChange(
      value.map((v) => (v.topicId === id ? { ...v, episodeOrder: order } : v)),
    );
  }

  return (
    <div className="space-y-1.5 max-h-56 overflow-y-auto rounded-xl border border-ink/10 p-2">
      {topics.map((t) => {
        const selected = value.find((v) => v.topicId === t.id);
        const isProgram = t.type === "PROGRAM";
        return (
          <div
            key={t.id}
            className={
              "flex items-center gap-2 rounded-lg px-2 py-1.5 " +
              (selected ? "bg-sand" : "hover:bg-ink/5")
            }
          >
            <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() => toggle(t.id)}
                className="h-4 w-4 accent-brown"
              />
              {isProgram ? (
                <ListOrdered className="h-3.5 w-3.5 text-brown" />
              ) : (
                <Layers className="h-3.5 w-3.5 text-brown" />
              )}
              <span className="text-ink">{t.name}</span>
              <span className="text-[11px] text-muted">
                {TOPIC_TYPE_LABEL[t.type]}
              </span>
            </label>
            {selected && isProgram && (
              <input
                type="number"
                min={1}
                value={selected.episodeOrder ?? ""}
                onChange={(e) =>
                  setOrder(
                    t.id,
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                placeholder="الحلقة"
                className="input w-24 py-1 text-sm"
                title="رقم الحلقة"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Topics & programs manager — create / edit / delete topics.         */
/* ------------------------------------------------------------------ */
const emptyTopicForm = {
  name: "",
  type: "THEME" as TopicType,
  description: "",
  order: "",
};

function TopicsManager({
  topics,
  setTopics,
  onChanged,
}: {
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  onChanged: () => void;
}) {
  const [form, setForm] = useState(emptyTopicForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.name.trim()) {
      setErr("اسم الموضوع مطلوب.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          description: form.description,
          order: form.order === "" ? 0 : Number(form.order),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data.error || "تعذّر الإنشاء.");
        return;
      }
      setTopics((prev) =>
        [...prev, { ...data.topic, _count: { items: 0 } }].sort(
          (a, b) => a.order - b.order || a.name.localeCompare(b.name, "ar"),
        ),
      );
      setForm(emptyTopicForm);
      onChanged();
    } catch {
      setErr("تعذّر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTopic(t: Topic) {
    if (
      !confirm(
        `حذف «${t.name}»؟ لن تُحذف العناصر، لكن سيُزال هذا الموضوع عنها.`,
      )
    )
      return;
    const r = await fetch(`/api/topics/${t.id}`, { method: "DELETE" });
    if (r.ok) {
      setTopics((prev) => prev.filter((x) => x.id !== t.id));
      onChanged();
    } else {
      alert("تعذّر الحذف.");
    }
  }

  function applyUpdate(updated: Topic) {
    setTopics((prev) =>
      prev
        .map((x) => (x.id === updated.id ? { ...updated, _count: x._count } : x))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ar")),
    );
    onChanged();
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-ink dark:text-sand flex items-center gap-2">
          <Layers className="h-5 w-5 text-gold" />
          المواضيع والبرامج
        </h2>
        <span className="chip">{toArabicDigits(topics.length)} موضوع/برنامج</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          onSubmit={addTopic}
          className="lg:col-span-2 bg-white rounded-2xl border border-ink/10 shadow-soft p-5 space-y-3 h-fit"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold" />
            <h3 className="font-display font-bold text-ink text-sm">
              إضافة موضوع / برنامج
            </h3>
          </div>
          <Field label="الاسم *">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="مثال: رمضان · توجيهات أسرية"
            />
          </Field>
          <Field label="النوع *">
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as TopicType }))
              }
              className="input"
            >
              <option value="THEME">موضوع</option>
              <option value="PROGRAM">برنامج / سلسلة مرتّبة</option>
            </select>
          </Field>
          <Field label="الوصف">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="input min-h-[60px]"
              placeholder="وصف مختصر (اختياري)…"
            />
          </Field>
          <Field label="ترتيب العرض" hint="الأصغر يظهر أولاً (اختياري).">
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              className="input"
              placeholder="0"
            />
          </Field>
          {err && (
            <div className="text-sm rounded-lg px-3 py-2 bg-red-50 border border-red-100 text-red-700">
              {err}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "جاري الحفظ…" : "إضافة"}
          </button>
        </form>

        <div className="lg:col-span-3">
          {topics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-ink/60">
              لا توجد مواضيع بعد. أضِف أول موضوع أو برنامج من النموذج.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {topics.map((t) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  onDelete={() => removeTopic(t)}
                  onUpdated={applyUpdate}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function TopicRow({
  topic,
  onDelete,
  onUpdated,
}: {
  topic: Topic;
  onDelete: () => void;
  onUpdated: (t: Topic) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: topic.name,
    type: topic.type,
    description: topic.description ?? "",
    order: String(topic.order ?? 0),
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch(`/api/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          description: form.description,
          order: form.order === "" ? 0 : Number(form.order),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        alert(data.error || "تعذّر الحفظ.");
        return;
      }
      onUpdated(data.topic);
      setEditing(false);
    } catch {
      alert("تعذّر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  }

  const isProgram = topic.type === "PROGRAM";

  if (editing) {
    return (
      <li className="bg-white border border-gold/40 ring-1 ring-gold/20 rounded-2xl p-4 space-y-2">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value as TopicType }))
            }
            className="input"
          >
            <option value="THEME">موضوع</option>
            <option value="PROGRAM">برنامج</option>
          </select>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            className="input"
            placeholder="ترتيب"
          />
        </div>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="input min-h-[50px]"
          placeholder="الوصف"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="btn-ghost text-ink hover:bg-ink/5 text-sm"
          >
            إلغاء
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary text-sm"
          >
            <Save className="h-4 w-4" />
            {saving ? "حفظ…" : "حفظ"}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="bg-white border border-ink/10 rounded-2xl p-4 flex items-start gap-3 hover:shadow-soft transition">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-sand grid place-items-center text-brown">
        {isProgram ? (
          <ListOrdered className="h-5 w-5" />
        ) : (
          <Layers className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/topic/${encodeURIComponent(topic.slug)}`}
            target="_blank"
            rel="noopener"
            className="font-medium text-ink truncate hover:text-brown"
          >
            {topic.name}
          </a>
          <span className="chip-gold">{TOPIC_TYPE_LABEL[topic.type]}</span>
          <span className="text-xs text-muted">
            {toArabicDigits(topic._count.items)} عنصر
          </span>
        </div>
        {topic.description && (
          <p className="text-sm text-ink/60 mt-1 line-clamp-2">
            {topic.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="btn-ghost text-ink hover:bg-ink/5 px-2 h-9"
          aria-label="تعديل"
          title="تعديل"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="btn-ghost text-red-600 hover:bg-red-50 px-2 h-9"
          aria-label="حذف"
          title="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
