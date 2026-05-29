// Bulk-insert PDF items from a JSON manifest as WRITTEN items pointing to
// Google Drive (the detail page will render Drive's PDF preview iframe).
// Manifest format: [{ id: "<driveFileId>", title: "<file title>" }, ...]
//
// Honours the DeletedDriveItem tombstone table and never overwrites
// existing items (same protections as the audio/video importers).
//
//   DATABASE_URL=... DIRECT_URL=... node scripts/import-pdf.mjs <manifest.json>

import { promises as fs } from "node:fs";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanTitle(raw) {
  let t = (raw || "").replace(/[‎‏؜﻿]/g, "").trim();
  // Strip a possible double-extension like .docx.pdf or single .pdf
  t = t.replace(/\.(docx|doc)?\.?pdf$/i, "").trim();
  // Strip "copy" suffix (case-insensitive)
  t = t.replace(/\s+copy$/i, "").trim();
  // Strip trailing " (1)" / "(2)" / "- ..."
  t = t.replace(/\s*\(\d+\)\s*$/, "").trim();
  t = t.replace(/\s*-+\s*\.+\s*$/, "").trim();
  // Strip leading numeric prefix like "1- "
  t = t.replace(/^\s*\d+\s*[-_.]\s*/, "").trim();
  // Strip decorative leading dashes/dots/emoji frames
  t = t.replace(/^[-–—.·•📍]+\s*/, "").trim();
  // Collapse multiple spaces
  t = t.replace(/\s+/g, " ").trim();
  return t || (raw || "ملف PDF");
}

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("Usage: node scripts/import-pdf.mjs <manifest.json>");
    process.exit(1);
  }

  const raw = await fs.readFile(manifestPath, "utf8");
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    console.error("Manifest must be a JSON array of { id, title } objects.");
    process.exit(1);
  }
  console.log(`Manifest has ${items.length} entries`);

  const tombstones = await prisma.deletedDriveItem.findMany({
    select: { driveFileId: true },
  });
  const tombstoneSet = new Set(tombstones.map((t) => t.driveFileId));
  console.log(`Tombstones (deleted, will skip): ${tombstoneSet.size}`);

  // Dedupe by id within the manifest
  const seen = new Set();
  const queue = [];
  for (const it of items) {
    if (!it || typeof it.id !== "string") continue;
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    queue.push(it);
  }

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
    if (existing) { skipped++; continue; }

    try {
      await prisma.item.create({
        data: {
          title: cleaned,
          category: "WRITTEN",
          driveLink,
          driveFileId: it.id,
          publishedAt: new Date(),
        },
      });
      imported++;
      if (imported % 10 === 0) console.log(`  …${imported} imported so far`);
    } catch (e) {
      failed++;
      console.warn(`! ${cleaned} (${it.id}) — ${e?.message || e}`);
    }
  }

  console.log("");
  console.log(`Done. Imported: ${imported}. Skipped (already in DB): ${skipped}. Skipped (tombstoned): ${skippedTombstone}. Failed: ${failed}.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
