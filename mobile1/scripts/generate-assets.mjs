/**
 * توليد أصول الهوية برمجياً: نجمة ثمانية ذهبية على تدرج حبر.
 * هذه نسخة مؤقتة احترافية — التصميم النهائي المستقل يُنفَّذ لاحقاً (انظر README).
 * التشغيل: node scripts/generate-assets.mjs
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INK = "#072C49";
const INK2 = "#0A3A5E";
const GOLD = "#DEA470";
const WHITE = "#FFFFFF";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "assets", "images");

function gradientDef() {
  return `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${INK}"/><stop offset="1" stop-color="${INK2}"/>
  </linearGradient></defs>`;
}

/** نجمة ثمانية: مربعان متراكبان (أحدهما مائل ٤٥°) + نقطة مركزية اختيارية. */
function starShape(size, color, scale = 0.52, hole = null) {
  const c = size / 2;
  const side = size * scale;
  const offset = (size - side) / 2;
  const parts = [
    `<rect x="${offset}" y="${offset}" width="${side}" height="${side}" fill="${color}"/>`,
    `<rect x="${offset}" y="${offset}" width="${side}" height="${side}" fill="${color}" transform="rotate(45 ${c} ${c})"/>`,
  ];
  if (hole) {
    parts.push(`<circle cx="${c}" cy="${c}" r="${size * 0.055}" fill="${hole}"/>`);
  }
  return parts.join("");
}

function svg(size, body) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`,
  );
}

async function render(name, size, body) {
  const file = path.join(outDir, name);
  await sharp(svg(size, body)).png().toFile(file);
  console.log("✓", path.relative(root, file));
}

await mkdir(outDir, { recursive: true });

// أيقونة التطبيق (شكل مربع كامل — legacy launcher)
await render(
  "icon.png",
  1024,
  `${gradientDef()}<rect width="1024" height="1024" fill="url(#bg)"/>${starShape(1024, GOLD, 0.5, INK2)}`,
);

// الأيقونة التكيفية (النجمة داخل المنطقة الآمنة ٦٦٪)
await render(
  "adaptive-icon.png",
  432,
  `${gradientDef()}<rect width="432" height="432" fill="url(#bg)"/>${starShape(432, GOLD, 0.4, INK2)}`,
);

// الأيقونة أحادية اللون (Monochrome / Material You)
await render("adaptive-icon-mono.png", 432, starShape(432, WHITE, 0.4));

// شاشة الافتتاح — النجمة على شفاف (الخلفية من إعداد splash: حبر داكن)
await render("splash-icon.png", 512, starShape(512, GOLD, 0.46));

// أيقونة الإشعارات (بيضاء على شفاف)
await render("notification-icon.png", 96, starShape(96, WHITE, 0.55));

// العمل الفني الافتراضي للمشغل (شاشة القفل عند غياب مصغرة)
await render(
  "audio-artwork.png",
  512,
  `${gradientDef()}<rect width="512" height="512" fill="url(#bg)"/>${starShape(512, GOLD, 0.44, INK2)}`,
);
