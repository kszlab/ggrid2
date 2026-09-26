/* GGrid v0.15.77 – installable app (PWA): service worker registration and updates.
   sw.js caches every app file, so an installed (or once visited) game runs offline.
   Updates: the browser checks sw.js at start and whenever the app comes back to the foreground
   (at most once a minute). A new version downloads in the background and then waits:
   - in the first seconds after start, still on the home screen, it is applied right away (reload);
   - later a small bar offers "Update" – nothing is replaced in the middle of a level; the bar can be
     closed, and the next start runs the new version anyway.
   Not registered on localhost / *.localhost (development, regression tests), with ?nosw, over plain
   http, or inside a native app shell (Capacitor bundles the files itself). On localhost ?pwa-test
   turns it on for testing; any later localhost load without it removes the worker and its cache
   again, so development never runs on stale cached files. */
const PWA=(()=>{
 const host=location.hostname,local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(host)||host.endsWith('.localhost');
 const test=local&&/[?&]pwa-test\b/.test(location.search);
 const supported='serviceWorker' in navigator&&(test||location.protocol==='https:'&&!local)&&!globalThis.Capacitor&&!/[?&]nosw\b/.test(location.search);
 if(local&&!test&&'serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(async list=>{
  if(!list.length)return;for(const r of list)await r.unregister();for(const k of await caches.keys())if(k.startsWith('ggrid-'))await caches.delete(k);
  console.info('[PWA] localhost: service worker removed (development mode)');
 }).catch(()=>{});
 const startedAt=performance.now(),AUTO='ggrid.pwa.autoUpdated';
 let reg=null,lastCheck=0,requested=false,bar=null;
 // Activate the waiting version; controllerchange then reloads the page (only after our own request,
 // so the very first install – which also changes the controller – never reloads the game).
 function apply(){const w=reg?.waiting;if(!w)return;requested=true;w.postMessage({type:'SKIP_WAITING'})}
 function showBar(){
  if(bar)return;
  bar=document.createElement('div');bar.className='pwa-update-bar';bar.setAttribute('role','status');
  const text=document.createElement('span');text.textContent=I18n.t('pwa.updateReady');
  const now=document.createElement('button');now.type='button';now.className='pwa-update-now';now.textContent=I18n.t('pwa.updateNow');now.addEventListener('click',apply);
  const later=document.createElement('button');later.type='button';later.className='pwa-update-later';later.textContent='✕';later.setAttribute('aria-label',I18n.t('pwa.later'));
  later.addEventListener('click',()=>{bar?.remove();bar=null});
  bar.append(text,now,later);document.body.append(bar);
 }
 function onWaiting(){
  let autoDone=false;try{autoDone=!!sessionStorage.getItem(AUTO)}catch(_){}
  if(!autoDone&&performance.now()-startedAt<15000&&document.body.dataset.uiContext!=='game'){
   try{sessionStorage.setItem(AUTO,'1')}catch(_){}apply();return;
  }
  showBar();
 }
 function watch(r){
  if(r.waiting&&navigator.serviceWorker.controller)onWaiting();
  r.addEventListener('updatefound',()=>{
   const w=r.installing;
   w?.addEventListener('statechange',()=>{
    if(w.state!=='installed')return;
    if(navigator.serviceWorker.controller)onWaiting();
    else if(typeof flashToast==='function')flashToast(I18n.t('pwa.offlineReady'),3500);
   });
  });
 }
 function check(){if(!reg||performance.now()-lastCheck<60000)return;lastCheck=performance.now();reg.update().catch(()=>{})}
 async function init(){
  if(!supported)return;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(requested){requested=false;location.reload()}});
  try{reg=await navigator.serviceWorker.register('sw.js',{updateViaCache:'none'})}catch(e){console.warn('[PWA] service worker registration failed',e);return}
  lastCheck=performance.now();watch(reg);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
 }
 init();
 return{get supported(){return supported},get registration(){return reg},check,apply};
})();
