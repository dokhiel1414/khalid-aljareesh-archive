import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { extractDriveFileId } from "@/lib/drive";
import { loadDevItems, filterAndSort } from "@/lib/dev-data";

export const runtime = "nodejs";

const CATEGORIES = new Set(["AUDIO", "VIDEO", "WRITTEN"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const items = await prisma.item.findMany({
    where: category && CATEGORIES.has(category)
      ? { category: category as "AUDIO" | "VIDEO" | "WRITTEN" }
      : undefined,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  if (items.length === 0) {
    const dev = await loadDevItems();
    const fallback = filterAndSort(dev, category, limit);
    return NextResponse.json({ items: fallback });
  }
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "صيغة غير صحيحة." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : null;
  const rawContent =
    typeof body.content === "string" ? body.content.trim() : "";
  const content = rawContent ? normalizeArticleContent(rawContent) : null;
  const driveLink =
    typeof body.driveLink === "string" ? body.driveLink.trim() : null;
  const thumbnail =
    typeof body.thumbnail === "string" && body.thumbnail.trim()
      ? body.thumbnail.trim()
      : null;
  const publishedAtRaw =
    typeof body.publishedAt === "string" ? body.publishedAt : null;

  if (!title) {
    return NextResponse.json(
      { error: "العنوان مطلوب." },
      { status: 400 },
    );
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "الفئة غير صحيحة." },
      { status: 400 },
    );
  }

  let publishedAt = new Date();
  if (publishedAtRaw) {
    const d = new Date(publishedAtRaw);
    if (!Number.isNaN(d.getTime())) publishedAt = d;
  }

  const driveFileId = extractDriveFileId(driveLink);
  const topics = parseTopics(body.topics);

  const item = await prisma.item.create({
    data: {
      title,
      description,
      content,
      category: category as "AUDIO" | "VIDEO" | "WRITTEN",
      driveLink,
      driveFileId,
      thumbnail,
      publishedAt,
      ...(topics.length
        ? {
            topics: {
              create: topics.map((t) => ({
                topicId: t.topicId,
                episodeOrder: t.episodeOrder,
              })),
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

/** Normalise the topics payload: accepts string[] or {topicId, episodeOrder}[]. */
export function parseTopics(
  raw: unknown,
): { topicId: string; episodeOrder: number | null }[] {
  if (!Array.isArray(raw)) return [];
  const out: { topicId: string; episodeOrder: number | null }[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    let topicId = "";
    let episodeOrder: number | null = null;
    if (typeof entry === "string") {
      topicId = entry;
    } else if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      topicId = typeof e.topicId === "string" ? e.topicId : "";
      if (e.episodeOrder != null && Number.isFinite(Number(e.episodeOrder))) {
        episodeOrder = Number(e.episodeOrder);
      }
    }
    if (!topicId || seen.has(topicId)) continue;
    seen.add(topicId);
    out.push({ topicId, episodeOrder });
  }
  return out;
}

/**
 * Lets the admin paste either raw HTML or plain text into the content field.
 * If the input doesn't look like HTML, wrap each blank-line-delimited block
 * in a <p> so paragraph breaks survive.
 */
function normalizeArticleContent(input: string): string {
  if (/<\w[^>]*>/.test(input)) return input; // already HTML
  return input
    .split(/\n\s*\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}
