import fs from "fs";
import path from "path";

const DEFAULT_ASSET_EXTENSIONS = new Set([
  ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif",
  ".pdf", ".mp4", ".webm", ".mp3", ".wav", ".json", ".csv"
]);
const ASSET_FOLDERS = ["assets", "asset", "formulas", "formula", "images", "media"];

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function copyFileIfChanged(srcFile, destFile) {
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  if (fs.existsSync(destFile)) {
    const srcStat = fs.statSync(srcFile);
    const destStat = fs.statSync(destFile);
    if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size === srcStat.size) return false;
  }
  fs.copyFileSync(srcFile, destFile);
  return true;
}

function copyDirectoryAssets(srcDir, destDir, copied, relativePrefix = "") {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const relPath = path.join(relativePrefix, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryAssets(srcPath, destDir, copied, relPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!DEFAULT_ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
    const destPath = path.join(destDir, relPath);
    if (copyFileIfChanged(srcPath, destPath)) copied.push(toPosixPath(relPath));
  }
}

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function hasFrontmatterFlag(markdown, key) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return false;
  return new RegExp(`(^|\\n)${escapeRegExp(key)}\\s*:\\s*(true|yes|1)\\s*(\\n|$)`, "i").test(match[1]);
}

function stripBundleOnlyFrontmatter(markdown) {
  return markdown;
}

function rewriteAssetLinks(markdown, publicUrl) {
  let next = markdown;
  const folders = ["assets", "asset", "formulas", "formula", "images", "media"];
  for (const folder of folders) {
    const folderPattern = escapeRegExp(folder);
    next = next.replace(
      new RegExp(`(!\\[[^\\]]*\\]\\()\\.?/?${folderPattern}/([^\\)]+\\))`, "g"),
      (_, prefix, file) => `${prefix}${publicUrl}/${folder}/${file}`
    );
    next = next.replace(
      new RegExp(`(<(?:img|source|video|audio)\\b[^>]*?\\s(?:src|href)=['"])\\.?/?${folderPattern}/([^'"]+)(['"])`, "g"),
      (_, prefix, file, suffix) => `${prefix}${publicUrl}/${folder}/${file}${suffix}`
    );
  }
  return next;
}

function findAssetBundleFolders(srcDir) {
  if (!fs.existsSync(srcDir)) return [];
  return fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, dir: path.join(srcDir, entry.name), index: path.join(srcDir, entry.name, "index.md") }))
    .filter((bundle) => fs.existsSync(bundle.index));
}

function hasAssetFolders(dir) {
  return ASSET_FOLDERS.some((folder) => fs.existsSync(path.join(dir, folder)));
}

function findCompanionAssetFolders(srcDir) {
  if (!fs.existsSync(srcDir)) return [];
  return fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, dir: path.join(srcDir, entry.name), index: path.join(srcDir, entry.name, "index.md") }))
    .filter((bundle) => !fs.existsSync(bundle.index))
    .filter((bundle) => fs.existsSync(path.join(srcDir, `${bundle.name}.md`)))
    .filter((bundle) => hasAssetFolders(bundle.dir));
}

export function syncAssetBundles({ srcDir, contentDir, publicRoot, collection, base = "/DragonLab" }) {
  const result = { generated: [], assetsCopied: [], assetsDeleted: [], skipped: [], generatedFiles: new Set() };
  const bundles = findAssetBundleFolders(srcDir);
  const activeBundleNames = new Set();

  for (const bundle of bundles) {
    const raw = fs.readFileSync(bundle.index, "utf-8");
    if (raw.includes("draft: true") || raw.includes("draft:true")) {
      result.skipped.push(`${collection}/${bundle.name}/index.md`);
      continue;
    }

    const isExplicitBundle = hasFrontmatterFlag(raw, "assetBundle") || hasFrontmatterFlag(raw, "asset_bundle");
    if (!isExplicitBundle && !hasAssetFolders(bundle.dir)) continue;

    const slug = bundle.name;
    const destMd = path.join(contentDir, `${slug}.md`);
    const publicDir = path.join(publicRoot, "assets", collection, slug);
    const publicUrl = `${base}/assets/${collection}/${slug}`;

    let md = stripBundleOnlyFrontmatter(raw);
    md = rewriteAssetLinks(md, publicUrl);
    fs.mkdirSync(contentDir, { recursive: true });
    fs.writeFileSync(destMd, md, "utf-8");

    const copied = [];
    cleanDirectory(publicDir);
    for (const folder of ASSET_FOLDERS) {
      copyDirectoryAssets(path.join(bundle.dir, folder), path.join(publicDir, folder), copied, "");
    }

    activeBundleNames.add(slug);
    result.generatedFiles.add(`${slug}.md`);
    result.generated.push(`${collection}/${slug}/index.md -> ${collection}/${slug}.md`);
    result.assetsCopied.push(...copied.map((file) => `${collection}/${slug}/${file}`));
  }

  for (const bundle of findCompanionAssetFolders(srcDir)) {
    const slug = bundle.name;
    const publicDir = path.join(publicRoot, "assets", collection, slug);
    const copied = [];
    cleanDirectory(publicDir);
    for (const folder of ASSET_FOLDERS) {
      copyDirectoryAssets(path.join(bundle.dir, folder), path.join(publicDir, folder), copied, "");
    }

    activeBundleNames.add(slug);
    result.assetsCopied.push(...copied.map((file) => `${collection}/${slug}/${file}`));
  }

  const publicCollectionDir = path.join(publicRoot, "assets", collection);
  if (fs.existsSync(publicCollectionDir)) {
    for (const entry of fs.readdirSync(publicCollectionDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !activeBundleNames.has(entry.name)) {
        cleanDirectory(path.join(publicCollectionDir, entry.name));
        result.assetsDeleted.push(`${collection}/${entry.name}`);
      }
    }
  }

  return result;
}
