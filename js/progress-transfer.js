/* GGrid v0.15.77 – back up and restore progress (Settings → App).
   Progress lives in this browser's localStorage under ggrid.* keys: points and solved levels,
   adaptive difficulty, free-play range and themes, sound, layout, gestures, language. An installed
   iPhone app has its own storage (separate from Safari), and a new phone or a later store app starts
   empty – the backup file carries everything across.
   Backup file: {"format":"ggrid-progress","formatVersion":1,"version":"<game>","exported":"<ISO>",
   "data":{"ggrid.…":"<stored string>",…}}. Restoring replaces all ggrid.* keys, then reloads.
   Developer-only keys (Theme Lab) stay out of the file and are kept on restore. */
const ProgressTransfer=(()=>{
 const FORMAT='ggrid-progress',PREFIX='ggrid.',SKIP=/^ggrid\.(theme-lab\.|pwa\.)/;
 const own=k=>k.startsWith(PREFIX)&&!SKIP.test(k);
 function snapshot(){
  const data={};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(own(k))data[k]=localStorage.getItem(k)}
  return{format:FORMAT,formatVersion:1,version:document.querySelector('.home-version')?.textContent?.replace(/^v/,'')||'',exported:new Date().toISOString(),data};
 }
 // Feedback in the settings row itself (the board toast would sit behind the settings panel).
 const timers=new Map();
 function say(id,text,ok=true){
  const el=document.getElementById(id);if(!el){flashToast(text);return}
  if(!el.dataset.text)el.dataset.text=el.textContent;
  el.textContent=(ok?'✓ ':'⚠ ')+text;el.classList.add('settings-status',ok?'ok':'bad');el.classList.remove(ok?'bad':'ok');el.setAttribute('role','status');
  clearTimeout(timers.get(id));timers.set(id,setTimeout(()=>{el.textContent=el.dataset.text;delete el.dataset.text;el.classList.remove('settings-status','ok','bad');el.removeAttribute('role')},4000));
 }
 function pointsOf(data){try{const s=JSON.parse(data['ggrid.freeplay.score.v2']||'null');return Math.round(Number(s?.balance)||0)}catch(_){return 0}}
 async function exportProgress(){
  let snap;try{snap=snapshot()}catch(e){console.error(e);say('exportHint',I18n.t('progress.failed'),false);return}
  const day=snap.exported.slice(0,10),name=`ggrid-progress-${day}.json`;
  const file=new File([JSON.stringify(snap,null,1)],name,{type:'application/json'});
  // Phones: the share sheet can save to Files / Drive / send; elsewhere a normal download.
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file],title:'GGrid'});say('exportHint',I18n.t('progress.exported'));return}
   catch(e){if(e?.name==='AbortError')return}
  }
  const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);say('exportHint',I18n.t('progress.exported'));
 }
 function parse(text){
  const doc=JSON.parse(text);
  if(doc?.format!==FORMAT||doc.formatVersion!==1||!doc.data||typeof doc.data!=='object')throw Error('FORMAT');
  const data={};for(const [k,v] of Object.entries(doc.data))if(own(k)&&typeof v==='string')data[k]=v;
  if(!Object.keys(data).length)throw Error('EMPTY');
  return{doc,data};
 }
 async function importFile(file){
  let parsed;try{parsed=parse(await file.text())}catch(e){say('importHint',I18n.t('progress.importBad'),false);return}
  const {doc,data}=parsed,date=new Date(doc.exported);
  const when=isNaN(date)?'?':date.toLocaleString(I18n.intl,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  if(!confirm(I18n.t('progress.importConfirm',{date:when,points:I18n.num(pointsOf(data))})))return;
  try{
   const old=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(own(k))old.push(k)}
   for(const k of old)localStorage.removeItem(k);
   for(const [k,v] of Object.entries(data))localStorage.setItem(k,v);
  }catch(e){console.error(e);say('importHint',I18n.t('progress.failed'),false);return}
  location.reload();
 }
 const input=document.getElementById('importProgressFile');
 document.getElementById('exportProgress')?.addEventListener('click',exportProgress);
 document.getElementById('importProgress')?.addEventListener('click',()=>{if(input){input.value='';input.click()}});
 input?.addEventListener('change',()=>{const f=input.files?.[0];if(f)importFile(f)});
 return{snapshot,parse,exportProgress,importFile};
})();
