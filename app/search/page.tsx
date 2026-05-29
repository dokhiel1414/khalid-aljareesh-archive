import { Search as SearchIcon } from "lucide-react";
import { Prisma } from "@prisma/client";
import SectionHeader from "@/components/SectionHeader";
import SearchBar from "@/components/SearchBar";
import ItemGrid from "@/components/ItemGrid";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "بحث" };

type SP = {
  q?: string;
  category?: "AUDIO" | "VIDEO" | "WRITTEN" | "ALL";
  from?: string;
  to?: string;
};

function parseDate(s?: string) {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

async function runSearch(sp: SP) {
  try {
    const where: Prisma.ItemWhereInput = {};
    if (sp.q && sp.q.trim()) {
      const q = sp.q.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (sp.category && sp.category !== "ALL") {
      where.category = sp.category;
    }
    const from = parseDate(sp.from);
    const to = parseDate(sp.to);
    if (from || to) {
      where.publishedAt = {};
      if (from) where.publishedAt.gte = from;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.publishedAt.lte = end;
      }
    }
    return await prisma.item.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const items = await runSearch(searchParams);
  const hasFilters =
    !!searchParams.q ||
    (searchParams.category && searchParams.category !== "ALL") ||
    !!searchParams.from ||
    !!searchParams.to;

  return (
    <>
      <SectionHeader
        title="البحث في الأرشيف"
        description="ابحث بالكلمة المفتاحية، أو فلتر بالقسم والتاريخ."
        icon={SearchIcon}
      />
      <section className="container py-8">
        <SearchBar />
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-ink/60">
            {hasFilters
              ? `النتائج: ${items.length}`
              : "اكتب كلمة للبحث أو استخدم الفلاتر للتصفّح."}
          </p>
        </div>
        <div className="mt-4">
          <ItemGrid
            items={items.map((i) => ({
              ...i,
              publishedAt: i.publishedAt.toISOString(),
            }))}
          />
        </div>
      </section>
    </>
  );
}
