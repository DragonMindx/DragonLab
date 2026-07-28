import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { syncAssetBundles } from "./asset-bundles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "sync-config.json"), "utf-8"));
const { vaultPath, websiteContentPath, mapping } = config;
const publicRoot = path.join(ROOT, "public");
const base = config.base ?? "/DragonLab";
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"]);

function escapeYamlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function slugifyPdfName(file) {
  return path.basename(file, path.extname(file))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function metadataFromPdfName(file) {
  const rawName = path.basename(file, path.extname(file));
  const dateMatch = rawName.match(/^(\d{4}-\d{2}-\d{2})[-_\s]+(.+)$/);
  const date = dateMatch?.[1] ?? new Date().toISOString().slice(0, 10);
  const titleSource = dateMatch?.[2] ?? rawName;
  const title = titleSource.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || rawName;
  return { date, title };
}

function isImageFile(file) {
  return IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function publicImageUrl(fileName) {
  return `${base}/images/${encodeURI(fileName).replace(/#/g, "%23")}`;
}

function copyImageIfFound(filePath, copiedImages) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  if (!isImageFile(filePath)) return null;

  const fileName = path.basename(filePath);
  const destFile = path.join(publicRoot, "images", fileName);
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  const srcStat = fs.statSync(filePath);
  const needsCopy = !fs.existsSync(destFile) || fs.statSync(destFile).mtimeMs < srcStat.mtimeMs || fs.statSync(destFile).size !== srcStat.size;
  if (needsCopy) {
    fs.copyFileSync(filePath, destFile);
    copiedImages.push(`images/${fileName}`);
  }
  return publicImageUrl(fileName);
}

function resolveVaultImage(target, currentDir) {
  const normalized = target.trim().split("|")[0].trim();
  if (!normalized) return null;
  const decoded = decodeURI(normalized);
  const candidates = [];

  if (path.isAbsolute(decoded)) {
    candidates.push(decoded);
    candidates.push(path.join(vaultPath, "images", path.basename(decoded)));
  } else {
    candidates.push(path.resolve(currentDir, decoded));
    candidates.push(path.join(vaultPath, "images", decoded));
    candidates.push(path.join(vaultPath, decoded));
    candidates.push(path.join(vaultPath, "images", path.basename(decoded)));
    candidates.push(path.join(vaultPath, path.basename(decoded)));
  }

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function rewriteImageLinks(markdown, currentDir, copiedImages) {
  let next = markdown;

  next = next.replace(/!\[\[([^\]]+)\]\]/g, (match, target) => {
    const resolved = resolveVaultImage(target, currentDir);
    if (!resolved) return match;
    const alt = path.basename(target.split("|")[1]?.trim() || resolved, path.extname(resolved));
    return `![${alt}](${copyImageIfFound(resolved, copiedImages)})`;
  });

  next = next.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, target) => {
    const cleaned = target.trim();
    if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith(`${base}/`)) return match;

    if (cleaned.startsWith("/Learning-Blog/assets/images/")) {
      const fileName = path.basename(cleaned);
      const resolved = resolveVaultImage(fileName, currentDir);
      const url = resolved ? copyImageIfFound(resolved, copiedImages) : publicImageUrl(fileName);
      return `![${alt}](${url})`;
    }

    const resolved = resolveVaultImage(cleaned, currentDir);
    if (!resolved) return match;
    return `![${alt}](${copyImageIfFound(resolved, copiedImages)})`;
  });

  return next;
}

function syncGlobalImages() {
  const copied = [];
  const imageDirs = [path.join(vaultPath, "images"), vaultPath];
  for (const dir of imageDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !isImageFile(entry.name)) continue;
      copyImageIfFound(path.join(dir, entry.name), copied);
    }
  }
  return copied;
}

function copyPdfPosts({ src, dest, vaultDir, collection, vaultMdFiles }) {
  const result = { generated: [], copied: [], skipped: [], generatedFiles: new Set(), activePdfSlugs: new Set() };
  const pdfFiles = fs.existsSync(src) ? fs.readdirSync(src).filter((f) => f.toLowerCase().endsWith(".pdf")) : [];
  const pdfPublicDir = path.join(publicRoot, "assets", "pdf", collection);
  fs.mkdirSync(pdfPublicDir, { recursive: true });

  for (const file of pdfFiles) {
    const slug = slugifyPdfName(file);
    const generatedMd = `${slug}.md`;
    result.activePdfSlugs.add(slug);

    if (vaultMdFiles.has(generatedMd)) {
      result.skipped.push(`${vaultDir}/${file} (shadowed by ${generatedMd})`);
      continue;
    }

    const srcFile = path.join(src, file);
    const pdfDestFile = path.join(pdfPublicDir, `${slug}.pdf`);
    const srcStat = fs.statSync(srcFile);
    const needsPdfCopy = !fs.existsSync(pdfDestFile) || fs.statSync(pdfDestFile).mtimeMs < srcStat.mtimeMs || fs.statSync(pdfDestFile).size !== srcStat.size;
    if (needsPdfCopy) {
      fs.copyFileSync(srcFile, pdfDestFile);
      result.copied.push(`${vaultDir}/${file} -> assets/pdf/${collection}/${slug}.pdf`);
    }

    const { date, title } = metadataFromPdfName(file);
    const generatedContent = `---\ntitle: "${escapeYamlString(title)}"\ndate: "${date}"\ntags: []\ncontentType: "pdf"\npdfSrc: "${base}/assets/pdf/${collection}/${slug}.pdf"\npdfFile: "${escapeYamlString(file)}"\n---\n\nPDF document: ${title}\n`;
    const mdDestFile = path.join(dest, generatedMd);
    if (!fs.existsSync(mdDestFile) || fs.readFileSync(mdDestFile, "utf-8") !== generatedContent) {
      fs.writeFileSync(mdDestFile, generatedContent);
      result.generated.push(`${vaultDir}/${file} -> ${collection}/${generatedMd}`);
    }
    result.generatedFiles.add(generatedMd);
  }

  if (fs.existsSync(pdfPublicDir)) {
    for (const file of fs.readdirSync(pdfPublicDir).filter((f) => f.toLowerCase().endsWith(".pdf"))) {
      const slug = path.basename(file, ".pdf");
      if (!result.activePdfSlugs.has(slug)) {
        fs.unlinkSync(path.join(pdfPublicDir, file));
        result.copied.push(`removed assets/pdf/${collection}/${file}`);
      }
    }
  }

  return result;
}

export function sync() {
  const result = { copied: [], deleted: [], skipped: [], images: syncGlobalImages(), bundles: [], pdf: [] };
  for (const [vaultDir, contentDirName] of Object.entries(mapping)) {
    const src = path.join(vaultPath, vaultDir);
    const dest = path.join(websiteContentPath, contentDirName);

    const vaultFiles = new Set(
      fs.existsSync(src) ? fs.readdirSync(src).filter(f => f.endsWith(".md")) : []
    );

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const bundleResult = syncAssetBundles({
      srcDir: src,
      contentDir: dest,
      publicRoot,
      collection: contentDirName,
      base,
    });
    result.bundles.push({
      collection: contentDirName,
      generated: bundleResult.generated,
      assetsCopied: bundleResult.assetsCopied,
      assetsDeleted: bundleResult.assetsDeleted,
      skipped: bundleResult.skipped,
    });
    for (const skipped of bundleResult.skipped) result.skipped.push(skipped);

    const pdfResult = copyPdfPosts({
      src,
      dest,
      vaultDir,
      collection: contentDirName,
      vaultMdFiles: vaultFiles,
    });
    result.pdf.push({
      collection: contentDirName,
      generated: pdfResult.generated,
      copied: pdfResult.copied,
      skipped: pdfResult.skipped,
    });
    for (const skipped of pdfResult.skipped) result.skipped.push(skipped);

    for (const file of vaultFiles) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      const content = fs.readFileSync(srcFile, "utf-8");
      if (content.includes("draft: true") || content.includes("draft:true")) {
        result.skipped.push(`${vaultDir}/${file}`);
        continue;
      }
      const srcStat = fs.statSync(srcFile);
      const copiedImages = [];
      const fixed = rewriteImageLinks(content, path.dirname(srcFile), copiedImages);
      result.images.push(...copiedImages);
      const needsCopy = !fs.existsSync(destFile) || fs.statSync(destFile).mtimeMs < srcStat.mtimeMs || fs.readFileSync(destFile, "utf-8") !== fixed;
      if (needsCopy) {
        fs.writeFileSync(destFile, fixed);
        result.copied.push(`${vaultDir}/${file} -> ${contentDirName}/${file}`);
      }
    }

    // Clean orphans: files in dest that no longer exist in vault and were not generated by an asset bundle.
    const destFiles = fs.readdirSync(dest).filter(f => f.endsWith(".md"));
    for (const file of destFiles) {
      if (!vaultFiles.has(file) && !bundleResult.generatedFiles.has(file) && !pdfResult.generatedFiles.has(file)) {
        fs.unlinkSync(path.join(dest, file));
        result.deleted.push(`${contentDirName}/${file}`);
      }
    }
  }
  return result;
}
