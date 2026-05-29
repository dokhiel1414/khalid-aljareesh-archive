// Bulk-insert audio items from a JSON manifest into the Items table.
// Manifest format: [{ id: "<driveFileId>", title: "<file title>" }, ...]
//
//   DATABASE_URL=... DIRECT_URL=... node scripts/import-audio.mjs <manifest.json>

import { promises as fs } from "node:fs";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function cleanTitle(raw) {
  // Strip invisible RTL/LTR/Arabic-letter marks WITHOUT touching real spaces.
  // ‎ LRM, ‏ RLM, ؜ ALM, ﻿ BOM
  let t = (raw || "").replace(/[‎‏؜﻿]/g, "");
  t = t.trim();
  // Strip extension (.mp3 / .m4a / .wav / .ogg / .aac / .opus / .flac)
  t = t.replace(/\.(mp3|m4a|wav|ogg|aac|opus|flac)$/i, "").trim();
  // Drop a leading "<number>-" prefix used by some files (1- … 99-)
  t = t.replace(/^\s*\d+\s*[-_.]\s*/, "").trim();
  // Replace WhatsApp Audio YYYY-MM-DD at HH:MM:SS AM/PM with something tidier
  const wa = t.match(/^WhatsApp Audio (\d{4})-(\d{2})-(\d{2}) at ([\d.]+)/i);
  if (wa) {
    t = `تسجيل واتساب ${wa[3]}/${wa[2]}/${wa[1]}`;
  } else if (/^Untit?\d*led$/i.test(t)) {
    t = "تسجيل بدون عنوان";
  }
  // Collapse internal runs of whitespace
  t = t.replace(/\s+/g, " ").trim();
  return t || (raw || "مقطع صوتي");
}

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("Usage: node scripts/import-audio.mjs <manifest.json>");
    process.exit(1);
  }

  const raw = await fs.readFile(manifestPath, "utf8");
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    console.error("Manifest must be a JSON array of { id, title } objects.");
    process.exit(1);
  }
  console.log(`Manifest has ${items.length} entries`);

  // Dedupe by file id within the manifest
  const seen = new Set();
  const queue = [];
  for (const it of items) {
    if (!it || typeof it.id !== "string") continue;
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    queue.push(it);
  }

  // Load tombstones — any driveFileId here was intentionally deleted by the
  // admin via the dashboard. Never re-add those.
  const tombstones = await prisma.deletedDriveItem.findMany({
    select: { driveFileId: true },
  });
  const tombstoneSet = new Set(tombstones.map((t) => t.driveFileId));
  console.log(`Tombstones (deleted, will skip): ${tombstoneSet.size}`);

  let imported = 0;
  let skipped = 0;
  let skippedTombstone = 0;
  let failed = 0;

  for (const it of queue) {
    if (tombstoneSet.has(it.id)) { skippedTombstone++; continue; }

    const cleaned = cleanTitle(it.title);
    const driveLink = `https://drive.google.com/file/d/${it.id}/view?usp=drivesdk`;

    const existing = await prisma.item.findFirst({
      where: { driveFileId: it.id },
      select: { id: true },
    });
    if (existing) { skipped++; continue; }   // never overwrite

    try {
      await prisma.item.create({
        data: {
          title: cleaned,
          category: "AUDIO",
          driveLink,
          driveFileId: it.id,
          publishedAt: new Date(),
        },
      });
      imported++;
      if (imported % 25 === 0) console.log(`  …${imported} imported so far`);
    } catch (e) {
      failed++;
      console.warn(`! ${cleaned} (${it.id}) — ${e?.message || e}`);
    }
  }

  console.log("");
  console.log(`Done. Imported: ${imported}. Skipped (already in DB): ${skipped}. Skipped (tombstoned): ${skippedTombstone}. Failed: ${failed}.`);
  await prisma.$disconnect();
}

// Only run main when executed directly (so other scripts can import cleanTitle).
const isDirect = import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`
  || process.argv[1]?.endsWith("import-audio.mjs");
if (isDirect && process.argv[2]) {
  main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
