import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily salt — rotates per UTC day so the same IP produces a different hash
 * tomorrow. This means we can't correlate visits across days for the same
 * user, only count uniqueness within a day.
 */
function dailySalt(dayKey: string) {
  const base = process.env.AUTH_SECRET || "khalid-visit-salt";
  return `${base}::${dayKey}`;
}

function hashIp(ip: string, dayKey: string) {
  return createHash("sha256").update(`${dailySalt(dayKey)}::${ip}`).digest("hex");
}

function todayKey() {
  // YYYY-MM-DD in UTC
  return new Date().toISOString().slice(0, 10);
}

function clientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for; first entry is the actual client.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  // Fallback in dev
  return "0.0.0.0";
}

async function readTotal() {
  const row = await prisma.siteStats.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, visits: 0 },
  });
  return row.visits;
}

/** GET → returns current total without changing it. */
export async function GET() {
  try {
    const total = await readTotal();
    return NextResponse.json({ visits: total });
  } catch {
    return NextResponse.json({ visits: 0 });
  }
}

/**
 * POST → counts the visitor IFF this is the first hit from their IP today.
 * Returns the (possibly unchanged) total.
 */
export async function POST(req: NextRequest) {
  try {
    const dayKey = todayKey();
    const ip = clientIp(req);
    const ipHash = hashIp(ip, dayKey);

    // Atomic insert — if the same (ipHash, dayKey) exists, we get P2002 and
    // skip the counter bump.
    let counted = false;
    try {
      await prisma.uniqueVisit.create({ data: { ipHash, dayKey } });
      counted = true;
    } catch (e: unknown) {
      // Prisma throws P2002 on unique-constraint violation — that's our "already counted today" signal.
      const code = (e as { code?: string } | null)?.code;
      if (code !== "P2002") throw e;
    }

    let total: number;
    if (counted) {
      const row = await prisma.siteStats.upsert({
        where: { id: 1 },
        update: { visits: { increment: 1 } },
        create: { id: 1, visits: 1 },
      });
      total = row.visits;
    } else {
      total = await readTotal();
    }

    return NextResponse.json({ visits: total, counted });
  } catch {
    const total = await readTotal().catch(() => 0);
    return NextResponse.json({ visits: total, counted: false });
  }
}
