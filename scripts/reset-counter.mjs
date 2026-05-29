import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const before = await p.siteStats.findUnique({ where: { id: 1 } });
await p.siteStats.upsert({
  where: { id: 1 },
  update: { visits: 0 },
  create: { id: 1, visits: 0 },
});
const after = await p.siteStats.findUnique({ where: { id: 1 } });
console.log(`Reset visits: ${before?.visits ?? "n/a"} → ${after.visits}`);
await p.$disconnect();
