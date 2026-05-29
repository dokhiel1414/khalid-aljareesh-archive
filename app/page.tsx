import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import TopicsShowcase from "@/components/TopicsShowcase";
import ItemCard from "@/components/ItemCard";
import EmptyState from "@/components/EmptyState";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

async function getLatest() {
  try {
    return await prisma.item.findMany({
      orderBy: { publishedAt: "desc" },
      take: 8,
    });
  } catch {
    // DB not configured yet — render empty state instead of crashing.
    return [];
  }
}

export default async function HomePage() {
  const latest = await getLatest();

  return (
    <>
      <Hero />
      <CategoryGrid />
      <TopicsShowcase />

      <section className="container pb-20">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title">أحدث الإضافات</h2>
            <p className="text-muted mt-1 text-sm md:text-base">
              مختارات من آخر ما تمت إضافته إلى الأرشيف.
            </p>
          </div>
          <Link
            href="/search"
            className="hidden sm:inline-flex btn-ghost text-ink hover:bg-ink/5"
          >
            عرض الكل <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {latest.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((item) => (
              <ItemCard
                key={item.id}
                item={{
                  ...item,
                  publishedAt: item.publishedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
