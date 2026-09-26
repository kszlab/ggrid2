/* GGrid service worker – offline play and updates (PWA, v0.15.77).
   The block between the PWA-ASSETS markers is written by `node tools/build-pwa.mjs` (run it on every
   release): VERSION is the game version, ASSETS maps every file the game can load (relative to the
   app root) to a hash of its content.
   - install:  downloads only files whose hash is not cached yet (an update re-downloads just the
               changed files) and checks each download against its hash, so a half-deployed
               release is never installed; the install then fails and is retried at the next check.
   - activate: removes cached files that are no longer part of this version.
   - fetch:    a known file (query string ignored, e.g. ?v=…) comes from the cache, the app root
               (…/ggrid2/) is index.html; everything else (tools, docs) goes to the network.
   The page activates a waiting version only when the player asks (update bar) or at app start –
   see js/pwa.js. Not registered on localhost, so development and the regression tests stay uncached. */
/* PWA-ASSETS:BEGIN */
const VERSION="0.15.76";
const ASSETS={
 "apple-touch-icon.png":"5574ffe93c14ebf7",
 "content/levels/catalog.json":"3fc9f99727cdc573",
 "content/levels/generated-test/catalog.json":"8efe2b31939b7931",
 "content/levels/generated-test/packs/fastgen-v2-600-mixed-20260925.json":"f936f1d1d7c50904",
 "content/levels/generated-test/packs/fastgen-v3-d10-benchmark.json":"4a616774fed74224",
 "content/levels/multiball/catalog.json":"3155db01361ce3ef",
 "content/levels/multiball/packs/expansion-v3-2000-b2.json":"7de03f5ae780a55e",
 "content/levels/multiball/packs/multiball-v2-3x3.json":"28d31671b0d90e3e",
 "content/levels/multiball/packs/multiball-v2-4x4.json":"b23e1e4100c5f5df",
 "content/levels/multiball/packs/multiball-v2-5x5.json":"98b127c67a12d1d3",
 "content/levels/multiball/packs/multiball-v2-5x6.json":"25d20bf0dc177c3e",
 "content/levels/multiball/packs/multiball-v2-5x7.json":"3279ad6a06ea5208",
 "content/levels/multiball/packs/multiball-v2-5x8.json":"996c9681d604e38a",
 "content/levels/packs/classified-v2-3x3.json":"798697fc5636d882",
 "content/levels/packs/classified-v2-4x4.json":"a89aa0f1a1acf412",
 "content/levels/packs/classified-v2-5x5.json":"fc6f1293f94da9fe",
 "content/levels/packs/classified-v2-5x6.json":"48235dff0afda99d",
 "content/levels/packs/classified-v2-5x7.json":"88c7aac8a83a220a",
 "content/levels/packs/classified-v2-5x8.json":"ea9f31eec38db4e4",
 "content/levels/packs/expansion-v2-3x3.json":"45d3e5be1738f6a6",
 "content/levels/packs/expansion-v2-4x4.json":"c05ee1c7820d6d11",
 "content/levels/packs/expansion-v2-5x5.json":"21d4582b2bae0084",
 "content/levels/packs/expansion-v2-5x6.json":"f2c0160ad24d63ff",
 "content/levels/packs/expansion-v2-5x7.json":"276e340bbf21e2d7",
 "content/levels/packs/expansion-v2-5x8.json":"82e68d6397b03a18",
 "content/levels/packs/expansion-v3-2000-b1.json":"534bbe4ab066815d",
 "content/scenarios/custom-01/editor-project.json":"6f6a17ed4cde5183",
 "content/scenarios/custom-01/levels/stage-01.json":"2ca9e2d2994166ca",
 "content/scenarios/custom-01/levels/stage-02.json":"89d771f9c6cf761c",
 "content/scenarios/custom-01/levels/stage-03.json":"75e8f7aca6b6fd8e",
 "content/scenarios/custom-01/levels/stage-04.json":"8edad4285c5fd582",
 "content/scenarios/custom-01/levels/stage-05.json":"dc6aed1df9ba5797",
 "content/scenarios/custom-01/levels/stage-06.json":"98a9b55a0ba74e82",
 "content/scenarios/custom-01/scenario.json":"f4913d499467c408",
 "content/scenarios/index.json":"fd84bd13361080e7",
 "content/scenarios/lost-mine/scenario.json":"b4ecc53a26678dbe",
 "content/scenarios/renderer-showcase-2/scenario.json":"d0b880da7ea9909d",
 "content/scenarios/renderer-showcase/scenario.json":"bdbccd1245ccd5a6",
 "content/themes/abyssal-lab/preview.css":"f411e82f3188b5d4",
 "content/themes/abyssal-lab/theme.css":"ffe756769ef82bd9",
 "content/themes/abyssal-lab/theme.json":"ad4c75a16d75d08c",
 "content/themes/ancient-temple/theme.css":"fb07410e802b5143",
 "content/themes/ancient-temple/theme.json":"ca839406b5933686",
 "content/themes/celestial-library/approved-reference.json":"239d96a2e5d7d695",
 "content/themes/celestial-library/artwork.css":"cfe0833ab93a36a1",
 "content/themes/celestial-library/artwork/ball.svg":"480bc5dd9b370ba1",
 "content/themes/celestial-library/artwork/board-frame.svg":"ce00956521cacbc5",
 "content/themes/celestial-library/artwork/book-2h.svg":"f2498d97f84be079",
 "content/themes/celestial-library/artwork/book-2v.svg":"63175821eaac56be",
 "content/themes/celestial-library/artwork/book-3h.svg":"cc1e041a0d30a1f7",
 "content/themes/celestial-library/artwork/book-3v.svg":"cd4f7b80fab3fa7d",
 "content/themes/celestial-library/artwork/book-l3-bl.svg":"e42ea47cbd9815c6",
 "content/themes/celestial-library/artwork/book-l3-br.svg":"5e0f8e9ea041666d",
 "content/themes/celestial-library/artwork/book-l3-tl.svg":"bad6a098e63f4b02",
 "content/themes/celestial-library/artwork/book-l3-tr.svg":"35504f6f3f19a903",
 "content/themes/celestial-library/artwork/book-single-blue.svg":"0cf7d9d90e0e0814",
 "content/themes/celestial-library/artwork/book-single-green.svg":"13528cc5cb07c1f4",
 "content/themes/celestial-library/artwork/book-single-red.svg":"82d67b24507842a9",
 "content/themes/celestial-library/artwork/book-single.svg":"27ca007e9c74697f",
 "content/themes/celestial-library/artwork/cell-constellation.svg":"7d168866c965d846",
 "content/themes/celestial-library/artwork/cell-moon.svg":"3634e4dc888454f7",
 "content/themes/celestial-library/artwork/cell-rosette.svg":"affec3ba3724ad84",
 "content/themes/celestial-library/artwork/cell-star.svg":"806070359ad6fb4a",
 "content/themes/celestial-library/artwork/codex-2h.svg":"dc2def657563a8ca",
 "content/themes/celestial-library/artwork/codex-2v.svg":"2ce89d3ed33b0f25",
 "content/themes/celestial-library/artwork/codex-3h.svg":"74dae37c3126cdda",
 "content/themes/celestial-library/artwork/codex-3v.svg":"5c3cd8901ae54e18",
 "content/themes/celestial-library/artwork/codex-l3-bl.svg":"a6e64af4584e050d",
 "content/themes/celestial-library/artwork/codex-l3-br.svg":"5d0a188bc7d525c0",
 "content/themes/celestial-library/artwork/codex-l3-tl.svg":"1cc4ff552aa4e908",
 "content/themes/celestial-library/artwork/codex-l3-tr.svg":"511ce1028ad69d5a",
 "content/themes/celestial-library/artwork/control-down.svg":"a4d8455c16269c39",
 "content/themes/celestial-library/artwork/control-left.svg":"6f1a43b79e471aca",
 "content/themes/celestial-library/artwork/control-right.svg":"6e1326e4ae46faf5",
 "content/themes/celestial-library/artwork/control-up.svg":"b243df1704e38444",
 "content/themes/celestial-library/artwork/control-zone-down.svg":"a35006d712ae069d",
 "content/themes/celestial-library/artwork/control-zone-left.svg":"cae27964c133f95f",
 "content/themes/celestial-library/artwork/control-zone-right.svg":"1405454b88b9f3f6",
 "content/themes/celestial-library/artwork/control-zone-up.svg":"afafed379c521e8b",
 "content/themes/celestial-library/artwork/exit-down.svg":"7e43667d6c31484f",
 "content/themes/celestial-library/artwork/exit-left.svg":"accc98b2e79a36be",
 "content/themes/celestial-library/artwork/exit-right.svg":"778af731d74cb80d",
 "content/themes/celestial-library/artwork/exit-up.svg":"f0dea8d79fe3f4ba",
 "content/themes/celestial-library/artwork/header-frame.svg":"9a6b117ec2ebcb7d",
 "content/themes/celestial-library/artwork/hf-atlas.webp":"b2efba543f540264",
 "content/themes/celestial-library/artwork/hud-frame.svg":"7549b67f4bc72364",
 "content/themes/celestial-library/artwork/scene-lighting.svg":"e987fc7791152a9c",
 "content/themes/celestial-library/artwork/victory-frame.svg":"a962828ecf02bd62",
 "content/themes/celestial-library/artwork/wall.svg":"0ff13553a06dff08",
 "content/themes/celestial-library/celestial-ornament.svg":"31c2c1440185bf7d",
 "content/themes/celestial-library/constellation-tile.svg":"d68e94940f26e761",
 "content/themes/celestial-library/high-fidelity-qa.json":"841856c0d39c2726",
 "content/themes/celestial-library/library-scene.svg":"6e74ff3f95c71b97",
 "content/themes/celestial-library/preview.css":"7f6d1dd13b87e05f",
 "content/themes/celestial-library/theme.css":"6530c835a65ec350",
 "content/themes/celestial-library/theme.json":"c60ad7f307d8912d",
 "content/themes/classic/theme.css":"fe4aa23b204c0335",
 "content/themes/classic/theme.json":"8da2cf34e38fe198",
 "content/themes/clockwork-sanctum/preview.css":"4bdfbe87fc1c59c3",
 "content/themes/clockwork-sanctum/theme.css":"928c739a6c64ce2c",
 "content/themes/clockwork-sanctum/theme.json":"aab506ee68597947",
 "content/themes/cybergrid/theme.css":"48b8d31b6544a5b3",
 "content/themes/cybergrid/theme.json":"ef7bf98039660967",
 "content/themes/ghost-manor/preview.css":"8ac5c6d1afa2d882",
 "content/themes/ghost-manor/theme.css":"b02e32f9201c873e",
 "content/themes/ghost-manor/theme.json":"69704b54c8730e4e",
 "content/themes/ice-cavern/theme.css":"101814a4f62a8d47",
 "content/themes/ice-cavern/theme.json":"e001e5b6cd30d5c7",
 "content/themes/index.json":"e5a660f0552535e0",
 "content/themes/microchip-lab/theme.css":"fb8c7fdd75da8004",
 "content/themes/microchip-lab/theme.json":"11b8838c07fac418",
 "content/themes/mine/theme.css":"5f4dc4bcc1ff270a",
 "content/themes/mine/theme.json":"89a17fafc88ce45e",
 "content/themes/moonlit-zen/theme.css":"1688d5ab8d28f36f",
 "content/themes/moonlit-zen/theme.json":"9276bc9ce8835004",
 "content/themes/neon-noir/preview.css":"9d010914d29e4d64",
 "content/themes/neon-noir/theme.css":"2eca485dc1c3a6bf",
 "content/themes/neon-noir/theme.json":"ac8e7764e8ae19b9",
 "content/themes/orbital-breach/preview.css":"83162b91c7ce574a",
 "content/themes/orbital-breach/theme.css":"adb335925c67c567",
 "content/themes/orbital-breach/theme.json":"ca8cd5ca54abf27c",
 "content/themes/pirate-ship/theme.css":"5da492fd0986d10b",
 "content/themes/pirate-ship/theme.json":"b9820f1e030f8085",
 "content/themes/space-station/theme.css":"69df9b88420f1317",
 "content/themes/space-station/theme.json":"e00ed75cfd3b61a2",
 "content/themes/sunlit-greenhouse/glass-leaves.svg":"66c8edf072a1e7a3",
 "content/themes/sunlit-greenhouse/greenhouse-scene-v2.webp":"aaf0a3395a99fa2c",
 "content/themes/sunlit-greenhouse/planter-2h.svg":"cbe874f065680da5",
 "content/themes/sunlit-greenhouse/planter-2v.svg":"f50cc4b7b1e5b2f2",
 "content/themes/sunlit-greenhouse/planter-3h.svg":"c070d0f64a217d53",
 "content/themes/sunlit-greenhouse/planter-3v.svg":"72ed99ee336ea37d",
 "content/themes/sunlit-greenhouse/planter-l3-bl.svg":"ea60a63cf93b48a5",
 "content/themes/sunlit-greenhouse/planter-l3-br.svg":"50a585c966b0ebdd",
 "content/themes/sunlit-greenhouse/planter-l3-tl.svg":"4f037f97f0711b77",
 "content/themes/sunlit-greenhouse/planter-l3-tr.svg":"eca890f43b046546",
 "content/themes/sunlit-greenhouse/planter-v3.webp":"a628b6490c5db0de",
 "content/themes/sunlit-greenhouse/theme.css":"653513049bfda3ac",
 "content/themes/sunlit-greenhouse/theme.json":"fce6be8cccd2a823",
 "content/themes/traffic-rescue/preview.css":"9a67c1d1e8f6aa89",
 "content/themes/traffic-rescue/theme.css":"8536fac5e660852c",
 "content/themes/traffic-rescue/theme.json":"d49d9529b090dc50",
 "css/adaptive-difficulty.css":"469adb7a9955d9e8",
 "css/game-ui-theme.css":"a6a3285c0f3a5419",
 "css/game.css":"0db0a5a43e5b849e",
 "css/pad-layout.css":"50ec72a892c15cf2",
 "css/theme-rotation.css":"def2db540ed00d33",
 "favicon.ico":"05e52b3fb2731903",
 "favicon.svg":"8e38574db40bbc04",
 "icons/icon-192.png":"5cda1ba56fc41ab4",
 "icons/icon-512.png":"b620721ccaed19db",
 "icons/icon-maskable-512.png":"bcb872f5afc2ec2a",
 "index.html":"ea86b4f77f6a15b0",
 "js/adaptive-difficulty.js":"0dcba0775ec3c68c",
 "js/audio.js":"36efd7558932a275",
 "js/freeze-solver-v1.js":"c661547bc2adafe6",
 "js/freeze-solver-v2.js":"77add78d9b0edc3c",
 "js/game-core.js":"19b14a6d8143e1d6",
 "js/generated-test-library.js":"03df12c8612af279",
 "js/i18n.js":"7d8ce9948fc9b6e9",
 "js/level-library.js":"a38d55e240943391",
 "js/level-pool.js":"f7030095b24819ab",
 "js/main.js":"c533969c97920aae",
 "js/motion-gesture.js":"113e2d1cb3493d28",
 "js/motion-model.js":"f6426535a0f06add",
 "js/motion-tilt-v2.js":"5ab4812c48b29b26",
 "js/multiball-library.js":"064e8bdc1a054c53",
 "js/pad-layout.js":"a888cc511165b804",
 "js/pwa.js":"367f286c8a81fb47",
 "js/rigid-shapes.js":"394c76262892576a",
 "js/scenario-loader.js":"9841b81c186b56de",
 "js/scene-renderer.js":"6ea1275e5a2ceee7",
 "js/solver.js":"0abcec566a0580e6",
 "js/theme-assets.js":"e923b7e662057848",
 "js/theme-autotile.js":"cd55b015d34cea12",
 "js/theme-frame.js":"78e42e4057e973c5",
 "js/theme-layout.js":"514b2d4a2a407b8a",
 "js/theme-rotation.js":"84ac322935b95cec",
 "js/theme-visuals.js":"0a52bc9054c5c4a1",
 "js/touch-swipe.js":"8862d77ada086ba5",
 "js/ui-shell.js":"76fc2cf335a6386d",
 "locales/en.json":"6e229d2c86ee625d",
 "locales/hu.json":"b1aab8932576419a",
 "locales/index.json":"86ba7935b55f64cb",
 "manifest.webmanifest":"25458bfde68f0d62"
};
/* PWA-ASSETS:END */
const CACHE='ggrid-assets';
const scopePath=new URL(self.registration.scope).pathname;
const keyOf=(file,hash)=>new URL(file,self.registration.scope).href+'?h='+hash;
async function sha(buf){const d=await crypto.subtle.digest('SHA-256',buf);return [...new Uint8Array(d)].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('')}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const missing=[];
  for(const [file,hash] of Object.entries(ASSETS))if(!await cache.match(keyOf(file,hash)))missing.push([file,hash]);
  // a few parallel downloads, each verified against the release hash
  const queue=[...missing];
  const worker=async()=>{for(let item=queue.shift();item;item=queue.shift()){
   const [file,hash]=item,res=await fetch(new URL(file,self.registration.scope).href,{cache:'reload'});
   if(!res.ok)throw Error(`${file}: HTTP ${res.status}`);
   const body=await res.clone().arrayBuffer();
   if(await sha(body)!==hash)throw Error(`${file}: content does not match release ${VERSION} (deploy still in progress?)`);
   await cache.put(keyOf(file,hash),res);
  }};
  await Promise.all(Array.from({length:6},worker));
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keep=new Set(Object.entries(ASSETS).map(([f,h])=>keyOf(f,h))),cache=await caches.open(CACHE);
  for(const req of await cache.keys())if(!keep.has(req.url))await cache.delete(req);
  for(const name of await caches.keys())if(name!==CACHE)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
 else if(event.data?.type==='VERSION')event.source?.postMessage({type:'VERSION',version:VERSION});
});
function assetFor(url){
 if(url.origin!==self.location.origin||!url.pathname.startsWith(scopePath))return null;
 let file=decodeURIComponent(url.pathname.slice(scopePath.length));
 if(file===''||file.endsWith('/'))file+='index.html';
 return ASSETS[file]?file:null;
}
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const file=assetFor(new URL(req.url));if(!file)return;
 event.respondWith((async()=>{
  const hit=await caches.match(keyOf(file,ASSETS[file]),{cacheName:CACHE});
  return hit||fetch(req);
 })());
});
