// Link EXISTING items (matched by normalized title) to a PROGRAM topic.
// Unlike import-program.mjs, this never creates items — it only tags items
// that are already on the site. Runs during the Vercel build only when a
// known manifest key is passed via env RUN_LINK_PROGRAM or argv[2].
// Reports matched / unmatched titles in the build log.
//
//   node scripts/link-program.mjs imania
//
// Manifest entry: { order, title }

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const CONFIG = {
  imania: { manifest: "imania.json", program: "توجيهات إيمانية" },
};

function loose(s) {
  return (s || "")
    .replace(/[‎‏؜﻿ـ]/g, "")
    .replace(/^\s*\d+\s*[-_.]\s*/, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

async function run() {
  const key = process.env.RUN_LINK_PROGRAM || process.argv[2];
  if (!key || !CONFIG[key]) {
    console.log("[link-program] skipped (no program key via env or argv).");
    return;
  }
  const cfg = CONFIG[key];
  const prisma = new PrismaClient();
  try {
    const manifestPath = path.join(process.cwd(), "scripts", "manifests", cfg.manifest);
    const entries = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    console.log(`[link-program] ${key}: ${entries.length} titles`);

    let topic = await prisma.topic.findFirst({ where: { name: cfg.program } });
    if (!topic) {
      topic = await prisma.topic.create({
        data: { name: cfg.program, slug: cfg.program.replace(/\s+/g, "-"), type: "PROGRAM" },
      });
      console.log(`[link-program] created program topic "${cfg.program}"`);
    }

    const items = await prisma.item.findMany({ select: { id: true, title: true } });
    const byKey = new Map();
    for (const it of items) {
      const k = loose(it.title);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(it);
    }

    let linked = 0;
    const unmatched = [];
    for (const e of entries) {
      const matches = byKey.get(loose(e.title)) || [];
      if (matches.length === 0) { unmatched.push(`${e.order}: ${e.title}`); continue; }
      for (const m of matches) {
        await prisma.itemTopic.upsert({
          where: { itemId_topicId: { itemId: m.id, topicId: topic.id } },
          create: { itemId: m.id, topicId: topic.id, episodeOrder: e.order ?? null },
          update: e.order != null ? { episodeOrder: e.order } : {},
        });
        linked++;
      }
    }

    console.log(
      `[link-program] DONE — linked item-rows: ${linked}, ` +
        `matched titles: ${entries.length - unmatched.length}/${entries.length}`,
    );
    if (unmatched.length) {
      console.log("[link-program] UNMATCHED (not found on site):");
      for (const u of unmatched) console.log("   - " + u);
    }
  } catch (err) {
    console.error(`[link-program] fatal (ignored): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
