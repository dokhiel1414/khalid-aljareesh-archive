import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const n = await p.deletedDriveItem.count();
  console.log("DeletedDriveItem table exists. rows:", n);
} catch (e) {
  console.log("Table not found or query failed:", e?.message);
}
await p.$disconnect();
