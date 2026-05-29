import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkAdminCredentials,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "صيغة غير صحيحة." }, { status: 400 });
  }
  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "أدخل اسم المستخدم وكلمة المرور." },
      { status: 400 },
    );
  }
  if (!checkAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة." },
      { status: 401 },
    );
  }
  const token = await createSessionToken({ sub: username, role: "admin" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
