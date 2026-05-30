import { BookOpen } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ItemGrid from "@/components/ItemGrid";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = { title: "المقالات" };

async function getItems() {
  try {
    // Written section = anything readable: WRITTEN items (articles/PDFs) plus
    // merged audio/video items that carry an article body (content). This keeps
    // a lecture that has both a recording and a transcript discoverable here too.
    return await prisma.item.findMany({
      where: {
        OR: [
          { category: "WRITTEN" },
          { AND: [{ content: { not: null } }, { content: { not: "" } }] },
        ],
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function WrittenPage() {
  const items = await getItems();
  return (
    <>
      <SectionHeader
        title="المقالات"
        description="مقالات للقراءة المباشرة أو التحميل."
        icon={BookOpen}
      />
      <section className="container py-10">
        <div className="mb-6"><SearchBar /></div>
        <ItemGrid
          items={items.map((i) => ({ ...i, publishedAt: i.publishedAt.toISOString() }))}
        />
      </section>
    </>
  );
}
