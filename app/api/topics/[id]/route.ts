import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const TYPES = new Set(["THEME", "PROGRAM"]);

export async function PATCH(
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
    name?: string;
    slug?: string;
    type?: "THEME" | "PROGRAM";
    description?: string | null;
    coverImage?: string | null;
    order?: number;
  } = {};

  if (typeof body.name === "string") {
    const n = body.name.trim();
    if (!n) return NextResponse.json({ error: "الاسم لا يمكن أن يكون فارغاً." }, { status: 400 });
    data.name = n;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    data.slug = slugify(body.slug);
  }
  if (typeof body.type === "string" && TYPES.has(body.type)) {
    data.type = body.type as "THEME" | "PROGRAM";
  }
  if ("description" in body) {
    data.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
  }
  if ("coverImage" in body) {
    data.coverImage =
      typeof body.coverImage === "string" && body.coverImage.trim()
        ? body.coverImage.trim()
        : null;
  }
  if ("order" in body && Number.isFinite(Number(body.order))) {
    data.order = Number(body.order);
  }

  try {
    const topic = await prisma.topic.update({ where: { id: params.id }, data });
    return NextResponse.json({ topic });
  } catch {
    return NextResponse.json(
      { error: "تعذّر التعديل (قد يكون الاسم المختصر مكرّراً)." },
      { status: 400 },
    );
  }
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
    // ItemTopic rows are removed automatically (onDelete: Cascade). Items stay.
    await prisma.topic.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذّر الحذف." }, { status: 500 });
  }
}
