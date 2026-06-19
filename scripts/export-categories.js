// Extract categories from seed-fast.ts and export as JSON
const fs = require("fs");

// Full categories array (copy from seed-fast.ts)
const categories = require("./seed-categories.ts");

// Write raw JSON
fs.writeFileSync("scripts/categories-raw.json", JSON.stringify(cats, null, 2));
console.log("Exported", cats.length, "categories to scripts/categories-raw.json");

// Analyze hierarchy
const roots = cats.filter(c => c.parent === null);
console.log("\nCurrent parent categories (" + roots.length + "):");
roots.forEach(r => {
  const children = cats.filter(c => c.parent === r.slug);
  console.log("  " + r.name + " (" + r.slug + ") \u2192 " + children.length + " subcategories");
});
