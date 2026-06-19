import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@gmstore.com" } });
  if (existing) {
    console.log("Admin already exists:", existing.id, existing.email, existing.role);
    return;
  }

  const hash = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.create({
    data: { name: "Admin", email: "admin@gmstore.com", password: hash, role: "ADMIN" },
  });
  console.log("Admin created:", user.id, user.email, user.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
