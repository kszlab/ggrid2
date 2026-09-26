#!/usr/bin/env node
/* GGrid app icons (v0.15.77). Run: node tools/build-icons.mjs
   Renders the PWA icons from the SVG sources with headless Chrome (set CHROME=<path> if it is
   not in a default location):
     favicon.svg                    -> icons/icon-192.png, icons/icon-512.png   (purpose "any")
     design/icons/icon-maskable.svg -> icons/icon-maskable-512.png            (purpose "maskable")
   The PNGs are committed; run this again only when an icon source changes. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const chrome=[process.env.CHROME,
 'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe',
 '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));
if(!chrome){console.error('Chrome/Edge not found – set CHROME=<path to chrome>');process.exit(1)}
const jobs=[['favicon.svg','icons/icon-192.png',192],['favicon.svg','icons/icon-512.png',512],['design/icons/icon-maskable.svg','icons/icon-maskable-512.png',512]];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ggrid-icons-'));
fs.mkdirSync(path.join(root,'icons'),{recursive:true});
for(const [src,out,size] of jobs){
 const html=path.join(tmp,'icon.html');
 fs.writeFileSync(html,`<!doctype html><html><body style="margin:0;background:transparent"><img src="${pathToFileURL(path.join(root,src)).href}" width="${size}" height="${size}" style="display:block"></body></html>`);
 const target=path.join(root,out);
 execFileSync(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--default-background-color=00000000',
  `--window-size=${size},${size}`,`--screenshot=${target}`,pathToFileURL(html).href],{stdio:'ignore'});
 const png=fs.readFileSync(target),w=png.readUInt32BE(16),h=png.readUInt32BE(20);
 if(w!==size||h!==size)throw Error(`${out}: ${w}x${h}, expected ${size}x${size}`);
 console.log(`${out}  ${w}x${h}  ${png.length} bytes`);
}
fs.rmSync(tmp,{recursive:true,force:true});
