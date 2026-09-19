import { Video } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import RevealGrid from "@/components/RevealGrid";
import ItemCard from "@/components/ItemCard";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = {
  title: "المرئيات",
  description: "مرئيات وحلقات مختارة لخالد بن علي الجريش — للمشاهدة المباشرة.",
  alternates: { canonical: "/video" },
  openGraph: {
    title: "المرئيات · أرشيف خالد بن علي الجريش",
    description: "مرئيات وحلقات مختارة لخالد بن علي الجريش.",
    url: "/video",
  },
};

async function getItems() {
  try {
    return await prisma.item.findMany({
      where: { category: "VIDEO", hidden: false },
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
        <RevealGrid>
          {items.map((i) => (
            <ItemCard key={i.id} item={{ ...i, publishedAt: i.publishedAt.toISOString() }} />
          ))}
        </RevealGrid>
      </section>
    </>
  );
}
