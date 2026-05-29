import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getActiveTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  const theme = await getActiveTheme();
  let items: Awaited<ReturnType<typeof prisma.item.findMany>> = [];
  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = [];
  let totalVisits = 0;
  let dbError: string | null = null;
  try {
    [items, messages, totalVisits] = await Promise.all([
      prisma.item.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
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
        publishedAt: i.publishedAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      }))}
      initialMessages={messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }))}
      totalVisits={totalVisits}
      theme={theme}
      dbError={dbError}
    />
  );
}
