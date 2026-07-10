import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "sync-config.json"), "utf-8"));
const { vaultPath, websiteContentPath, mapping } = config;

export function sync() {
  const result = { copied: [], deleted: [], skipped: [] };
  for (const [vaultDir, contentDir] of Object.entries(mapping)) {
    const src = path.join(vaultPath, vaultDir);
    const dest = path.join(websiteContentPath, contentDir);

    const vaultFiles = new Set(
      fs.existsSync(src) ? fs.readdirSync(src).filter(f => f.endsWith(".md")) : []
    );

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

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
        const fixed = content.replace(
          /!\[([^\]]*)\]\(\.\.\/images\//g,
          '![$1](/DragonLab/images/'
        );
        fs.writeFileSync(destFile, fixed);
        result.copied.push(`${vaultDir}/${file} → ${contentDir}/${file}`);
      }
    }

    // Clean orphans: files in dest that no longer exist in vault
    const destFiles = fs.readdirSync(dest).filter(f => f.endsWith(".md"));
    for (const file of destFiles) {
      if (!vaultFiles.has(file)) {
        fs.unlinkSync(path.join(dest, file));
        result.deleted.push(`${contentDir}/${file}`);
      }
    }
  }
  return result;
}
