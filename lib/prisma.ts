import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const _prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const DEV_DATA_ENABLED = !process.env.DATABASE_URL;

interface DevItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  driveLink: string | null;
  driveFileId: string | null;
  thumbnail: string | null;
  publishedAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

let _devItemsCache: DevItem[] | null = null;

async function getDevItems(): Promise<DevItem[]> {
  if (_devItemsCache) return _devItemsCache;
  try {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "data", "all-items.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw) as { items?: DevItem[] } | DevItem[];
    _devItemsCache = Array.isArray(json) ? json : (json.items ?? []);
  } catch {
    _devItemsCache = [];
  }
  return _devItemsCache;
}

function wrapDevItem(item: DevItem): Record<string, unknown> {
  return {
    ...item,
    publishedAt: new Date(item.publishedAt),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

const _origItem = _prisma.item;

const _itemProxy = new Proxy(_origItem, {
  get(target, prop) {
    if (!DEV_DATA_ENABLED || typeof prop !== "string") {
      return Reflect.get(target, prop);
    }

    if (prop === "findMany") {
      return async (args?: {
        where?: Record<string, unknown>;
        orderBy?: Record<string, string>;
        take?: number;
        skip?: number;
      }) => {
        let dbResult: unknown[] = [];
        try {
          dbResult = (await target.findMany(args)) as unknown[];
        } catch {
          // DB unavailable
        }
        if (dbResult.length > 0) return dbResult;

        const devItems = await getDevItems();
        let result = devItems.map((i) => wrapDevItem(i));

        const where = args?.where ?? {};
        if (where.category) {
          const cat = where.category as string;
          result = result.filter((i) => i.category === cat);
        }
        if (where.title && typeof where.title === "object") {
          const titleWhere = where.title as Record<string, string>;
          if (titleWhere.contains) {
            const q = titleWhere.contains.toLowerCase();
            result = result.filter((i) =>
              (i.title as string).toLowerCase().includes(q),
            );
          }
        }
        if (where.OR) {
          const orConditions = where.OR as Record<string, Record<string, string>>[];
          result = result.filter((i) =>
            orConditions.some((cond) => {
              for (const [field, op] of Object.entries(cond)) {
                if (op.contains) {
                  const val = i[field] as string | null;
                  if (val && val.toLowerCase().includes(op.contains.toLowerCase())) return true;
                }
              }
              return false;
            }),
          );
        }
        if (where.publishedAt) {
          const pubWhere = where.publishedAt as Record<string, Date>;
          if (pubWhere.gte) {
            const gte = pubWhere.gte.getTime();
            result = result.filter((i) => (i.publishedAt as Date).getTime() >= gte);
          }
          if (pubWhere.lte) {
            const lte = pubWhere.lte.getTime();
            result = result.filter((i) => (i.publishedAt as Date).getTime() <= lte);
          }
        }

        if (args?.orderBy?.publishedAt) {
          const dir = args.orderBy.publishedAt === "asc" ? 1 : -1;
          result.sort(
            (a, b) =>
              dir * ((a.publishedAt as Date).getTime() - (b.publishedAt as Date).getTime()),
          );
        } else {
          result.sort(
            (a, b) =>
              (b.publishedAt as Date).getTime() - (a.publishedAt as Date).getTime(),
          );
        }

        const skip = args?.skip ?? 0;
        const take = args?.take ?? 200;
        return result.slice(skip, skip + take);
      };
    }

    if (prop === "findUnique" || prop === "findFirst") {
      return async (args: { where: Record<string, unknown> }) => {
        try {
          const fn = (target as unknown as Record<string, (a: unknown) => Promise<unknown>>)[prop];
          const dbResult = await fn(args);
          if (dbResult) return dbResult;
        } catch {
          // DB unavailable
        }

        const devItems = await getDevItems();
        const id = args.where.id as string;
        const match = devItems.find((i) => i.id === id);
        return match ? wrapDevItem(match) : null;
      };
    }

    if (prop === "count") {
      return async (args?: { where?: Record<string, unknown> }) => {
        let dbResult = -1;
        try {
          dbResult = await target.count(args);
        } catch {
          // DB unavailable
        }
        if (dbResult >= 0) return dbResult;

        const devItems = await getDevItems();
        const where = args?.where ?? {};
        if (where.category) {
          return devItems.filter((i) => i.category === where.category).length;
        }
        return devItems.length;
      };
    }

    return Reflect.get(target, prop);
  },
});

Object.defineProperty(_prisma, "item", {
  get() {
    return DEV_DATA_ENABLED ? _itemProxy : _origItem;
  },
  enumerable: true,
  configurable: true,
});

export const prisma = _prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
