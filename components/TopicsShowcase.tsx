import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TopicCard from "@/components/TopicCard";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/prisma";

async function getTopics() {
  try {
    return await prisma.topic.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { items: true } } },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function TopicsShowcase() {
  const topics = await getTopics();
  if (topics.length === 0) return null;

  return (
    <section className="container pb-4">
      <Reveal>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title">تصفّح حسب الموضوع</h2>
            <p className="text-muted mt-1 text-sm md:text-base">
              مواضيع وبرامج تجمع الصوتيات والمرئيات والمقالات في مكان واحد.
            </p>
          </div>
          <Link
            href="/topics"
            className="hidden sm:inline-flex btn-ghost text-ink hover:bg-ink/5"
          >
            كل المواضيع <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 90}>
            <TopicCard topic={{ ...t, count: t._count.items }} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
