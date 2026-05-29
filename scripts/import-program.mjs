// One-time-ish, idempotent bulk import for a named PROGRAM topic.
// Runs during the Vercel build ONLY when RUN_PROGRAM_IMPORT matches a manifest
// key (so it doesn't touch the DB on every deploy). Safe to re-run: it skips
// items already present (by Drive file id OR by normalized title) and skips
// tombstoned (deleted) files. Never throws — logs a summary and exits 0 so a
// data hiccup can't break the build.
//
//   RUN_PROGRAM_IMPORT=tawjihat   → imports scripts/manifests/tawjihat.json
//
// Each manifest entry: { id, title, category: "AUDIO"|"WRITTEN", ep, mime }

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const CONFIG = {
  tawjihat: { manifest: "tawjihat.json", program: "توجيهات أسرية" },
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

const base2020 = Date.UTC(2020, 0, 1);
function pubDate(ep) {
  return new Date(base2020 + (Number(ep) || 0) * 7 * 86400000);
}

async function run() {
  const key = process.env.RUN_PROGRAM_IMPORT;
  if (!key || !CONFIG[key]) {
    console.log(`[import-program] skipped (RUN_PROGRAM_IMPORT not set to a known key).`);
    return;
  }
  const cfg = CONFIG[key];
  const prisma = new PrismaClient();
  try {
    const manifestPath = path.join(process.cwd(), "scripts", "manifests", cfg.manifest);
    const entries = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    console.log(`[import-program] ${key}: ${entries.length} manifest entries`);

    // Ensure the program topic exists.
    let topic = await prisma.topic.findFirst({ where: { name: cfg.program } });
    if (!topic) {
      const slug = cfg.program.replace(/\s+/g, "-");
      topic = await prisma.topic.create({
        data: { name: cfg.program, slug, type: "PROGRAM" },
      });
      console.log(`[import-program] created program topic "${cfg.program}"`);
    }

    const tombstones = new Set(
      (await prisma.deletedDriveItem.findMany({ select: { driveFileId: true } })).map(
        (t) => t.driveFileId,
      ),
    );
    const existing = await prisma.item.findMany({
      select: { id: true, title: true, category: true, driveFileId: true },
    });
    const byDriveId = new Map(existing.filter((e) => e.driveFileId).map((e) => [e.driveFileId, e]));
    const byKey = new Map(existing.map((e) => [`${e.category}|${loose(e.title)}`, e]));

    let created = 0, linkedExisting = 0, skippedTomb = 0, failed = 0;

    for (const e of entries) {
      try {
        if (!e.id || !e.title) continue;
        if (tombstones.has(e.id)) { skippedTomb++; continue; }

        const driveLink = `https://drive.google.com/file/d/${e.id}/view?usp=drivesdk`;
        const found = byDriveId.get(e.id) || byKey.get(`${e.category}|${loose(e.title)}`);

        if (found) {
          // Already on the site — just make sure it belongs to the program.
          await prisma.itemTopic.upsert({
            where: { itemId_topicId: { itemId: found.id, topicId: topic.id } },
            create: { itemId: found.id, topicId: topic.id, episodeOrder: e.ep ?? null },
            update: e.ep != null ? { episodeOrder: e.ep } : {},
          });
          linkedExisting++;
        } else {
          await prisma.item.create({
            data: {
              title: e.title,
              category: e.category,
              driveLink,
              driveFileId: e.id,
              publishedAt: pubDate(e.ep),
              topics: { create: { topicId: topic.id, episodeOrder: e.ep ?? null } },
            },
          });
          created++;
        }
      } catch (err) {
        failed++;
        console.warn(`[import-program] failed "${e.title}" (${e.id}): ${err?.message || err}`);
      }
    }

    console.log(
      `[import-program] DONE — created: ${created}, linked existing: ${linkedExisting}, ` +
        `skipped(tombstone): ${skippedTomb}, failed: ${failed}`,
    );
  } catch (err) {
    console.error(`[import-program] fatal (ignored to not break build): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
