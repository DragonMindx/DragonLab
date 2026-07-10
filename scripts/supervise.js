import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sync } from "./sync-vault.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "sync-config.json"), "utf-8"));
const { vaultPath, mapping } = config;
const STATUS_FILE = path.join(ROOT, "public", "sync-status.json");

const mappedDirs = new Set(Object.keys(mapping));
let timer;

function writeStatus(result) {
  const data = {
    ts: Date.now(),
    time: new Date().toLocaleTimeString(),
    copied: result.copied.length,
    skipped: result.skipped.length,
    deleted: result.deleted.length,
  };
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data));
}

function logResult(result, filename) {
  const summary = [];
  if (result.copied.length) summary.push(`Copied ${result.copied.length}`);
  if (result.skipped.length) summary.push(`Skipped ${result.skipped.length}`);
  if (result.deleted.length) summary.push(`Deleted ${result.deleted.length}`);
  if (summary.length === 0) summary.push("No changes");
  const tag = filename || "init";
  console.log(`[${new Date().toLocaleTimeString()}] ${tag} \u2192 ${summary.join(", ")}`);
  if (result.copied.length) result.copied.forEach(c => console.log(`  \u2713 ${c}`));
  if (result.skipped.length) result.skipped.forEach(s => console.log(`  \u2298 ${s}`));
}

const border = "=".repeat(48);
console.log(border);
console.log("  DragonLab Supervisor");
console.log(border);
console.log(`  vault : ${vaultPath}`);
console.log(`  target: src/content/`);
console.log(border);

if (!fs.existsSync(vaultPath)) {
  console.log("\n  FAIL: vault path does not exist!");
  console.log(`  Check sync-config.json \u2192 vaultPath\n`);
  process.exit(1);
}

let missing = [];
for (const dir of mappedDirs) {
  if (!fs.existsSync(path.join(vaultPath, dir))) missing.push(dir);
}
if (missing.length) {
  console.log(`\n  Warning: ${missing.length} mapped dir(s) not found in vault:`);
  missing.forEach(d => console.log(`    - ${d}`));
}
console.log("");

const init = sync();
logResult(init, null);
writeStatus(init);
console.log("\n  Watching for changes... (Ctrl+C to stop)\n");

fs.watch(vaultPath, { recursive: true }, (eventType, filename) => {
  if (!filename || !filename.endsWith(".md")) return;

  const dir = filename.split(path.sep)[0];
  if (!mappedDirs.has(dir)) return;

  clearTimeout(timer);
  timer = setTimeout(() => {
    const result = sync();
    logResult(result, filename);
    writeStatus(result);
  }, 300);
});
