/**
 * Post-build script:
 *  1. Moves all .js files into js/ and all .css files into css/
 *  2. Renames every JS file to its numeric index (0.js, 1.js, …)
 *     Order: files referenced in index.html first (in DOM order),
 *            then remaining chunk files sorted alphabetically.
 *  3. Patches index.html and all JS file contents with new paths.
 */

import { readdirSync, mkdirSync, renameSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const browserDir = join(process.cwd(), 'dist', 'alseids', 'browser');
const jsDir = join(browserDir, 'js');
const cssDir = join(browserDir, 'css');

// Create target folders
mkdirSync(jsDir, { recursive: true });
mkdirSync(cssDir, { recursive: true });

// Collect all JS and CSS files from the browser root
const allJs = [];
const cssFiles = [];

for (const entry of readdirSync(browserDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const ext = extname(entry.name);
  if (ext === '.js') allJs.push(entry.name);
  else if (ext === '.css') cssFiles.push(entry.name);
}

// --- Determine JS rename order ---
// 1. Files that appear in index.html (in DOM order)
const indexPath = join(browserDir, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const htmlOrdered = [];
const htmlJsRegex = /(?:src|href)="([^"]+\.js)"/g;
let m;
while ((m = htmlJsRegex.exec(html)) !== null) {
  const name = m[1]; // already just the filename (no path prefix yet)
  if (allJs.includes(name) && !htmlOrdered.includes(name)) {
    htmlOrdered.push(name);
  }
}

// 2. Remaining JS files not referenced in index.html (lazy chunks), sorted
const remaining = allJs.filter((f) => !htmlOrdered.includes(f)).sort();

const orderedJs = [...htmlOrdered, ...remaining];

// Build old-name → new-name mapping
/** @type {Map<string, string>} */
const jsRenameMap = new Map();
orderedJs.forEach((oldName, i) => {
  jsRenameMap.set(oldName, `${i}.js`);
});

// Move JS files to js/ with new numeric names
for (const [oldName, newName] of jsRenameMap) {
  renameSync(join(browserDir, oldName), join(jsDir, newName));
}

// Move CSS files to css/
for (const file of cssFiles) {
  renameSync(join(browserDir, file), join(cssDir, file));
}

// --- Patch index.html ---
// Replace JS file references
for (const [oldName, newName] of jsRenameMap) {
  html = html.replaceAll(`"${oldName}"`, `"js/${newName}"`);
  html = html.replaceAll(`'${oldName}'`, `'js/${newName}'`);
}
// Replace CSS file references
for (const file of cssFiles) {
  html = html.replaceAll(`"${file}"`, `"css/${file}"`);
  html = html.replaceAll(`'${file}'`, `'css/${file}'`);
}
writeFileSync(indexPath, html, 'utf8');

// --- Patch internal chunk references inside each JS file ---
// Angular's runtime bundle contains a map of chunk filenames used for lazy loading.
// We must replace every occurrence of the old filename (as a quoted string) with
// the new numeric name so dynamic imports resolve correctly.
for (const [, newName] of jsRenameMap) {
  const filePath = join(jsDir, newName);
  let src = readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [oldName, renamedTo] of jsRenameMap) {
    // Bare reference: "chunk-XXXX.js"  →  "5.js"  (used in index.html-style registries)
    const bare = JSON.stringify(oldName);
    const bareNew = JSON.stringify(renamedTo);
    if (src.includes(bare)) {
      src = src.replaceAll(bare, bareNew);
      changed = true;
    }
    // Relative reference: "./chunk-XXXX.js"  →  "./5.js"  (used in dynamic import() calls)
    const rel = JSON.stringify('./' + oldName);
    const relNew = JSON.stringify('./' + renamedTo);
    if (src.includes(rel)) {
      src = src.replaceAll(rel, relNew);
      changed = true;
    }
  }
  if (changed) writeFileSync(filePath, src, 'utf8');
}
