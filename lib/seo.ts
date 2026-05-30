// JSON-LD structured-data builders (schema.org) for rich search results.
import { SITE_URL, SITE_NAME, SHEIKH_NAME, absoluteUrl } from "./site";

type Cat = "AUDIO" | "VIDEO" | "WRITTEN";

const author = {
  "@type": "Person",
  name: SHEIKH_NAME,
  url: SITE_URL,
};

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

/** WebSite node with a sitelinks search box. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** The archive as an Organization, with the Sheikh as its subject. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "أرشيف رقمي يجمع الصوتيات والمرئيات والمقالات للشيخ خالد بن علي الجريش.",
    founder: { "@type": "Person", name: SHEIKH_NAME },
  };
}

type ItemLike = {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  category: Cat;
  publishedAt: Date | string;
  thumbnail?: string | null;
  driveFileId?: string | null;
};

/** Per-item media/article node (AudioObject / VideoObject / Article). */
export function itemJsonLd(item: ItemLike, mediaUrl?: string | null) {
  const url = absoluteUrl(`/item/${item.id}`);
  const datePublished = new Date(item.publishedAt).toISOString();
  const desc =
    item.description ||
    `${item.title} — ${SHEIKH_NAME}`;
  const base = {
    "@context": "https://schema.org",
    name: item.title,
    headline: item.title,
    description: desc,
    inLanguage: "ar",
    datePublished,
    url,
    mainEntityOfPage: url,
    author,
    publisher,
    ...(item.thumbnail ? { thumbnailUrl: item.thumbnail, image: item.thumbnail } : {}),
  };

  if (item.category === "AUDIO") {
    return { ...base, "@type": "AudioObject", uploadDate: datePublished, ...(mediaUrl ? { contentUrl: mediaUrl } : {}) };
  }
  if (item.category === "VIDEO") {
    return { ...base, "@type": "VideoObject", uploadDate: datePublished, ...(mediaUrl ? { contentUrl: mediaUrl } : {}) };
  }
  return { ...base, "@type": "Article" };
}

/** Breadcrumb trail: Home › Section › Item. */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Render helper: a ready <script> string-safe JSON-LD payload. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
