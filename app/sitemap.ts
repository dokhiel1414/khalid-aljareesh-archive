import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/audio`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/video`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/written`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/topics`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  let items: { id: string; updatedAt: Date }[] = [];
  let topics: { slug: string; updatedAt: Date }[] = [];
  try {
    items = await prisma.item.findMany({ select: { id: true, updatedAt: true } });
    topics = await prisma.topic.findMany({ select: { slug: true, updatedAt: true } });
  } catch {
    /* DB unavailable (e.g., local dev) — ship static routes only */
  }

  const itemRoutes: MetadataRoute.Sitemap = items.map((it) => ({
    url: `${SITE_URL}/item/${it.id}`,
    lastModified: it.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const topicRoutes: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${SITE_URL}/topic/${encodeURIComponent(t.slug)}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...topicRoutes, ...itemRoutes];
}
