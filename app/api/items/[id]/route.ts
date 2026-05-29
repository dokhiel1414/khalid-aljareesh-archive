import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { extractDriveFileId } from "@/lib/drive";
import { loadDevItems } from "@/lib/dev-data";
import { parseTopics } from "../route";

export const runtime = "nodejs";

const CATEGORIES = new Set(["AUDIO", "VIDEO", "WRITTEN"]);

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: { topics: { select: { topicId: true, episodeOrder: true } } },
  });
  if (item) return NextResponse.json({ item });
  const dev = await loadDevItems();
  const devItem = dev.find((i) => i.id === params.id);
  if (devItem) return NextResponse.json({ item: devItem });
  return NextResponse.json({ error: "غير موجود" }, { status: 404 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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

  const data: {
    title?: string;
    description?: string | null;
    content?: string | null;
    category?: "AUDIO" | "VIDEO" | "WRITTEN";
    driveLink?: string | null;
    driveFileId?: string | null;
    thumbnail?: string | null;
    publishedAt?: Date;
  } = {};

  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "العنوان لا يمكن أن يكون فارغاً." }, { status: 400 });
    data.title = t;
  }
  if (typeof body.category === "string") {
    if (!CATEGORIES.has(body.category)) {
      return NextResponse.json({ error: "الفئة غير صحيحة." }, { status: 400 });
    }
    data.category = body.category as "AUDIO" | "VIDEO" | "WRITTEN";
  }
  if ("description" in body) {
    data.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
  }
  if ("content" in body) {
    const raw = typeof body.content === "string" ? body.content.trim() : "";
    data.content = raw ? normalizeArticleContent(raw) : null;
  }
  if ("driveLink" in body) {
    const link =
      typeof body.driveLink === "string" && body.driveLink.trim()
        ? body.driveLink.trim()
        : null;
    data.driveLink = link;
    data.driveFileId = extractDriveFileId(link);
  }
  if ("thumbnail" in body) {
    data.thumbnail =
      typeof body.thumbnail === "string" && body.thumbnail.trim()
        ? body.thumbnail.trim()
        : null;
  }
  if ("publishedAt" in body && body.publishedAt) {
    const d = new Date(String(body.publishedAt));
    if (!Number.isNaN(d.getTime())) data.publishedAt = d;
  }

  try {
    // If `topics` was provided, replace the item's topic assignments.
    if ("topics" in body) {
      const topics = parseTopics(body.topics);
      await prisma.$transaction([
        prisma.itemTopic.deleteMany({ where: { itemId: params.id } }),
        ...(topics.length
          ? [
              prisma.itemTopic.createMany({
                data: topics.map((t) => ({
                  itemId: params.id,
                  topicId: t.topicId,
                  episodeOrder: t.episodeOrder,
                })),
                skipDuplicates: true,
              }),
            ]
          : []),
      ]);
    }

    const item = await prisma.item.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "لم يتم العثور على العنصر." }, { status: 404 });
  }
}

function normalizeArticleContent(input: string): string {
  if (/<\w[^>]*>/.test(input)) return input;
  return input
    .split(/\n\s*\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح." }, { status: 401 });
  }
  try {
    // Fetch first so we can record a tombstone if the item was Drive-backed.
    // The tombstone keeps bulk-import scripts from ever re-adding the same
    // file — the admin's deletion in the dashboard is the source of truth.
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      select: { driveFileId: true, title: true, category: true },
    });
    if (!item) {
      return NextResponse.json({ error: "لم يتم العثور على العنصر." }, { status: 404 });
    }

    if (item.driveFileId) {
      await prisma.deletedDriveItem.upsert({
        where: { driveFileId: item.driveFileId },
        update: { title: item.title, category: item.category },
        create: {
          driveFileId: item.driveFileId,
          title: item.title,
          category: item.category,
        },
      });
    }

    await prisma.item.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذّر الحذف." }, { status: 500 });
  }
}
