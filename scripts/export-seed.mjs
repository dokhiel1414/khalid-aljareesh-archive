// Export a snapshot of the archive into the mobile app's seed file.
//
// There is no local DATABASE_URL, so this pulls from the LIVE site instead:
//   - /api/items        → all items (paginated)
//   - /api/topics       → topics list (with item counts)
//   - /topic/<slug>     → server-rendered topic pages, parsed for item links
//                         (the public API exposes no topic→item mapping yet)
//
// Writes: mobile/seed/seed.json  (created if missing)
//
// Usage:  node scripts/export-seed.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SEED_BASE_URL || "https://k-algrysh.com";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "mobile", "seed", "seed.json");

async function getJson(path) {
  const r = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`${path} → HTTP ${r.status}`);
  return r.json();
}

/** Distinct item ids, in page order (episode order for programs). */
function parseItemIds(html) {
  const seen = new Set();
  const ids = [];
  for (const m of html.matchAll(/href="\/item\/([a-z0-9]+)"/g)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      ids.push(m[1]);
    }
  }
  return ids;
}

async function main() {
  // 1) All items — /api/items caps at limit=200 per call; loop by category.
  const items = [];
  for (const category of ["AUDIO", "VIDEO", "WRITTEN"]) {
    const res = await getJson(`/api/items?category=${category}&limit=200`);
    items.push(...(res.items ?? []));
  }
  const byId = new Map(items.map((i) => [i.id, i]));

  // 2) Topics.
  const { topics } = await getJson("/api/topics");

  // 3) Topic→item assignments by scraping each topic page.
  const assignments = [];
  for (const t of topics) {
    const url = `${BASE}/topic/${encodeURIComponent(t.slug)}`;
    const html = await fetch(url).then((r) => (r.ok ? r.text() : ""));
    const ids = parseItemIds(html);
    ids.forEach((itemId, i) => {
      if (!byId.has(itemId)) return; // item not in the public list — skip
      assignments.push({
        itemId,
        topicId: t.id,
        episodeOrder: t.type === "PROGRAM" ? i + 1 : null,
      });
    });
    console.log(`  topic «${t.name}»: ${ids.length} items (page shows ${t._count.items})`);
  }

  // Strip heavy article HTML bodies — inline articles refresh from the live
  // API when online; Drive PDFs work fully offline without `content`.
  const leanItems = items.map(({ content: _content, ...rest }) => rest);

  const seed = {
    exportedAt: new Date().toISOString(),
    items: leanItems,
    topics,
    assignments,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(seed));
  console.log(
    `\n✅ Seed written: ${OUT}\n   ${items.length} items, ${topics.length} topics, ${assignments.length} assignments`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
