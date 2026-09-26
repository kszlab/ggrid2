/* GGrid v0.15.64 (events: v0.15.67) – adaptive difficulty for free play (self-contained, easy to remove).
   A player level ("szint", a continuous D value) per ball count follows the
   results: every finished level scores 0..1 (optimum/moves, −0.15 per step hint,
   0 after auto-solve; a level left after ≥5 moves counts as 0). The level moves
   Elo-style against the expected result for that D: up by at most ~0.4, down
   gently (~0.2 for a failure at the player's own level). LevelPool then draws
   the selected D classes weighted around "level + 0.5".
   Restart starts a fresh attempt on the same level (moves, hints and the
   "real attempt" flag reset); a level already counted is not counted twice.
   It listens to main.js GameEvents (v0.15.67; it used to wrap main.js functions).
   To remove it: delete this file, css/adaptive-difficulty.css, their tags in
   index.html and the weigher line in level-pool.js pick(). */
const AdaptiveDifficulty=(()=>{
 const KEY='ggrid.adaptive.v1',STRETCH=.5,SPREAD=.9,FLOOR=.03,UP=1.6,DOWN=.28,MAX_STEP=.5,HINT_COST=.15,ABANDON_MOVES=5;
 let data={enabled:true,ratings:{}};
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object'){data.enabled=s.enabled!==false;if(s.ratings&&typeof s.ratings==='object')data.ratings=s.ratings}}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(_){}};
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const minSelected=()=>Math.min(...(LevelPool?.range?.diffs||[1]));
 function rating(balls){const r=Number(data.ratings[balls]);return Number.isFinite(r)?r:minSelected()}
 function active(){return data.enabled&&(LevelPool?.range?.diffs?.length||0)>1}
 // Expected result on a level of class d for a player at level r: ~0.95 far below, 0.725 at r, 0.5 far above.
 const expected=(d,r)=>.5+.45/(1+Math.exp((d-r)/.9));

 // ---- selection weights (used by LevelPool.pick) ----
 // Each D class gets exp(-(d-target)²/2σ²) (+ a small floor), shared among its levels,
 // so the class mix follows the curve regardless of how many levels a class has.
 function weigher(cands){
  if(!active())return null;
  const perClass=new Map();for(const c of cands){const k=c.balls+'|'+c.level.analysis.testDifficultyClass;perClass.set(k,(perClass.get(k)||0)+1)}
  return c=>{const d=c.level.analysis.testDifficultyClass,t=rating(c.balls)+STRETCH;return(Math.exp(-((d-t)**2)/(2*SPREAD*SPREAD))+FLOOR)/perClass.get(c.balls+'|'+d)};
 }

 // ---- result tracking ----
 let cur=null,lastChange=null;
 function begin(g){
  const l=g?.level,d=l?.analysis?.testDifficultyClass;
  cur=Number.isInteger(d)?{id:g.code,d,balls:(g.state?.objects||[]).filter(o=>o.type==='ball').length||1,hints:0,attempted:false,done:false}:null;
 }
 function record(p){
  if(!cur||cur.done)return null;cur.done=true;
  if(!active())return null;
  const before=rating(cur.balls),delta=p-expected(cur.d,before);
  const after=clamp(before+clamp(delta*(delta>0?UP:DOWN),-MAX_STEP,MAX_STEP),1,10);
  data.ratings[cur.balls]=Math.round(after*100)/100;save();paint();
  return lastChange={balls:cur.balls,before,after:data.ratings[cur.balls]};
 }
 // A level left without winning counts as a failure only after a real attempt.
 // A bombed attempt never counts, neither as a win nor as a failure (v0.15.70).
 function finishOpen(){if(cur&&!cur.done&&!cur.bombed&&!state?.won&&(cur.attempted||solverUsedThisRun))record(0)}
 function freshAttempt(){if(cur){cur.hints=0;cur.attempted=false;cur.bombed=false}}
 const free=()=>!ScenarioMode?.active;
 GameEvents.on('level:leave',()=>{if(free())finishOpen()});
 GameEvents.on('level:start',({game})=>{if(free())begin(game);else cur=null});
 GameEvents.on('level:restart',freshAttempt);
 GameEvents.on('move',()=>{if(cur&&state&&state.moves>=ABANDON_MOVES)cur.attempted=true});
 GameEvents.on('hint',()=>{if(cur)cur.hints++});
 GameEvents.on('bomb',()=>{if(cur)cur.bombed=true});
 GameEvents.on('victory',({automatic,box})=>{
  if(!cur||cur.done||!free())return;
  if(cur.bombed){cur.done=true;return}
  const p=automatic||solverUsedThisRun?0:clamp(Math.max(1,optimal.length)/Math.max(1,state.moves,optimal.length)-HINT_COST*cur.hints,0,1);
  const ch=record(p);
  if(ch&&box){const n=document.createElement('div');n.className='adaptive-note';const f=x=>I18n.num(x,1);
   n.textContent=I18n.t('adaptive.change',{who:I18n.t(ch.balls===2?'adaptive.youTwoBall':'adaptive.you'),before:f(ch.before),after:f(ch.after),arrow:ch.after>ch.before+.005?'↑':ch.after<ch.before-.005?'↓':'→'});box.append(n)}
 });
 // ---- setup screen: switch, current levels, reset ----
 const summary=document.querySelector('#freeRangeSummary'),row=document.createElement('div');row.className='adaptive-row';
 row.innerHTML='<label class="adaptive-switch"><input type="checkbox" id="adaptiveToggle"> <span></span></label><span id="adaptiveLevel"></span><button type="button" id="adaptiveReset"></button>';
 row.querySelector('.adaptive-switch span').textContent=I18n.t('setup.adaptive');row.querySelector('#adaptiveReset').textContent=I18n.t('setup.adaptiveReset');
 summary?.after(row);
 const toggle=row.querySelector('#adaptiveToggle'),levelText=row.querySelector('#adaptiveLevel'),reset=row.querySelector('#adaptiveReset');
 function paint(){
  toggle.checked=data.enabled;const f=x=>I18n.num(x,1);
  const one=data.ratings[1]!=null?`D${f(+data.ratings[1])}`:'',two=data.ratings[2]!=null?`●● D${f(+data.ratings[2])}`:'';
  levelText.textContent=!data.enabled?'':(LevelPool?.range?.diffs?.length||0)<2?I18n.t('setup.adaptiveNeedsMore'):(one||two)?I18n.t('setup.adaptiveLevel',{levels:[one,two].filter(Boolean).join(' · ')}):I18n.t('setup.adaptiveStart',{d:minSelected()});
  reset.hidden=!data.enabled||(data.ratings[1]==null&&data.ratings[2]==null);
 }
 toggle.addEventListener('change',()=>{data.enabled=toggle.checked;save();paint()});
 reset.addEventListener('click',()=>{data.ratings={};save();paint()});
 document.querySelector('#quickDifficulty')?.addEventListener('click',()=>setTimeout(paint,0));
 document.querySelector('#homeFreePlay')?.addEventListener('click',()=>setTimeout(paint,50));
 document.querySelector('#playChoose')?.addEventListener('click',()=>setTimeout(paint,50));
 paint();
 return{weigher,rating,expected,paint,get active(){return active()},get lastChange(){return lastChange}};
})();
