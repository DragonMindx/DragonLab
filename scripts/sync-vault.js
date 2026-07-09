import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "sync-config.json"), "utf-8"));
const { vaultPath, websiteContentPath, mapping } = config;

export function sync() {
  const result = { copied: [], deleted: [], skipped: [] };
  for (const [vaultDir, contentDir] of Object.entries(mapping)) {
    const src = path.join(vaultPath, vaultDir);
    const dest = path.join(websiteContentPath, contentDir);
    if (!fs.existsSync(src)) continue;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const vaultFiles = new Set(fs.readdirSync(src).filter(f => f.endsWith(".md")));
    for (const file of vaultFiles) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      const content = fs.readFileSync(srcFile, "utf-8");
      if (content.includes("draft: true") || content.includes("draft:true")) {
        result.skipped.push(`${vaultDir}/${file}`);
        continue;
      }
      const srcStat = fs.statSync(srcFile);
      const needsCopy = !fs.existsSync(destFile) || fs.statSync(destFile).mtimeMs < srcStat.mtimeMs;
      if (needsCopy) {
        fs.copyFileSync(srcFile, destFile);
        result.copied.push(`${vaultDir}/${file} → ${contentDir}/${file}`);
      }
    }
  }
  return result;
}
