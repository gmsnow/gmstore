const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "downloads", "cj-images");
const BASE_URL = process.argv[2] || "https://wanostore.vercel.app";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
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
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => { file.close(); reject(err); });
  });
}

function sanitize(s) {
  return String(s || "unknown").replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
}

async function main() {
  console.log(`Fetching products from ${BASE_URL}/api/cj/export-images ...`);
  console.log("Make sure you're logged in as admin first!");

  const res = await fetch(`${BASE_URL}/api/cj/export-images`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Error ${res.status}: ${text.slice(0, 200)}`);
    console.log("\nMake sure:");
    console.log("1. You're logged in at ${BASE_URL}/admin");
    console.log("2. The Vercel deploy finished");
    process.exit(1);
  }

  const products = await res.json();
  console.log(`Found ${products.length} CJ products`);

  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  function extractImgUrls(html) {
    if (!html) return [];
    const urls = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let m;
    while ((m = regex.exec(html)) !== null) urls.push(m[1]);
    return urls;
  }

  let downloaded = 0, failed = 0, skipped = 0;

  for (const product of products) {
    const folder = path.join(OUTPUT, `${sanitize(product.nameEn || product.name)}-${product.id.slice(0, 8)}`);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    // main images
    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      if (!url) continue;
      const ext = url.split(".").pop()?.split("?")[0] || "jpg";
      const dest = path.join(folder, `image-${i + 1}.${ext}`);

      if (fs.existsSync(dest)) { skipped++; continue; }

      try {
        await download(url, dest);
        console.log(`  IMG ${sanitize(product.nameEn || product.name)}/${i + 1}`);
        downloaded++;
      } catch (err) {
        console.log(`  FAIL ${sanitize(product.nameEn || product.name)}/${i + 1}: ${err.message}`);
        failed++;
      }
    }

    // description images
    const descHtml = [product.description, product.descriptionEn].filter(Boolean).join(" ");
    const descUrls = extractImgUrls(descHtml);
    if (descUrls.length > 0) {
      const descFolder = path.join(folder, "desc-images");
      if (!fs.existsSync(descFolder)) fs.mkdirSync(descFolder, { recursive: true });

      for (let i = 0; i < descUrls.length; i++) {
        const url = descUrls[i];
        const ext = url.split(".").pop()?.split("?")[0] || "jpg";
        const dest = path.join(descFolder, `desc-${i + 1}.${ext}`);

        if (fs.existsSync(dest)) { skipped++; continue; }

        try {
          await download(url, dest);
          console.log(`  DESC ${sanitize(product.nameEn || product.name)}/${i + 1}`);
          downloaded++;
        } catch (err) {
          console.log(`  FAIL DESC ${sanitize(product.nameEn || product.name)}/${i + 1}: ${err.message}`);
          failed++;
        }
      }
    }
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`Saved to: ${OUTPUT}`);
}

main().catch(console.error);
