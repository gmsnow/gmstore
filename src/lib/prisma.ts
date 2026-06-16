import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma>;
};

const RETRY_DELAYS = [500, 1000];

function isConnectionError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message;
  return (
    msg.includes("Can't reach database server") ||
    msg.includes("Connection refused") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("connect ECONN") ||
    msg.includes("does not accept connections")
  );
}

function createPrisma() {
  const url = process.env.DATABASE_URL || "";
  const usePooler = url.includes("verceldb") || url.includes("aws.com") || url.includes("pooler");
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: usePooler ? undefined : {
      db: { url: process.env.DATABASE_URL_UNPOOLED || url },
    },
  });

  return client.$extends({
    query: {
      $allOperations({ args, query }) {
        async function run(attempt = 0): Promise<any> {
          try {
            return await query(args);
          } catch (e) {
            if (isConnectionError(e) && attempt < RETRY_DELAYS.length) {
              await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
              return run(attempt + 1);
            }
            throw e;
          }
        }
        return run();
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
