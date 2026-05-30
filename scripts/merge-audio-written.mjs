// Merge AUDIO + WRITTEN duplicates of the same lecture into ONE item.
// The surviving item is the AUDIO one (keeps its player); it receives the
// WRITTEN item's article body (content) + description + topics, then the
// redundant WRITTEN item is deleted. The detail page already renders the
// player on top and the article text below for an AUDIO item that has content.
//
// Runs during the Vercel build ONLY when a mode is passed via argv/env:
//   node scripts/merge-audio-written.mjs report   → dry run, lists pairs, NO changes
//   node scripts/merge-audio-written.mjs apply     → performs the merge + delete
//
// Only CLEAN 1:1 pairs are merged automatically (exactly one AUDIO with a Drive
// file + exactly one WRITTEN with non-empty content sharing the same normalized
// title). Ambiguous groups are reported and left untouched. Never throws.

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

const hasText = (s) => !!s && s.trim().length > 0;

async function run() {
  const mode = process.argv[2] || process.env.RUN_MERGE_AW;
  if (mode !== "report" && mode !== "apply") {
    console.log("[merge-aw] skipped (pass 'report' or 'apply').");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const items = await prisma.item.findMany({
      include: { topics: true },
    });
    const groups = new Map();
    for (const it of items) {
      const k = loose(it.title);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(it);
    }

    const cleanPairs = [];
    const ambiguous = [];
    for (const [k, arr] of groups) {
      const audios = arr.filter((x) => x.category === "AUDIO" && (x.driveFileId || x.driveLink));
      const writtens = arr.filter((x) => x.category === "WRITTEN" && hasText(x.content));
      if (audios.length === 0 || writtens.length === 0) continue;
      if (audios.length === 1 && writtens.length === 1) {
        cleanPairs.push({ audio: audios[0], written: writtens[0] });
      } else {
        ambiguous.push({ key: k, title: arr[0].title, audios: audios.length, writtens: writtens.length });
      }
    }

    console.log(`[merge-aw] ${mode}: ${cleanPairs.length} clean pair(s), ${ambiguous.length} ambiguous group(s).`);
    cleanPairs.forEach((p, i) =>
      console.log(`  ${i + 1}. "${p.audio.title}"  (audio ${p.audio.id} ← written ${p.written.id})`),
    );
    if (ambiguous.length) {
      console.log("[merge-aw] AMBIGUOUS (left untouched — review manually):");
      ambiguous.forEach((a) => console.log(`   - "${a.title}"  audios=${a.audios} writtens=${a.writtens}`));
    }

    if (mode === "report") {
      console.log("[merge-aw] report only — no changes made.");
      return;
    }

    let merged = 0, topicLinks = 0, failed = 0;
    for (const { audio, written } of cleanPairs) {
      try {
        // Union the written item's topics onto the surviving audio item.
        const audioTopicIds = new Set(audio.topics.map((t) => t.topicId));
        for (const wt of written.topics) {
          if (!audioTopicIds.has(wt.topicId)) {
            await prisma.itemTopic.create({
              data: { itemId: audio.id, topicId: wt.topicId, episodeOrder: wt.episodeOrder },
            });
            topicLinks++;
          }
        }
        // Move the article body (+ description/views) onto the audio item.
        await prisma.item.update({
          where: { id: audio.id },
          data: {
            content: written.content,
            description: hasText(audio.description) ? audio.description : written.description,
            viewCount: audio.viewCount + (written.viewCount || 0),
          },
        });
        // Remove the now-redundant written item (its ItemTopic rows cascade).
        await prisma.item.delete({ where: { id: written.id } });
        merged++;
      } catch (err) {
        failed++;
        console.warn(`[merge-aw] failed "${audio.title}": ${err?.message || err}`);
      }
    }
    console.log(`[merge-aw] DONE — merged: ${merged}, extra topic links: ${topicLinks}, failed: ${failed}`);
  } catch (err) {
    console.error(`[merge-aw] fatal (ignored to not break build): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
