import { PrismaClient } from "@prisma/client";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import https from "https";
import http from "http";

const prisma = new PrismaClient();
const OUTPUT = join(__dirname, "..", "downloads", "cj-images");

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        const redirectUrl = res.headers.location;
        if (redirectUrl) return download(redirectUrl, dest).then(resolve, reject);
        return reject(new Error("Redirect without location"));
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => { file.close(); reject(err); });
  });
}

function sanitize(s: string) {
  return s.replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
}

async function main() {
  const mappings = await prisma.cjProductMapping.findMany({ select: { productId: true } });
  const ids = mappings.map((m) => m.productId);
  if (ids.length === 0) {
    console.log("No CJ product mappings found. Import products from CJ first.");
    await prisma.$disconnect();
    return;
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, nameEn: true, images: true },
  });

  console.log(`Found ${products.length} CJ products with ${products.reduce((s, p) => s + p.images.length, 0)} images`);

  if (!existsSync(OUTPUT)) mkdirSync(OUTPUT, { recursive: true });

  let downloaded = 0;
  let failed = 0;

  for (const product of products) {
    const folder = join(OUTPUT, `${sanitize(product.nameEn || product.name)}-${product.id.slice(0, 8)}`);
    if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      const ext = url.split(".").pop()?.split("?")[0] || "jpg";
      const dest = join(folder, `image-${i + 1}.${ext}`);

      if (existsSync(dest)) {
        console.log(`  SKIP ${product.nameEn || product.name}/${i + 1} (exists)`);
        continue;
      }

      try {
        await download(url, dest);
        console.log(`  OK ${product.nameEn || product.name}/${i + 1}`);
        downloaded++;
      } catch (err) {
        console.log(`  FAIL ${product.nameEn || product.name}/${i + 1}: ${err}`);
        failed++;
      }
    }
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}, Total: ${products.length} products`);
  console.log(`Saved to: ${OUTPUT}`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
