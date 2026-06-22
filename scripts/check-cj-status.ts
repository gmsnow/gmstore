import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const log = await prisma.cjLog.findFirst({ orderBy: { createdAt: "desc" } });
  console.log(JSON.stringify(log, null, 2));
  const count = await prisma.category.count();
  console.log(`Total categories in DB: ${count}`);
  await prisma.$disconnect();
}
main().catch(console.error);
