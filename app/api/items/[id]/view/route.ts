import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const item = await prisma.item.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return NextResponse.json({ viewCount: item.viewCount });
  } catch {
    return NextResponse.json({ viewCount: 0 }, { status: 404 });
  }
}
