import { NextRequest } from "next/server";

// Audio/video proxy for Google Drive. Lets us use a styled HTML5 <audio>
// element with proper seeking — the browser can't hit Drive directly
// because Drive returns CORS-blocked redirects + a virus-scan HTML page
// for files larger than ~100MB.
//
// We forward the Range header so seeking is fast (206 partial responses
// instead of redownloading the whole file).
//
// Usage:  /api/stream?id=DRIVE_FILE_ID

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_RE = /^[a-zA-Z0-9_-]{20,}$/;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Missing file ID", { status: 400 });
  }
  if (!ID_RE.test(id)) {
    return new Response("Invalid file ID", { status: 400 });
  }

  // `usercontent.google.com/download...&confirm=t` bypasses Drive's
  // virus-scan interstitial that breaks plain `uc?export=download` for
  // larger files.
  const driveUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    id,
  )}&export=download&authuser=0&confirm=t`;

  const forward: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    Accept: "*/*",
  };
  const range = req.headers.get("range");
  if (range) forward.Range = range;

  let upstream: Response;
  try {
    upstream = await fetch(driveUrl, {
      redirect: "follow",
      headers: forward,
      // No cache — let Vercel's edge cache it via Cache-Control header below.
      cache: "no-store",
    });
  } catch {
    return new Response("Upstream fetch error", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`Drive returned ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    // Drive served the consent / 404 page → file isn't public.
    return new Response(
      "ملف غير عام — تأكد من مشاركته كـ Anyone with the link",
      { status: 403 },
    );
  }

  const headers = new Headers();
  // Pass through the bytes-related headers so the browser can seek.
  for (const h of ["content-type", "content-length", "content-range"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  // Force Accept-Ranges even if upstream didn't include it.
  headers.set("Accept-Ranges", "bytes");
  // Modest cache so seeking + re-mounts don't refetch immediately.
  headers.set("Cache-Control", "public, max-age=3600, immutable");

  return new Response(upstream.body, {
    status: upstream.status, // 200 or 206
    headers,
  });
}
