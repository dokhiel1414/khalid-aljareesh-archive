// Single source of truth for the site's public base URL.
//
// Priority:
//   1) NEXT_PUBLIC_SITE_URL (set this on Vercel to the custom domain when ready)
//   2) the current stable Vercel production URL (fallback for today)
//
// When the official domain is purchased, set NEXT_PUBLIC_SITE_URL on Vercel and
// every canonical/sitemap/OpenGraph URL updates automatically — no code change.

const FALLBACK = "https://khalid-aljareesh-archive.vercel.app";

function resolve(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env && !/localhost|127\.0\.0\.1/.test(env)) {
    return env.replace(/\/+$/, "");
  }
  return FALLBACK;
}

export const SITE_URL = resolve();

export const SITE_NAME = "أرشيف خالد بن علي الجريش";
export const SHEIKH_NAME = "خالد بن علي الجريش";

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
