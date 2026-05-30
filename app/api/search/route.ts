import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loadDevItems, searchItems } from "@/lib/dev-data";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const category = url.searchParams.get("category");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: Prisma.ItemWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category && ["AUDIO", "VIDEO", "WRITTEN"].includes(category)) {
    where.category = category as "AUDIO" | "VIDEO" | "WRITTEN";
  }
  if (from || to) {
    where.publishedAt = {};
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) where.publishedAt.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        where.publishedAt.lte = d;
      }
    }
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: 100,
  });
  if (items.length === 0) {
    const dev = await loadDevItems();
    const fallback = searchItems(dev, q, category);
    const limit = 100;
    return NextResponse.json({ items: fallback.slice(0, limit) });
  }
  return NextResponse.json({ items });
}
