import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    // Only count views for items that are publicly visible.
    const item = await prisma.item.updateMany({
      where: { id: params.id, hidden: false },
      data: { viewCount: { increment: 1 } },
    });
    if (item.count === 0) {
      return NextResponse.json({ viewCount: 0 }, { status: 404 });
    }
    const updated = await prisma.item.findUnique({
      where: { id: params.id },
      select: { viewCount: true },
    });
    return NextResponse.json({ viewCount: updated?.viewCount ?? 0 });
  } catch {
    return NextResponse.json({ viewCount: 0 }, { status: 404 });
  }
}
