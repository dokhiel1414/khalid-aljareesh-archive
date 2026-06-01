// Generic, idempotent bulk importer (runs during the Vercel build ONLY when a
// manifest path is passed via argv or RUN_BATCH_IMPORT env). Safe to re-run:
// skips items already present (by Drive file id OR normalized title) and skips
// tombstoned (deleted) files. Creates THEME/PROGRAM topics on demand and links
// items to them. Never throws — logs a summary and exits 0.
//
//   node scripts/import-batch.mjs scripts/manifests/batch-new.json
//   RUN_BATCH_IMPORT=scripts/manifests/batch-new.json node scripts/import-batch.mjs
//
// Manifest entry: { id, title, category: "AUDIO"|"VIDEO"|"WRITTEN",
//                   topic?: string, topicType?: "THEME"|"PROGRAM", ep?: number }

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

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

function slugify(name) {
  return (name || "")
    .replace(/[‎‏؜﻿]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\/\\#?]/g, "-");
}

async function run() {
  const manifestArg = process.argv[2] || process.env.RUN_BATCH_IMPORT;
  if (!manifestArg) {
    console.log("[import-batch] skipped (no manifest via argv or RUN_BATCH_IMPORT).");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const manifestPath = path.isAbsolute(manifestArg)
      ? manifestArg
      : path.join(process.cwd(), manifestArg);
    const entries = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    console.log(`[import-batch] ${manifestArg}: ${entries.length} manifest entries`);

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

    // Topic cache (by name) — find or create on demand.
    const topicCache = new Map();
    async function getTopic(name, type) {
      if (topicCache.has(name)) return topicCache.get(name);
      let t = await prisma.topic.findFirst({ where: { name } });
      if (!t) {
        let slug = slugify(name);
        // guarantee unique slug
        if (await prisma.topic.findUnique({ where: { slug } })) slug = `${slug}-${Date.now()}`;
        t = await prisma.topic.create({
          data: { name, slug, type: type === "PROGRAM" ? "PROGRAM" : "THEME" },
        });
        console.log(`[import-batch] created topic "${name}" (${t.type})`);
      }
      topicCache.set(name, t);
      return t;
    }

    const base = Date.UTC(2026, 4, 30); // 2026-05-30
    let created = 0, linkedExisting = 0, linkedTopic = 0, skippedTomb = 0, failed = 0;

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      try {
        if (!e.title || !e.category) continue;
        const isYt = !!e.youtube;
        const driveId = isYt ? null : e.id;
        if (!isYt && !driveId) continue;
        if (driveId && tombstones.has(driveId)) { skippedTomb++; continue; }

        const topic = e.topic ? await getTopic(e.topic, e.topicType) : null;
        const driveLink = isYt
          ? `https://www.youtube.com/watch?v=${e.youtube}`
          : `https://drive.google.com/file/d/${driveId}/view?usp=drivesdk`;
        const found =
          (driveId ? byDriveId.get(driveId) : null) || byKey.get(`${e.category}|${loose(e.title)}`);

        if (found) {
          if (topic) {
            await prisma.itemTopic.upsert({
              where: { itemId_topicId: { itemId: found.id, topicId: topic.id } },
              create: { itemId: found.id, topicId: topic.id, episodeOrder: e.ep ?? null },
              update: e.ep != null ? { episodeOrder: e.ep } : {},
            });
            linkedTopic++;
          }
          linkedExisting++;
        } else {
          const data = {
            title: e.title,
            category: e.category,
            driveLink,
            driveFileId: driveId,
            ...(isYt ? { thumbnail: `https://i.ytimg.com/vi/${e.youtube}/hqdefault.jpg` } : {}),
            publishedAt: new Date(base - i * 3600000),
          };
          if (topic) {
            data.topics = { create: { topicId: topic.id, episodeOrder: e.ep ?? null } };
          }
          const item = await prisma.item.create({ data });
          // keep maps fresh so duplicates within the same manifest are caught
          if (driveId) byDriveId.set(driveId, item);
          byKey.set(`${e.category}|${loose(e.title)}`, item);
          created++;
        }
      } catch (err) {
        failed++;
        console.warn(`[import-batch] failed "${e.title}" (${e.id}): ${err?.message || err}`);
      }
    }

    console.log(
      `[import-batch] DONE — created: ${created}, linked existing: ${linkedExisting}, ` +
        `topic links: ${linkedTopic}, skipped(tombstone): ${skippedTomb}, failed: ${failed}`,
    );
  } catch (err) {
    console.error(`[import-batch] fatal (ignored to not break build): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
