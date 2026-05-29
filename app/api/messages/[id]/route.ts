import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const msg = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { read: !!body.read },
    });
    return NextResponse.json({ message: msg });
  } catch {
    return NextResponse.json({ error: "غير موجود." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح." }, { status: 401 });
  try {
    await prisma.contactMessage.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "غير موجود." }, { status: 404 });
  }
}
