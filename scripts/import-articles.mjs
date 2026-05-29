// One-time importer: reads every .docx file in a folder, extracts the title
// from the filename and the body as HTML via mammoth, then upserts each one
// as a WRITTEN Item in the DB.
//
//   DATABASE_URL=... DIRECT_URL=... node scripts/import-articles.mjs "<folder>"

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import mammoth from "mammoth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanTitle(filename) {
  // Strip extension
  let t = filename.replace(/\.docx$/i, "");
  // Strip BOM
  t = t.replace(/^﻿/, "");
  // Strip the leading "<number>-" prefix (e.g. "12-..." or "(20)...")
  t = t.replace(/^[\s\d().[\]\-_]+/, "").trim();
  // Strip trailing " [1]" duplicate marker often added by Word/OS
  t = t.replace(/\s*\[\d+\]\s*$/, "").trim();
  return t || filename.replace(/\.docx$/i, "");
}

function leadingNumber(filename) {
  // Try to parse a leading integer for natural sorting (1, 2, 10, 100…).
  const m = filename.match(/^\s*\(?(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function postProcessHtml(html) {
  // Mammoth gives clean semantic HTML. A couple of tweaks for nicer display:
  // - Drop completely empty paragraphs/spans
  // - Trim whitespace
  return html
    .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/g, "")
    .replace(/<span[^>]*>\s*<\/span>/g, "")
    .trim();
}

function plainText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error('Usage: node scripts/import-articles.mjs "<folder>"');
    process.exit(1);
  }

  const entries = (await fs.readdir(folder, { withFileTypes: true }))
    .filter((e) => e.isFile() && /\.docx$/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => {
      const na = leadingNumber(a);
      const nb = leadingNumber(b);
      if (na !== nb) return na - nb;
      return a.localeCompare(b, "ar");
    });

  console.log(`Found ${entries.length} .docx files in ${folder}`);

  let imported = 0;
  let skippedExisting = 0;
  let failed = 0;

  for (const name of entries) {
    const full = path.join(folder, name);
    const title = cleanTitle(name);

    // Skip if an item with this exact title already exists.
    const existing = await prisma.item.findFirst({
      where: { category: "WRITTEN", title },
      select: { id: true },
    });
    if (existing) {
      skippedExisting++;
      continue;
    }

    try {
      const buf = await fs.readFile(full);
      const { value: rawHtml, messages } = await mammoth.convertToHtml({ buffer: buf });
      const html = postProcessHtml(rawHtml || "");
      if (!html) {
        console.warn(`! empty content: ${name}`);
        failed++;
        continue;
      }
      const snippet = plainText(html).slice(0, 220);

      await prisma.item.create({
        data: {
          title,
          description: snippet,
          content: html,
          category: "WRITTEN",
          publishedAt: new Date(),
        },
      });

      imported++;
      if (imported % 25 === 0) {
        console.log(`  …${imported} imported so far`);
      }
      if (messages?.length) {
        // mammoth usually reports things like unsupported style — non-fatal.
      }
    } catch (e) {
      failed++;
      console.warn(`! failed: ${name} — ${e?.message || e}`);
    }
  }

  console.log("");
  console.log(`Done. Imported: ${imported}. Skipped (already in DB): ${skippedExisting}. Failed: ${failed}.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
