#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "manifest.json");
const outDir = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, "rendered-svg");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const manifestDir = path.dirname(manifestPath);
fs.mkdirSync(outDir, { recursive: true });

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({
  packages: AllPackages,
  inlineMath: [["$", "$"], ["\\(", "\\)"]],
  displayMath: [["$$", "$$"], ["\\[", "\\]"]],
});
const svg = new SVG({ fontCache: "none" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

function standaloneSvgFromNode(node) {
  const svgNode = adaptor.tags(node, "svg")[0];
  if (!svgNode) throw new Error("MathJax did not produce an SVG element.");
  let output = adaptor.outerHTML(svgNode);
  if (!/xmlns=/.test(output)) output = output.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  return output;
}

let ok = 0;
for (const item of manifest.formulas) {
  const texPath = path.join(manifestDir, item.texFile);
  const source = fs.readFileSync(texPath, "utf8").trim();
  try {
    const node = html.convert(source, { display: true, em: 16, ex: 8, containerWidth: 1200 });
    fs.writeFileSync(path.join(outDir, item.svgFile), standaloneSvgFromNode(node), "utf8");
    ok += 1;
  } catch (error) {
    const errPath = path.join(outDir, item.svgFile.replace(/\.svg$/, ".error.txt"));
    fs.writeFileSync(errPath, `${error.stack || error.message}\n\n--- TeX ---\n${source}\n`, "utf8");
    console.error(`[failed] ${item.id}: ${error.message}`);
  }
}

console.log(`Rendered ${ok}/${manifest.formulas.length} SVG files into ${outDir}`);
