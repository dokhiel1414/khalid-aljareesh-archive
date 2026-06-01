// Merge the written (docx→HTML) transcripts of "خاتم النبيين" into their
// matching AUDIO episodes (so each episode page shows player + transcript),
// exactly like the other merged programs. For an episode that has no audio
// counterpart, a standalone WRITTEN item is created in the program instead.
//
// Runs during the Vercel build ONLY when invoked with "run".
//   node scripts/merge-khatm-written.mjs run
//
// Reads scripts/manifests/khatm-written.json: [{ ep, content }]

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n) => String(n).replace(/\d/g, (d) => AR[+d]);
const PROGRAM = "خاتم النبيين";

async function run() {
  const mode = process.argv[2] || process.env.RUN_KHATM_WRITTEN;
  if (mode !== "run") {
    console.log("[khatm-written] skipped (pass 'run').");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const entries = JSON.parse(
      await fs.readFile(path.join(process.cwd(), "scripts/manifests/khatm-written.json"), "utf8"),
    );
    const topic = await prisma.topic.findFirst({ where: { name: PROGRAM } });
    if (!topic) {
      console.log("[khatm-written] program topic not found — aborting.");
      return;
    }
    // Map episodeOrder -> audio item.
    const links = await prisma.itemTopic.findMany({
      where: { topicId: topic.id },
      include: { item: { select: { id: true, category: true } } },
    });
    const audioByEp = new Map();
    for (const l of links) {
      if (l.item.category === "AUDIO" && l.episodeOrder != null) audioByEp.set(l.episodeOrder, l.item.id);
    }

    let merged = 0, created = 0, failed = 0;
    const base = Date.UTC(2026, 4, 30);
    for (const e of entries) {
      try {
        if (!e.content) continue;
        const audioId = audioByEp.get(e.ep);
        if (audioId) {
          await prisma.item.update({ where: { id: audioId }, data: { content: e.content } });
          merged++;
        } else {
          // No audio for this episode → standalone written item in the program.
          const item = await prisma.item.create({
            data: {
              title: `${PROGRAM} الحلقة ${ar(e.ep)}`,
              category: "WRITTEN",
              content: e.content,
              publishedAt: new Date(base - e.ep * 3600000),
              topics: { create: { topicId: topic.id, episodeOrder: e.ep } },
            },
          });
          created++;
          console.log(`[khatm-written] created written episode ${e.ep} (${item.id})`);
        }
      } catch (err) {
        failed++;
        console.warn(`[khatm-written] failed ep ${e.ep}: ${err?.message || err}`);
      }
    }
    console.log(`[khatm-written] DONE — merged into audio: ${merged}, created written: ${created}, failed: ${failed}`);
  } catch (err) {
    console.error(`[khatm-written] fatal (ignored): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
