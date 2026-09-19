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
  // "light=1" strips the heavy article HTML (content) — for live search UIs.
  const light = url.searchParams.get("light") === "1";
  const limitParam = Number(url.searchParams.get("limit") ?? "");
  const limit = Number.isFinite(limitParam) && limitParam >= 1
    ? Math.min(Math.floor(limitParam), 100)
    : 100;

  const where: Prisma.ItemWhereInput = { hidden: false };
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
    take: limit,
  });
  if (items.length === 0) {
    const dev = await loadDevItems();
    const fallback = searchItems(dev, q, category).slice(0, limit);
    return NextResponse.json({
      items: light
        ? fallback.map(({ content: _content, ...rest }) => rest)
        : fallback,
    });
  }
  return NextResponse.json({
    items: light
      ? items.map(({ content: _content, ...rest }) => rest)
      : items,
  });
}
