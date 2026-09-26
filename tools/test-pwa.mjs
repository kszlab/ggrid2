#!/usr/bin/env node
/* GGrid PWA check (v0.15.77). Run: node tools/test-pwa.mjs
   Fails when a release would ship a stale or incomplete offline app:
   - sw.js VERSION differs from the game version in index.html (build-pwa forgotten after the bump);
   - the sw.js file list or a content hash differs from the current files (new/changed/removed file
     without `node tools/build-pwa.mjs` – installed apps would miss it or reject the download);
   - sw.js lists itself, or a file outside the app (tools, docs);
   - the manifest is not relative to the app folder, or an icon is missing / has the wrong size;
   - index.html does not link the manifest, or the page does not load js/pwa.js. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root,appVersion,collectAssets,hashFile} from './pwa-assets.mjs';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const sw=read('sw.js');
const version=sw.match(/const VERSION="([^"]*)"/)?.[1],assets=JSON.parse(sw.match(/const ASSETS=(\{[\s\S]*?\});/)?.[1]||'null');
assert.ok(assets,'sw.js: ASSETS block not found');
const hint='run: node tools/build-pwa.mjs';
assert.equal(version,appVersion(),`sw.js version ${version} ≠ game version ${appVersion()} – ${hint}`);
const want=collectAssets(),have=Object.keys(assets).sort();
const missing=want.filter(f=>!(f in assets)),extra=have.filter(f=>!want.includes(f));
assert.deepEqual(missing,[],`files missing from sw.js – ${hint}`);
assert.deepEqual(extra,[],`files in sw.js that are no longer app files – ${hint}`);
const stale=want.filter(f=>assets[f]!==hashFile(f));
assert.deepEqual(stale,[],`files changed since sw.js was built – ${hint}`);
assert.ok(!('sw.js' in assets),'sw.js must not cache itself');
for(const f of have)assert.ok(!/^(tools|docs|design|theme-studio)\/|^(editor|theme-lab)\.html$/.test(f),`developer file in the app cache: ${f}`);
// manifest and icons
const manifest=JSON.parse(read('manifest.webmanifest'));
for(const k of ['start_url','scope','id'])assert.ok(!/^(\/|[a-z]+:)/i.test(manifest[k]),`manifest ${k} must be relative (GitHub Pages sub-folder): ${manifest[k]}`);
assert.ok(['standalone','fullscreen'].includes(manifest.display),'manifest display');
const png=manifest.icons.filter(i=>i.type==='image/png');
for(const size of [192,512])assert.ok(png.some(i=>i.sizes===`${size}x${size}`&&/any/.test(i.purpose||'any')),`manifest: ${size}px icon missing`);
assert.ok(png.some(i=>/maskable/.test(i.purpose||'')),'manifest: maskable icon missing');
for(const i of png){const b=fs.readFileSync(path.join(root,i.src)),[w,h]=i.sizes.split('x').map(Number);
 assert.equal(b.readUInt32BE(16),w,`${i.src} width`);assert.equal(b.readUInt32BE(20),h,`${i.src} height`)}
const html=read('index.html');
assert.match(html,/<link rel="manifest" href="manifest\.webmanifest">/,'index.html does not link the manifest');
assert.ok(want.some(f=>f==='js/pwa.js'),'js/pwa.js is not loaded by the page');
const bytes=want.reduce((n,f)=>n+fs.statSync(path.join(root,f)).size,0);
console.log(JSON.stringify({pwa:'passed',version,files:want.length,megabytes:+(bytes/1048576).toFixed(2)}));
