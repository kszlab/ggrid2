/* GGrid Pad Layout v1 – controller-style game screen.
   Top: menu · moves/par · level · score. Board in the middle.
   Bottom: labelled ability buttons (left), a large D-pad (centre), level
   actions (right). Uses the existing buttons (same ids, same listeners): they
   are only moved between containers, so every game rule stays in main.js.
   Works with every theme; painted artwork themes lose their painted arrow bands
   while the pad is on (the setting switches back to the classic layout).
   v0.15.72: three layouts – 'pad' (arrows under the board), 'classic' (arrows on the
   board edges) and 'compact' (no arrows: the six buttons in one row under the board;
   moves by swipe, keyboard or tilt – swipe is forced on, mouse drag counts as a swipe). */
const PadLayout=(()=>{
 const KEY='ggrid.ui.layout.v1';
 // [id, label, short label for narrow phones]
 const LEFT=[['freeze','Freeze','Freeze'],['bomb','BOMB','BOMB'],['playHint',I18n.t('pad.hint'),I18n.t('pad.hintShort')]];
 const RIGHT=[['playRestart',I18n.t('pad.restart'),I18n.t('pad.restartShort')],['playNext',I18n.t('pad.next'),I18n.t('pad.next')],['playChoose',I18n.t('pad.choose'),I18n.t('pad.chooseShort')]];
 const $=s=>document.querySelector(s);
 const top=$('#padTop'),deck=$('#padDeck'),picker=$('#layoutPicker');
 const movesEl=$('#padMoves'),parEl=$('#padPar'),levelEl=$('#padLevel');
 const MODES=['pad','classic','compact'];
 let mode='pad',active=false;const homes=new Map();
 try{const v=localStorage.getItem(KEY);if(MODES.includes(v))mode=v}catch(_){}
 function remember(el){if(el&&!homes.has(el)){const mark=document.createComment('pad-home:'+el.id);el.parentNode.insertBefore(mark,el);homes.set(el,mark)}}
 function moveTo(el,parent){if(!el||!parent)return;remember(el);parent.append(el)}
 function restore(el){const mark=homes.get(el);if(el&&mark&&mark.parentNode)mark.parentNode.insertBefore(el,mark.nextSibling)}
 function label(el,text,on,short=text){if(!el)return;let l=el.querySelector(':scope>.pad-label');
  if(on&&!l){
   // Wrap the existing glyph so the label can sit under it.
   const ico=document.createElement('span');ico.className='pad-ico';ico.setAttribute('aria-hidden','true');
   while(el.firstChild)ico.append(el.firstChild);el.append(ico);
   l=document.createElement('span');l.className='pad-label';l.innerHTML='<span class="pad-long"></span><span class="pad-short"></span>';l.firstChild.textContent=text;l.lastChild.textContent=short;el.append(l)}
  if(!on&&l){l.remove();const ico=el.querySelector(':scope>.pad-ico');if(ico){while(ico.firstChild)el.insertBefore(ico.firstChild,ico);ico.remove()}}
 }
 function apply(m){
  const compact=m==='compact';
  if(document.body.classList.contains('layout-compact')!==compact){
   document.body.classList.toggle('layout-compact',compact);
   if(typeof TouchSwipe!=='undefined')TouchSwipe.setLocked(compact);
   requestAnimationFrame(()=>dispatchEvent(new Event('resize')));
  }
  const on=m!=='classic';
  if(on===active)return;active=on;
  document.body.classList.toggle('layout-pad',on);top.hidden=!on;deck.hidden=!on;
  const left=deck.querySelector('.pad-left'),right=deck.querySelector('.pad-right');
  for(const [id,text,short] of LEFT){const el=document.getElementById(id);if(on)moveTo(el,left);else restore(el);label(el,text,on,short)}
  for(const [id,text,short] of RIGHT){const el=document.getElementById(id);if(on)moveTo(el,right);else restore(el);label(el,text,on,short)}
  const menu=$('#gameMenu'),score=$('#scoreBox');
  if(on){moveTo(menu,top.querySelector('.pad-top-menu'));moveTo(score,top.querySelector('.pad-score-slot'));label(menu,I18n.t('top.menu'),true)}
  else{label(menu,'',false);restore(menu);restore(score)}
  // Board and artwork geometry depend on the space around them.
  requestAnimationFrame(()=>{try{if(typeof SceneRenderer!=='undefined')SceneRenderer.refreshArtworkLayout?.()}catch(_){}dispatchEvent(new Event('resize'))});
 }
 function sync(){
  apply(mode);
  if(!active||typeof state==='undefined'||!state)return;
  movesEl.textContent=String(state.moves||0);
  const bombed=typeof bombUsedThisRun!=='undefined'&&bombUsedThisRun;
  const par=!bombed&&(typeof optimal!=='undefined'&&optimal&&optimal.length)?optimal.length:null;
  parEl.textContent=par==null?'–':String(par);
  movesEl.parentElement.classList.toggle('over-par',par!=null&&state.moves>par);
  const diff=(typeof difficultyEl!=='undefined'&&difficultyEl?.value)?'D'+difficultyEl.value:'';
  // Two-ball levels are scored since v0.15.63; the ball count moved next to the level.
  const multi=typeof inMultiBallTest==='function'&&inMultiBallTest();
  // The two-ball mark sits in the small label: the value line stays short enough for narrow phones.
  levelEl.textContent=[diff,`${state.width}×${state.height}`].filter(Boolean).join(' · ');
  const levelLabel=$('#padLevelLabel');if(levelLabel)levelLabel.textContent=I18n.t(multi?'top.levelTwoBall':'top.level');
  levelEl.title=(typeof currentLevelId!=='undefined'&&currentLevelId)||'';

 }
 function paintPicker(){picker?.querySelectorAll('button[data-layout]').forEach(b=>{const on=b.dataset.layout===mode;b.classList.toggle('active',on);b.setAttribute('aria-checked',String(on))})}
 function setMode(m){if(!MODES.includes(m))return;mode=m;try{localStorage.setItem(KEY,m)}catch(_){}paintPicker();sync()}
 // Kept for callers of the old two-state API: true = arrows under the board.
 function setWanted(v){setMode(v?'pad':'classic')}
 picker?.addEventListener('click',e=>{const b=e.target.closest('button[data-layout]');if(b)setMode(b.dataset.layout)});
 paintPicker();
 // Keep in sync with every board render and theme change without touching the game loop:
 // render() is a global function of main.js, so wrapping it updates every caller.
 if(typeof window.render==='function'&&!window.render.__pad){const base=window.render;const wrapped=function(...a){const r=base.apply(this,a);try{sync()}catch(_){}return r};wrapped.__pad=true;window.render=wrapped}
 const board=$('#board');if(board)new MutationObserver(()=>sync()).observe(board,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
 new MutationObserver(()=>sync()).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
 sync();
 return{sync,setMode,setWanted,get mode(){return mode},get active(){return active},get wanted(){return mode!=='classic'}};
})();
