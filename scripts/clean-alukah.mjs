// One-off content cleanup: removes alukah.net links from article bodies.
//  - Unwraps any <a href="...alukah...">TEXT</a> keeping its visible text
//    (so footnote markers like [1] and the takhreej text survive).
//  - Removes the trailing "رابط الموضوع: <url>" paragraph entirely.
//
// Runs during the Vercel build ONLY when invoked with "run" (argv/RUN_CLEAN_ALUKAH).
//   node scripts/clean-alukah.mjs run

import process from "node:process";
import { PrismaClient } from "@prisma/client";

function clean(html) {
  if (!html) return html;
  let s = html;
  // Unwrap alukah anchors → keep inner text (e.g. "[1]").
  s = s.replace(/<a\b[^>]*alukah[^>]*>([\s\S]*?)<\/a>/gi, "$1");
  // Drop any <p> that still mentions alukah.net as text (the source-link line).
  s = s.replace(/<p[^>]*>(?:(?!<\/p>)[\s\S])*alukah\.net(?:(?!<\/p>)[\s\S])*<\/p>/gi, "");
  return s.trim();
}

async function run() {
  const mode = process.argv[2] || process.env.RUN_CLEAN_ALUKAH;
  if (mode !== "run") {
    console.log("[clean-alukah] skipped (pass 'run').");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const items = await prisma.item.findMany({
      where: { content: { contains: "alukah" } },
      select: { id: true, title: true, content: true },
    });
    console.log(`[clean-alukah] matched ${items.length} item(s) with an alukah link`);
    let changed = 0;
    for (const it of items) {
      const cleaned = clean(it.content);
      if (cleaned !== it.content) {
        await prisma.item.update({ where: { id: it.id }, data: { content: cleaned } });
        changed++;
      }
    }
    console.log(`[clean-alukah] DONE — updated ${changed}`);
  } catch (err) {
    console.error(`[clean-alukah] fatal (ignored): ${err?.message || err}`);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(0));
