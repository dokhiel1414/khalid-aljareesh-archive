// Bulk-insert video items from a JSON manifest into the Items table.
// Manifest format: [{ id: "<driveFileId>", title: "<file title>" }, ...]
// Dedupes both by driveFileId AND by title (case/whitespace-insensitive)
// within the VIDEO category.
//
//   DATABASE_URL=... DIRECT_URL=... node scripts/import-video.mjs <manifest.json>

import { promises as fs } from "node:fs";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function cleanTitle(raw) {
  // Strip invisible RTL/LTR/Arabic-letter/BOM marks — but NOT real spaces.
  let t = (raw || "").replace(/[‎‏؜﻿]/g, "").trim();
  t = t.replace(/\.(mp4|mov|m4v|webm|mkv|avi)$/i, "").trim();
  // Strip "(144P)", "(720P)" etc
  t = t.replace(/\s*\(\d{2,4}P\)\s*$/i, "").trim();
  // Strip a leading numeric prefix "1-"
  t = t.replace(/^\s*\d+\s*[-_.]\s*/, "").trim();
  if (/^فيديو\s*من(\s*abo\.saleh)?$/i.test(t)) t = "مقطع مرئي";
  // Collapse multiple spaces
  t = t.replace(/\s+/g, " ").trim();
  return t || (raw || "مقطع مرئي");
}

function normKey(t) {
  return t.replace(/\s+/g, " ").trim().toLocaleLowerCase("ar");
}

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("Usage: node scripts/import-video.mjs <manifest.json>");
    process.exit(1);
  }

  const raw = await fs.readFile(manifestPath, "utf8");
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    console.error("Manifest must be a JSON array of { id, title } objects.");
    process.exit(1);
  }
  console.log(`Manifest has ${items.length} entries`);

  const existingVideos = await prisma.item.findMany({
    where: { category: "VIDEO" },
    select: { title: true, driveFileId: true },
  });
  const titleSet = new Set(existingVideos.map((v) => normKey(v.title)));
  const idSet = new Set(
    existingVideos.map((v) => v.driveFileId).filter(Boolean),
  );
  console.log(`DB already has ${existingVideos.length} video items.`);

  // Tombstones — anything the admin deleted via the dashboard. Never re-add.
  const tombstones = await prisma.deletedDriveItem.findMany({
    select: { driveFileId: true },
  });
  const tombstoneSet = new Set(tombstones.map((t) => t.driveFileId));
  console.log(`Tombstones (deleted, will skip): ${tombstoneSet.size}`);

  const seenIds = new Set();
  const seenTitles = new Set();
  const queue = [];
  for (const it of items) {
    if (!it || typeof it.id !== "string") continue;
    if (seenIds.has(it.id)) continue;
    seenIds.add(it.id);

    const cleaned = cleanTitle(it.title);
    const key = normKey(cleaned);
    if (seenTitles.has(key)) {
      console.log(`  ↻ manifest dup (same title): ${cleaned}`);
      continue;
    }
    seenTitles.add(key);

    queue.push({ id: it.id, cleanedTitle: cleaned, titleKey: key });
  }
  console.log(`Manifest after dedupe: ${queue.length}`);

  let imported = 0;
  let skipped = 0;
  let skippedTombstone = 0;
  let failed = 0;

  for (const it of queue) {
    if (tombstoneSet.has(it.id)) { skippedTombstone++; continue; }
    if (idSet.has(it.id) || titleSet.has(it.titleKey)) {
      skipped++;
      continue;
    }
    const driveLink = `https://drive.google.com/file/d/${it.id}/view?usp=drivesdk`;
    try {
      await prisma.item.create({
        data: {
          title: it.cleanedTitle,
          category: "VIDEO",
          driveLink,
          driveFileId: it.id,
          publishedAt: new Date(),
        },
      });
      idSet.add(it.id);
      titleSet.add(it.titleKey);
      imported++;
      if (imported % 10 === 0) console.log(`  …${imported} imported so far`);
    } catch (e) {
      failed++;
      console.warn(`! ${it.cleanedTitle} (${it.id}) — ${e?.message || e}`);
    }
  }

  console.log("");
  console.log(`Done. Imported: ${imported}. Skipped (already in DB): ${skipped}. Skipped (tombstoned): ${skippedTombstone}. Failed: ${failed}.`);
  await prisma.$disconnect();
}

const isDirect = process.argv[1]?.endsWith("import-video.mjs");
if (isDirect && process.argv[2]) {
  main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
