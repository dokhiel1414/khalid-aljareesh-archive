import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const MAX_LEN = {
  name: 120,
  email: 200,
  subject: 200,
  message: 5000,
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "صيغة غير صحيحة." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || name.length > MAX_LEN.name) {
    return NextResponse.json({ error: "الاسم مطلوب." }, { status: 400 });
  }
  if (!message || message.length > MAX_LEN.message) {
    return NextResponse.json(
      { error: "الرسالة مطلوبة (حتى 5000 حرف)." },
      { status: 400 },
    );
  }
  if (email && (email.length > MAX_LEN.email || !/^\S+@\S+\.\S+$/.test(email))) {
    return NextResponse.json({ error: "صيغة الإيميل غير صحيحة." }, { status: 400 });
  }
  if (subject.length > MAX_LEN.subject) {
    return NextResponse.json({ error: "الموضوع طويل جداً." }, { status: 400 });
  }

  // Honeypot field — bots tend to fill every input.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true, queued: true });
  }

  // Persist first so nothing is lost even if email fails.
  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email: email || null,
        subject: subject || null,
        message,
      },
    });
  } catch {
    // DB might be misconfigured — still try email so the message isn't lost.
  }

  const mail = await sendContactEmail({ name, email, subject, message });

  return NextResponse.json({
    ok: true,
    emailed: mail.sent,
  });
}
