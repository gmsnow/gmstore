const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.category.findMany({ take: 10 }).then((r) => {
  r.forEach((c) => console.log(c.slug, c.name));
  p.$disconnect();
});
