#!/usr/bin/env node
/* GGrid locale checker (v0.15.74). Run: node tools/check-locales.mjs
   - every language has exactly the keys of the source language (hu), no more, no less;
   - placeholders ({n}, {cost}, …) are the same as in the source;
   - HTML only in help.* keys, and only <h3> <p> <strong> <em> <b> <br>;
   - maxLength from the source "@key" notes is respected (warning only);
   - every key used by the game (index.html, js/*.js, theme index) exists in the source.
   Exit code 1 on any error. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f));
const errors=[],warnings=[];
const meta=json('locales/index.json'),srcAll=json(`locales/${meta.source}.json`);
const plain=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!k.startsWith('@')));
const src=plain(srcAll);
const forms=v=>typeof v==='object'&&v?Object.values(v):[v];
const holders=v=>new Set(forms(v).flatMap(s=>[...String(s).matchAll(/\{(\w+)\}/g)].map(m=>m[1])));
const tags=v=>forms(v).flatMap(s=>[...String(s).matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)].map(m=>m[1].toLowerCase()));
const HELP_TAGS=new Set(['h3','p','strong','em','b','br']);
function checkText(lang,k,v){
 for(const tag of tags(v))if(!k.startsWith('help.')||!HELP_TAGS.has(tag))errors.push(`${lang}: ${k}: HTML tag <${tag}> is not allowed here`);
 if(typeof v==='object'&&v&&!('other' in v)&&lang!==meta.source)errors.push(`${lang}: ${k}: plural object needs an "other" form`);
 const max=srcAll['@'+k]?.maxLength;if(max)for(const s of forms(v)){const len=String(s).replace(/\{\w+\}/g,'00').length;if(len>max)warnings.push(`${lang}: ${k}: ${len} characters (limit ${max}): ${s}`)}
}
for(const [k,v] of Object.entries(src))checkText(meta.source,k,v);
for(const l of meta.languages){
 if(l.code===meta.source)continue;
 let tr;try{tr=json(`locales/${l.code}.json`)}catch(e){errors.push(`${l.code}: cannot read locales/${l.code}.json (${e.message})`);continue}
 if(tr['@@locale']&&tr['@@locale']!==l.code)errors.push(`${l.code}: @@locale is "${tr['@@locale']}"`);
 const t=plain(tr);
 for(const k of Object.keys(src))if(!(k in t))errors.push(`${l.code}: missing key ${k}`);
 for(const k of Object.keys(t))if(k!=='@@locale'&&!(k in src))errors.push(`${l.code}: unknown key ${k} (not in ${meta.source}.json)`);
 for(const [k,v] of Object.entries(t)){if(!(k in src)||k==='@@locale')continue;
  const a=holders(src[k]),b=holders(v);
  for(const h of a)if(!b.has(h))errors.push(`${l.code}: ${k}: placeholder {${h}} missing`);
  for(const h of b)if(!a.has(h))errors.push(`${l.code}: ${k}: unknown placeholder {${h}}`);
  checkText(l.code,k,v)}
}
// keys referenced by the game
const used=new Set();
const html=read('index.html');
for(const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g))used.add(m[1]);
for(const m of html.matchAll(/data-i18n-attr="([^"]+)"/g))for(const p of m[1].split(';'))used.add(p.split(':')[1]);
for(const f of fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js'))){
 const s=read('js/'+f);
 for(const m of s.matchAll(/\b(?:I18n\.t|tr)\(\s*'([\w.]+)'/g))used.add(m[1]);
 for(const m of s.matchAll(/\b(?:I18n\.t|tr)\([^)]*?\?\s*'([\w.]+)'\s*:\s*'([\w.]+)'/g)){used.add(m[1]);used.add(m[2])}
}
for(const th of json('content/themes/index.json').themes)for(const part of ['shortName','tag','description'])used.add(`theme.${th.id}.${part}`);
// A key ending in '.' is a dynamic prefix (e.g. tr('exit.side.'+dir)); its keys are listed below.
for(const k of used)if(k&&!k.endsWith('.')&&!(k in src))errors.push(`code uses unknown key ${k}`);
const unused=Object.keys(src).filter(k=>k!=='@@locale'&&!used.has(k)&&!/^(exit\.side|dir|piece|motion|gesture|tip|toast|aria|auto|hint|victory|adaptive|setup|menu|game|top|pad)\.|^settings\.languageAuto$/.test(k));
if(unused.length)warnings.push('keys not found in code (check dynamic use): '+unused.join(', '));
for(const w of warnings)console.warn('WARN',w);
if(errors.length){console.error(errors.join('\n'));console.error(`\n${errors.length} error(s)`);process.exit(1)}
console.log(JSON.stringify({locales:'passed',source:meta.source,languages:meta.languages.map(l=>l.code),keys:Object.keys(src).length-1,usedInCode:used.size,warnings:warnings.length}));
