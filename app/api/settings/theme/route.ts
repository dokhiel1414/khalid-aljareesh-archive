import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getActiveTheme, setActiveTheme, normalizeTheme } from "@/lib/theme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const theme = await getActiveTheme();
  return NextResponse.json({ theme });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح." }, { status: 401 });
  }
  let body: { theme?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "صيغة غير صحيحة." }, { status: 400 });
  }
  const theme = normalizeTheme(body.theme);
  try {
    const saved = await setActiveTheme(theme);
    return NextResponse.json({ theme: saved });
  } catch {
    return NextResponse.json({ error: "تعذّر الحفظ." }, { status: 500 });
  }
}
