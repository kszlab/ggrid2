/* GGrid v0.15.60 – swipe (gesture) control on the game area.
   One swipe over the board frame = one arrow command, fired as soon as the
   finger has travelled far enough in one clear direction. Taps are untouched,
   so Freeze target selection by tapping a piece keeps working. While enabled,
   the browser's own gestures (scroll, zoom, pull-to-refresh) are blocked on
   the game area. Only offered on touch devices; on by default there. */
const TouchSwipe=(()=>{
 const KEY='ggrid.gesture.v1',THRESHOLD=28,DOMINANCE=1.5,MOVED=10,BUFFER_MS=650;
 const wrap=document.querySelector('.board-wrap'),toggle=document.querySelector('#gestureControl'),availability=document.querySelector('#gestureAvailability');
 const touchDevice=(navigator.maxTouchPoints||0)>0||matchMedia('(pointer: coarse)').matches;
 let enabled=touchDevice;
 try{const v=localStorage.getItem(KEY);if(v!=null)enabled=touchDevice&&v==='on'}catch(_){}
 let track=null,suppressClickUntil=0,pending=null,pendingTimer=null;

 function sync(){
  document.body.classList.toggle('gesture-control',enabled);
  if(toggle){toggle.checked=enabled;toggle.disabled=!touchDevice}
  if(availability)availability.textContent=touchDevice?'Simítás a játéktéren: egy simítás, egy lépés':'Csak érintőképernyős eszközön érhető el';
 }
 function set(v){enabled=touchDevice&&v;try{localStorage.setItem(KEY,enabled?'on':'off')}catch(_){}sync()}
 // Same conditions as tilt control: only on the running game, never under a panel.
 function gameReady(){
  if(!enabled||document.body.dataset.uiContext!=='game'||!state||state.won)return false;
  return ['settingsPanel','gameMenuPanel','helpPanel','freePlaySetup','calibration','scenarioPanel'].every(id=>{const el=document.getElementById(id);return !el||el.hidden});
 }
 function play(dir){setBoardTilt(dir,true);move(dir);setTimeout(()=>setBoardTilt(null,false),180)}
 // A swipe during a move animation is kept (newest only) and played when the board is free.
 function flush(){
  pendingTimer=null;if(!pending)return;
  if(!gameReady()){pending=null;return}
  if(busy||autoSolveActive){if(performance.now()-pending.t<BUFFER_MS)pendingTimer=setTimeout(flush,25);else pending=null;return}
  const d=pending.dir;pending=null;play(d);
 }
 function fire(dir){
  if(busy||autoSolveActive){pending={dir,t:performance.now()};if(!pendingTimer)pendingTimer=setTimeout(flush,25);return}
  play(dir);
 }
 function ignoredTarget(t){return !!t.closest?.('.victory-overlay,.edge-control')}
 wrap?.addEventListener('pointerdown',e=>{
  if(track||e.pointerType==='mouse'||!gameReady()||ignoredTarget(e.target))return;
  track={id:e.pointerId,x:e.clientX,y:e.clientY,fired:false,moved:false};
 });
 // Listen on window: pointer capture would retarget the click away from a tapped piece.
 addEventListener('pointermove',e=>{
  if(!track||e.pointerId!==track.id)return;
  const dx=e.clientX-track.x,dy=e.clientY-track.y,ax=Math.abs(dx),ay=Math.abs(dy);
  if(Math.max(ax,ay)>MOVED)track.moved=true;
  if(track.fired||Math.max(ax,ay)<THRESHOLD)return;
  if(ax>=ay*DOMINANCE)track.fired='x';else if(ay>=ax*DOMINANCE)track.fired='y';else return;
  if(gameReady())fire(track.fired==='x'?(dx>0?'right':'left'):(dy>0?'down':'up'));
 },{passive:true});
 function end(e){if(!track||e.pointerId!==track.id)return;if(track.moved)suppressClickUntil=performance.now()+400;track=null}
 addEventListener('pointerup',end,{passive:true});addEventListener('pointercancel',end,{passive:true});
 // A swipe that started on a piece must not also select it as a Freeze target.
 wrap?.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}},true);
 // iOS Safari fallback for touch-action: no page scroll or pinch zoom on the game area.
 wrap?.addEventListener('touchmove',e=>{if(enabled&&document.body.dataset.uiContext==='game')e.preventDefault()},{passive:false});
 wrap?.addEventListener('gesturestart',e=>{if(enabled)e.preventDefault()});
 toggle?.addEventListener('change',()=>set(toggle.checked));
 sync();
 return{get enabled(){return enabled},touchDevice,set};
})();
