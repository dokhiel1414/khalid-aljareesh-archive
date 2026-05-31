// One-off deletion: removes items by Drive file id and tombstones them so the
// bulk importers won't re-add them. Runs during the Vercel build ONLY when ids
// are passed via argv or RUN_DELETE_ITEMS. Never throws.
//
//   node scripts/delete-items.mjs 1KD7EjcVJ778OMuwpPFtS_13WltrcSMnR
//
// Comma-separate multiple ids.

import process from "node:process";
import { PrismaClient } from "@prisma/client";

async function run() {
  const arg = process.argv[2] || process.env.RUN_DELETE_ITEMS;
  if (!arg) {
    console.log("[delete-items] skipped (no ids via argv or RUN_DELETE_ITEMS).");
    return;
  }
  const ids = arg.split(",").map((s) => s.trim()).filter(Boolean);
  const prisma = new PrismaClient();
  try {
    let deleted = 0;
    let tombstoned = 0;
    for (const id of ids) {
      const items = await prisma.item.findMany({ where: { driveFileId: id } });
      for (const it of items) {
        await prisma.item.delete({ where: { id: it.id } });
        deleted++;
        console.log(`[delete-items] deleted "${it.title}" (${it.id})`);
      }
      const last = items[0];
      await prisma.deletedDriveItem.upsert({
        where: { driveFileId: id },
        update: {},
        create: { driveFileId: id, title: last?.title ?? null, category: last?.category ?? null },
      });
      tombstoned++;
    }
    console.log(`[delete-items] DONE — deleted: ${deleted}, tombstoned: ${tombstoned}`);
  } catch (err) {
    console.error(`[delete-items] fatal (ignored): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
