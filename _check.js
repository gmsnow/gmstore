const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const r = await p.$queryRawUnsafe(
      "SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_name='Product' ORDER BY ordinal_position"
    );
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
