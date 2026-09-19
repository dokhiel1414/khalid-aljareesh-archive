import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  let items: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    category: "AUDIO" | "VIDEO" | "WRITTEN";
    driveLink: string | null;
    driveFileId: string | null;
    thumbnail: string | null;
    hidden: boolean;
    publishedAt: Date;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    topics?: { topicId: string; episodeOrder: number | null }[];
  }[] = [];
  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = [];
  let topics: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: "THEME" | "PROGRAM";
    coverImage: string | null;
    order: number;
    _count: { items: number };
  }[] = [];
  let totalVisits = 0;
  let dbError: string | null = null;
  try {
    [items, messages, topics, totalVisits] = await Promise.all([
      prisma.item.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        include: { topics: { select: { topicId: true, episodeOrder: true } } },
      }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.topic.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { _count: { select: { items: true } } },
      }),
      prisma.siteStats
        .findUnique({ where: { id: 1 } })
        .then((r) => r?.visits ?? 0)
        .catch(() => 0),
    ]);
  } catch {
    dbError =
      "تعذّر الاتصال بقاعدة البيانات. تأكد من ضبط DATABASE_URL وتشغيل prisma db push.";
  }

  return (
    <DashboardClient
      initialItems={items.map((i) => ({
        ...i,
        topics: i.topics ?? [],
        publishedAt: i.publishedAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      }))}
      initialMessages={messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }))}
      initialTopics={topics}
      totalVisits={totalVisits}
      dbError={dbError}
    />
  );
}
