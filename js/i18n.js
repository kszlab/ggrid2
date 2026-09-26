/* GGrid v0.15.74 – languages (i18n).
   Texts live in one JSON file per language under locales/ (hu = source, en = English);
   locales/TRANSLATING.md explains how to add or update a language. The language is the
   player's choice (Settings → Language) or, on "Automatic", the system language; an
   unsupported system language falls back to English.
   Boot order: this file loads first, fetches the locale files, translates the static page
   (data-i18n / data-i18n-html / data-i18n-attr), and only then loads the game scripts – so
   every module can call I18n.t() from its first line. Changing the language reloads the page.
   Developer tools (scenario editor, Theme Lab, motion measurement) stay Hungarian. */
const I18n=(()=>{
 const KEY='ggrid.lang',warned=new Set();
 let meta={source:'hu',fallback:'en',languages:[{code:'hu',name:'Magyar',intl:'hu-HU'}]},lang='hu',intl='hu-HU',dict={},source={},version='';
 const strip=o=>Object.fromEntries(Object.entries(o||{}).filter(([k])=>!k.startsWith('@')));
 const fetchJson=async p=>{const r=await fetch(p+(version?'?v='+version:''),{cache:'no-cache'});if(!r.ok)throw Error('LOCALE_FETCH '+p);return r.json()};
 function preference(){try{return localStorage.getItem(KEY)||'auto'}catch(_){return 'auto'}}
 // Saved choice first, then the system languages in order, then the fallback (English).
 function chooseLanguage(m,pref,systemLanguages){
  const has=c=>m.languages.some(l=>l.code===c);
  if(pref&&pref!=='auto'&&has(pref))return pref;
  for(const n of systemLanguages||[]){const c=String(n||'').toLowerCase().split(/[-_]/)[0];if(has(c))return c}
  return has(m.fallback)?m.fallback:m.source;
 }
 const format=(s,p)=>String(s).replace(/\{(\w+)\}/g,(m,k)=>p&&k in p?String(p[k]):m);
 // t('key',{n:3}) – missing in the language: source (Hungarian) text + one console warning.
 function t(key,params={},fallback){
  let v=dict[key];
  if(v===undefined){v=source[key];if(!warned.has(key)){warned.add(key);console.warn(v===undefined?'[i18n] Missing key:':'[i18n] Untranslated, using source:',key,lang)}}
  if(v===undefined)return fallback!==undefined?format(fallback,params):key;
  if(v&&typeof v==='object'){const n=Number(params?.n);const cat=new Intl.PluralRules(intl).select(Number.isFinite(n)?n:0);v=v[cat]??v.other??v.one??''}
  return format(v,params);
 }
 // Only a small set of formatting tags may come from a locale file (help texts).
 const ALLOWED=new Set(['H3','P','STRONG','EM','B','BR']);
 function sanitize(html){
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const walk=node=>{for(const el of [...node.children]){walk(el);if(!ALLOWED.has(el.tagName)){el.replaceWith(...el.childNodes)}else for(const a of [...el.attributes])el.removeAttribute(a.name)}};
  walk(tpl.content);return tpl.innerHTML;
 }
 function apply(root=document){
  root.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
  root.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=sanitize(t(el.dataset.i18nHtml))});
  root.querySelectorAll('[data-i18n-attr]').forEach(el=>{for(const pair of el.dataset.i18nAttr.split(';')){const [attr,key]=pair.split(':').map(s=>s.trim());if(attr&&key)el.setAttribute(attr,t(key))}});
  document.documentElement.lang=lang;
 }
 const num=(x,digits=0)=>new Intl.NumberFormat(intl,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(x);
 function setLanguage(code){try{if(!code||code==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,code)}catch(_){}location.reload()}
 function bindPicker(){
  const sel=document.getElementById('languageSelect');if(!sel)return;
  sel.innerHTML='';const auto=document.createElement('option');auto.value='auto';auto.textContent=t('settings.languageAuto');sel.append(auto);
  for(const l of meta.languages){const o=document.createElement('option');o.value=l.code;o.textContent=l.name;sel.append(o)}
  sel.value=preference();sel.addEventListener('change',()=>setLanguage(sel.value));
 }
 async function boot(ver,scripts){
  version=ver||'';
  try{
   meta=await fetchJson('locales/index.json');
   lang=chooseLanguage(meta,preference(),navigator.languages||[navigator.language]);
   intl=meta.languages.find(l=>l.code===lang)?.intl||lang;
   source=strip(await fetchJson(`locales/${meta.source}.json`));
   dict=lang===meta.source?source:strip(await fetchJson(`locales/${lang}.json`));
  }catch(e){console.error('[i18n] Locale files could not be loaded; the page stays in Hungarian.',e);lang='hu';intl='hu-HU'}
  apply();bindPicker();
  // Game scripts in their original order (async=false keeps execution order).
  for(const src of scripts){const s=document.createElement('script');s.src=src;s.async=false;document.body.append(s)}
 }
 return{boot,t,apply,num,sanitize,setLanguage,chooseLanguage,get lang(){return lang},get intl(){return intl},get preference(){return preference()},get languages(){return meta.languages}};
})();
