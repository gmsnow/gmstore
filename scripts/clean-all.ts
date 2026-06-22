import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
async function main() {
  await p.cjProductMapping.deleteMany();
  await p.review.deleteMany();
  await p.orderItem.deleteMany();
  await p.cartItem.deleteMany();
  await p.favorite.deleteMany();
  await p.product.deleteMany();
  await p.cjLog.deleteMany();
  await p.category.deleteMany();
  console.log("All products, categories, CJ data deleted");
  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
