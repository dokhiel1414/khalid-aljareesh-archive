import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "لا توجد نتائج بعد",
  description = "سيتم عرض المحتوى هنا فور إضافته من لوحة التحكم.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-sand grid place-items-center text-brown">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-display font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink/60">{description}</p>
    </div>
  );
}
