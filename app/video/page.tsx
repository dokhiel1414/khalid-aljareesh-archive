import { Video } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ItemGrid from "@/components/ItemGrid";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = { title: "المرئيات" };

async function getItems() {
  try {
    return await prisma.item.findMany({
      where: { category: "VIDEO" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function VideoPage() {
  const items = await getItems();
  return (
    <>
      <SectionHeader
        title="المرئيات"
        description="مرئيات مختارة وحلقات للمشاهدة المباشرة."
        icon={Video}
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
