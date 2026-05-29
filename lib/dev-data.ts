import { promises as fs } from "node:fs";
import path from "node:path";

export interface DevItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: "AUDIO" | "VIDEO" | "WRITTEN";
  driveLink: string | null;
  driveFileId: string | null;
  thumbnail: string | null;
  publishedAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

let cached: DevItem[] | null = null;

export async function loadDevItems(): Promise<DevItem[]> {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "all-items.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);
  cached = (json.items || json || []) as DevItem[];
  return cached!;
}

export function filterAndSort(
  items: DevItem[],
  category?: string | null,
  limit: number = 50,
): DevItem[] {
  let result = items;
  const validCategories = new Set(["AUDIO", "VIDEO", "WRITTEN"]);
  if (category && validCategories.has(category)) {
    result = result.filter((i) => i.category === category);
  }
  result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return result.slice(0, limit);
}

export function searchItems(
  items: DevItem[],
  query: string,
  category?: string | null,
): DevItem[] {
  const q = query.toLowerCase();
  const validCategories = new Set(["AUDIO", "VIDEO", "WRITTEN"]);
  let result = items.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q)),
  );
  if (category && validCategories.has(category)) {
    result = result.filter((i) => i.category === category);
  }
  result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return result;
}
