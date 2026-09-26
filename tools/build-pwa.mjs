#!/usr/bin/env node
/* GGrid PWA build (v0.15.77). Run on every release, after the version bump in index.html:
     node tools/build-pwa.mjs
   Writes the game version and the list of app files with their content hashes into sw.js
   (between the PWA-ASSETS markers). Installed apps notice the changed sw.js, download only the
   changed files and offer the update. tools/test-pwa.mjs fails if this step was forgotten. */
import fs from 'node:fs';
import path from 'node:path';
import {root,appVersion,collectAssets,assetBlock,BLOCK} from './pwa-assets.mjs';
const swPath=path.join(root,'sw.js'),sw=fs.readFileSync(swPath,'utf8').replace(/\r\n/g,'\n');
if(!BLOCK.test(sw))throw Error('sw.js: PWA-ASSETS markers not found');
const version=appVersion(),files=collectAssets();
const next=sw.replace(BLOCK,assetBlock(version,files));
if(next!==sw)fs.writeFileSync(swPath,next);
const bytes=files.reduce((n,f)=>n+fs.statSync(path.join(root,f)).size,0);
console.log(JSON.stringify({pwa:next===sw?'unchanged':'written',version,files:files.length,megabytes:+(bytes/1048576).toFixed(2)}));
