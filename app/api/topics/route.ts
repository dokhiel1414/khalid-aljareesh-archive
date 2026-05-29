import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const TYPES = new Set(["THEME", "PROGRAM"]);

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ topics });
  } catch {
    // DB not configured / table not pushed yet — degrade gracefully.
    return NextResponse.json({ topics: [] });
  }
}

/** Ensure the generated slug is unique by appending -2, -3, … on collision. */
async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "topic";
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.topic.findUnique({ where: { slug: candidate }, select: { slug: true } })) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "اسم الموضوع مطلوب." }, { status: 400 });
  }
  const type = TYPES.has(String(body.type)) ? (body.type as "THEME" | "PROGRAM") : "THEME";
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  const coverImage =
    typeof body.coverImage === "string" && body.coverImage.trim()
      ? body.coverImage.trim()
      : null;
  const order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;
  const slug = await uniqueSlug(
    typeof body.slug === "string" && body.slug.trim() ? body.slug : name,
  );

  try {
    const topic = await prisma.topic.create({
      data: { name, slug, type, description, coverImage, order },
    });
    return NextResponse.json({ topic }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذّر إنشاء الموضوع." }, { status: 500 });
  }
}
