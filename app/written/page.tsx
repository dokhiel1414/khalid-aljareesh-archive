import { BookOpen } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import RevealGrid from "@/components/RevealGrid";
import ItemCard from "@/components/ItemCard";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = {
  title: "المقالات",
  description: "مقالات وكتب وتفريغات نصية لخالد بن علي الجريش — للقراءة المباشرة والتحميل.",
  alternates: { canonical: "/written" },
  openGraph: {
    title: "المقالات · أرشيف خالد بن علي الجريش",
    description: "مقالات وكتب وتفريغات نصية لخالد بن علي الجريش.",
    url: "/written",
  },
};

async function getItems() {
  try {
    // Written section = anything readable: WRITTEN items (articles/PDFs) plus
    // merged audio/video items that carry an article body (content). This keeps
    // a lecture that has both a recording and a transcript discoverable here too.
    return await prisma.item.findMany({
      where: {
        hidden: false,
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
        <RevealGrid>
          {items.map((i) => (
            <ItemCard key={i.id} item={{ ...i, publishedAt: i.publishedAt.toISOString() }} />
          ))}
        </RevealGrid>
      </section>
    </>
  );
}
