import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma>;
};

function createPrisma() {
  const url = process.env.DATABASE_URL || "";
  const usePooler = url.includes("verceldb") || url.includes("aws.com") || url.includes("pooler");
  const directUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_DATABASE_URL;
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: usePooler && directUrl ? { db: { url: directUrl } } : undefined,
  });

  if (process.env.NODE_ENV === "production") {
    client.$connect().catch(() => {});
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
