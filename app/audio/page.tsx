import { Headphones } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import RevealGrid from "@/components/RevealGrid";
import ItemCard from "@/components/ItemCard";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const metadata = {
  title: "الصوتيات",
  description: "محاضرات ودروس صوتية للشيخ خالد بن علي الجريش — للاستماع المباشر والتحميل.",
  alternates: { canonical: "/audio" },
  openGraph: {
    title: "الصوتيات · أرشيف الشيخ خالد بن علي الجريش",
    description: "محاضرات ودروس صوتية للشيخ خالد بن علي الجريش.",
    url: "/audio",
  },
};

async function getItems() {
  try {
    return await prisma.item.findMany({
      where: { category: "AUDIO" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AudioPage() {
  const items = await getItems();
  return (
    <>
      <SectionHeader
        title="الصوتيات"
        description="استمع للمحاضرات والدروس الصوتية مباشرة."
        icon={Headphones}
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
