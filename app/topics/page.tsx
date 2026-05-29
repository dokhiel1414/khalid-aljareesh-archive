import { Layers, ListOrdered } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import TopicCard from "@/components/TopicCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = {
  title: "المواضيع والبرامج",
  description: "تصفّح محتوى الأرشيف حسب الموضوع أو البرنامج.",
};

async function getTopics() {
  try {
    return await prisma.topic.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { items: true } } },
    });
  } catch {
    return [];
  }
}

export default async function TopicsPage() {
  const topics = await getTopics();
  const programs = topics.filter((t) => t.type === "PROGRAM");
  const themes = topics.filter((t) => t.type === "THEME");

  return (
    <>
      <SectionHeader
        title="المواضيع والبرامج"
        description="تصفّح المحتوى حسب موضوع معيّن أو برنامج، عبر الصوتيات والمرئيات والمقالات معاً."
        icon={Layers}
      />
      <div className="container py-10 space-y-12">
        {topics.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card p-10 text-center text-muted">
            لا توجد مواضيع بعد. تُضاف المواضيع والبرامج من لوحة التحكم، ثم تُسنَد للعناصر.
          </div>
        )}

        {programs.length > 0 && (
          <section>
            <h2 className="section-title flex items-center gap-2 mb-6">
              <ListOrdered className="h-6 w-6 text-brown dark:text-gold" />
              البرامج والسلاسل
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((t) => (
                <TopicCard
                  key={t.id}
                  topic={{ ...t, count: t._count.items }}
                />
              ))}
            </div>
          </section>
        )}

        {themes.length > 0 && (
          <section>
            <h2 className="section-title flex items-center gap-2 mb-6">
              <Layers className="h-6 w-6 text-brown dark:text-gold" />
              المواضيع
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => (
                <TopicCard
                  key={t.id}
                  topic={{ ...t, count: t._count.items }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
