/* GGrid PWA asset list (v0.15.77) – shared by tools/build-pwa.mjs and tools/test-pwa.mjs.
   collectAssets() lists every file the game can load at runtime, relative to the app root:
   - the page, manifest, icons, and every stylesheet/script/icon referenced by index.html,
     including the game scripts in the I18n.boot([...]) list;
   - the locale files listed in locales/index.json;
   - the level catalogs and every pack they list (core, multiball, generated-test);
   - the theme index and every file of every theme folder (theme.json, CSS, artwork), docs excluded;
   - the scenarios (hidden developer mode, small).
   Developer pages and tools (editor, Theme Lab, Theme Studio, tools/, docs/, design/) are not part
   of the app. hashFile() hashes the content as GitHub Pages serves it: git stores text files with
   LF line ends, so CRLF in a Windows working copy is normalised (a file with a NUL byte in its first
   8000 bytes is binary, the same heuristic git uses). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f));
const local=u=>u&&!/^(?:[a-z]+:|\/\/|#)/i.test(u);
const clean=u=>decodeURI(u.split(/[?#]/)[0]).replace(/^\.\//,'');
const join=(base,rel)=>path.posix.normalize(path.posix.join(path.posix.dirname(base),clean(rel)));
export function appVersion(){const m=read('index.html').match(/I18n\.boot\('([\d.]+)'/);if(!m)throw Error('index.html: I18n.boot version not found');return m[1]}
function walk(dir,skip=()=>false){const out=[];for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const p=path.posix.join(dir,e.name);if(skip(p,e))continue;if(e.isDirectory())out.push(...walk(p,skip));else out.push(p)}return out}
export function collectAssets(){
 const files=new Set(['index.html','manifest.webmanifest']);
 const html=read('index.html');
 for(const m of html.matchAll(/<(?:link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g))if(local(m[1]))files.add(clean(m[1]));
 const boot=html.match(/I18n\.boot\('[\d.]+',\s*\[([\s\S]*?)\]\)/);if(!boot)throw Error('index.html: I18n.boot script list not found');
 for(const m of boot[1].matchAll(/'([^']+)'/g))files.add(clean(m[1]));
 for(const icon of json('manifest.webmanifest').icons||[])files.add(clean(icon.src));
 files.add('locales/index.json');for(const l of json('locales/index.json').languages)files.add(`locales/${l.code}.json`);
 for(const cat of ['content/levels/catalog.json','content/levels/multiball/catalog.json','content/levels/generated-test/catalog.json']){
  files.add(cat);for(const p of json(cat).packs||[])files.add(join(cat,p.src));
 }
 files.add('content/themes/index.json');
 for(const f of walk('content/themes',(p,e)=>!e.isDirectory()&&/\.md$/i.test(p)))files.add(f);
 const themeIndex=json('content/themes/index.json');
 for(const t of themeIndex.themes){
  for(const ref of [t.src,t.css])if(ref)files.add(join('content/themes/index.json',ref));
  if(t.preview?.image)files.add(clean(t.preview.image));
 }
 for(const f of walk('content/scenarios'))files.add(f);
 const missing=[...files].filter(f=>!fs.existsSync(path.join(root,f)));
 if(missing.length)throw Error('missing app files:\n  '+missing.join('\n  '));
 return [...files].sort();
}
export function hashFile(f){
 let buf=fs.readFileSync(path.join(root,f));
 if(!buf.subarray(0,8000).includes(0))buf=Buffer.from(buf.toString('latin1').replace(/\r\n/g,'\n'),'latin1');
 return crypto.createHash('sha256').update(buf).digest('hex').slice(0,16);
}
// The generated block inside sw.js (between the PWA-ASSETS markers).
export function assetBlock(version,files){
 const lines=files.map(f=>` ${JSON.stringify(f)}:${JSON.stringify(hashFile(f))}`);
 return `/* PWA-ASSETS:BEGIN */\nconst VERSION=${JSON.stringify(version)};\nconst ASSETS={\n${lines.join(',\n')}\n};\n/* PWA-ASSETS:END */`;
}
export const BLOCK=/\/\* PWA-ASSETS:BEGIN \*\/[\s\S]*?\/\* PWA-ASSETS:END \*\//;
