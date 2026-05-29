// Lightweight Resend mailer. If RESEND_API_KEY isn't set, send() becomes a
// no-op and just returns { sent: false } — the calling route should still
// persist the message to the DB so nothing is lost.
//
// To enable email delivery on Vercel:
//   1. Sign up at https://resend.com (free).
//   2. Create an API key. Add it as env var RESEND_API_KEY.
//   3. (Optional) Verify a sending domain. Until verified, Resend will
//      only deliver to the same address that owns the account.
//   4. Set CONTACT_TO_EMAIL (defaults to abo.salehq@gmail.com).
//   5. Set CONTACT_FROM_EMAIL (defaults to onboarding@resend.dev — Resend's
//      shared sandbox sender, fine for testing).

export const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL || "abo.salehq@gmail.com";
const CONTACT_FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

export type ContactPayload = {
  name: string;
  email?: string | null;
  subject?: string | null;
  message: string;
};

export async function sendContactEmail(p: ContactPayload): Promise<{
  sent: boolean;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: "no-api-key" };

  const subject = p.subject?.trim()
    ? `[تواصل] ${p.subject.trim()}`
    : `[تواصل] رسالة جديدة من ${p.name}`;

  const html = `
    <div dir="rtl" style="font-family:'Tahoma',sans-serif;line-height:1.7;color:#072C49">
      <h2 style="margin:0 0 12px;color:#0A3A5E">رسالة جديدة من الموقع</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><b>الاسم:</b></td><td>${escapeHtml(p.name)}</td></tr>
        ${p.email ? `<tr><td><b>الإيميل:</b></td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>` : ""}
        ${p.subject ? `<tr><td><b>الموضوع:</b></td><td>${escapeHtml(p.subject)}</td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid #DEA470;margin:16px 0" />
      <div style="white-space:pre-wrap">${escapeHtml(p.message)}</div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Sheikh Khalid Archive <${CONTACT_FROM_EMAIL}>`,
        to: [CONTACT_TO_EMAIL],
        subject,
        html,
        reply_to: p.email || undefined,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { sent: false, error: `resend ${res.status}: ${t.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
