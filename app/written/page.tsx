import { BookOpen } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ItemGrid from "@/components/ItemGrid";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = { title: "المقالات" };

async function getItems() {
  try {
    return await prisma.item.findMany({
      where: { category: "WRITTEN" },
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
