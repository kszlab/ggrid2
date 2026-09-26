/* GGrid v0.15.62 – theme rotation for free play (self-contained, easy to remove).
   The free-play carousel gets a "Kijelölve / Hozzáadás" switch per theme plus
   "Mind" and "Csak ez"; every new level then shows a random theme from the
   selected ones (never the same twice in a row while there is a choice).
   Restart keeps the theme. The next level's theme is fetched in the background
   so switching is instant. The only hook outside this file is in newLevel().
   To remove the feature: delete this file, css/theme-rotation.css, their two
   tags in index.html and the ThemeRotation line in main.js newLevel(). */
const ThemeRotation=(()=>{
 const KEY='ggrid.freeplay.themes.v1',ROOT='content/themes/index.json';
 const cinema=document.querySelector('#themeCinema'),dots=document.querySelector('#themeDots'),themeEl=document.querySelector('#freeTheme');
 // Theme Studio previews exactly one theme: rotation stays off there.
 const enabled=!new URLSearchParams(location.search).has('themeStudio');
 const themes=()=>ScenarioMode?.freeThemes||[];
 let selected=null,loadedId=null,nextId=null,launchPending=false,switching=0;
 const prefetched=new Set();

 function load(){
  if(selected)return selected;
  try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(s)&&s.length)selected=s}catch(_){}
  // First use: start from the single theme chosen so far, so nothing changes until more are picked.
  if(!selected){let one='classic';try{one=localStorage.getItem('ggrid.freeplay.theme.v1')||'classic'}catch(_){}selected=[one]}
  return selected;
 }
 function valid(){const ids=themes().map(t=>t.id);if(!ids.length)return load();const v=load().filter(id=>ids.includes(id));selected=v.length?v:[ids.includes('classic')?'classic':ids[0]];return selected}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(selected))}catch(_){}}
 function pick(exclude){const a=valid(),pool=a.length>1?a.filter(id=>id!==exclude):a;return pool[Math.floor(Math.random()*pool.length)]}

 // ---- carousel UI ----
 const toggle=document.createElement('button');toggle.type='button';toggle.id='themePick';toggle.className='theme-pick';
 const row=document.createElement('div');row.className='theme-pick-row';
 row.innerHTML='<span id="themePickCount" aria-live="polite"></span><button type="button" id="themePickAll"></button><button type="button" id="themePickOnly"></button>';
 row.querySelector('#themePickAll').textContent=I18n.t('setup.all');row.querySelector('#themePickOnly').textContent=I18n.t('setup.onlyThis');
 if(enabled&&cinema&&dots){cinema.append(toggle);dots.after(row)}
 const current=()=>themeEl?.value||'classic';
 function paint(){
  if(!enabled)return;const a=valid(),on=a.includes(current());
  toggle.textContent=I18n.t(on?'setup.picked':'setup.add');toggle.classList.toggle('on',on);toggle.setAttribute('aria-pressed',String(on));
  toggle.setAttribute('aria-label',I18n.t(on?'setup.pickedAria':'setup.addAria'));
  const list=themes();[...dots.children].forEach((d,i)=>d.classList.toggle('picked',!!list[i]&&a.includes(list[i].id)));
  row.querySelector('#themePickCount').textContent=a.length===list.length&&list.length?I18n.t('setup.allThemes',{n:a.length}):I18n.t('setup.themesPicked',{n:a.length});
 }
 toggle.addEventListener('click',()=>{const a=valid(),id=current();if(a.includes(id)){if(a.length===1)return;selected=a.filter(x=>x!==id)}else selected=[...a,id];save();paint()});
 row.querySelector('#themePickAll').addEventListener('click',()=>{selected=themes().map(t=>t.id);save();paint()});
 row.querySelector('#themePickOnly').addEventListener('click',()=>{selected=[current()];save();paint()});
 // The carousel repaints its dots on every page turn; follow it without touching ui-shell.js.
 if(enabled&&dots)new MutationObserver(paint).observe(dots,{childList:true});

 // ---- level start ----
 // "Játék indítása": start on a random selected theme. Capture on the parent runs
 // before the button's own launch handler, which loads themeEl.value.
 document.querySelector('#freePlaySetup')?.addEventListener('click',e=>{
  if(!enabled||!e.target.closest('#freeSetupPlay')||e.target.closest('#freeSetupPlay').disabled)return;
  const id=pick(null);if(themeEl&&id){themeEl.value=id;loadedId=id;launchPending=true}
 },true);
 function inFreePlay(){return enabled&&!ScenarioMode?.active}
 // Called by main.js newLevel(): switch theme first, then show the level. Returns a Promise.
 function newLevel(requestLevel){
  if(!inFreePlay())return Promise.resolve(requestLevel());
  if(launchPending){launchPending=false;const r=requestLevel();prepareNext();return Promise.resolve(r)}
  const id=nextId||pick(loadedId),token=++switching;nextId=null;
  if(id===loadedId){unlock();const r=requestLevel();prepareNext();return Promise.resolve(r)}
  // While the theme loads, the old level must be dead: no key, swipe, tilt or tap may
  // reach it (and the new theme must not show on it). The newest request wins.
  lock();
  return (async()=>{
   try{
    let res=null;try{res=await ScenarioMode.loadFreeTheme(id)}catch(e){console.error(e)}
    // A newer switch owns the screen now: it shows its own level.
    if(token!==switching)return false;
    // Only a theme that was really applied counts as loaded (a stale or failed load does not).
    if(res?.status==='applied')loadedId=res.id;if(themeEl&&loadedId)themeEl.value=loadedId;const r=requestLevel();prepareNext();return r;
   }finally{if(token===switching)unlock()}
  })();
 }
 function lock(){
  cancelAutoSolve();stopHold();cancelFreezeSelection();MotionControl?.pause?.();
  state=null;initial=null;optimal=[];board.innerHTML='';toast.textContent='';
  document.body.classList.add('level-switching');
 }
 function unlock(){document.body.classList.remove('level-switching')}
 // Choose the next level's theme now and warm the browser cache for it.
 async function prepareNext(){
  nextId=pick(loadedId);const entry=themes().find(t=>t.id===nextId);if(!entry||prefetched.has(nextId))return;prefetched.add(nextId);
  try{
   const url=new URL(entry.src,new URL(ROOT,location.href)).href,t=await (await fetch(url)).json();
   if(t.assets?.css)fetch(new URL(t.assets.css,url).href).catch(()=>{});
   for(const src of globalThis.ThemeAssets?.collect?.(t)||[]){const img=new Image();img.src=globalThis.ThemeAssets.resolveUrl(t,src,url)}
  }catch(_){prefetched.delete(nextId)}
 }
 return{newLevel,paint,get selected(){return [...valid()]},get enabled(){return enabled}};
})();
