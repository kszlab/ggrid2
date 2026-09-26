/* GGrid Pad Layout v1 – controller-style game screen.
   Top: menu · moves/par · level · score. Board in the middle.
   Bottom: labelled ability buttons (left), a large D-pad (centre), level
   actions (right). Uses the existing buttons (same ids, same listeners): they
   are only moved between containers, so every game rule stays in main.js.
   Works with every theme; painted artwork themes lose their painted arrow bands
   while the pad is on (the setting switches back to the classic layout). */
const PadLayout=(()=>{
 const KEY='ggrid.ui.layout.v1';
 // [id, label, short label for narrow phones]
 const LEFT=[['freeze','Freeze','Freeze'],['playHint','Segítség','Súgó']];
 const RIGHT=[['playRestart','Újraindítás','Újra'],['playNext','Új pálya','Új pálya'],['playChoose','Pályaválasztó','Pályák']];
 const $=s=>document.querySelector(s);
 const top=$('#padTop'),deck=$('#padDeck'),sw=$('#padLayoutSwitch');
 const movesEl=$('#padMoves'),parEl=$('#padPar'),levelEl=$('#padLevel');
 let wanted=true,active=false;const homes=new Map();
 try{wanted=localStorage.getItem(KEY)!=='classic'}catch(_){}
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
 function apply(on){
  if(on===active)return;active=on;
  document.body.classList.toggle('layout-pad',on);top.hidden=!on;deck.hidden=!on;
  const left=deck.querySelector('.pad-left'),right=deck.querySelector('.pad-right');
  for(const [id,text,short] of LEFT){const el=document.getElementById(id);if(on)moveTo(el,left);else restore(el);label(el,text,on,short)}
  for(const [id,text,short] of RIGHT){const el=document.getElementById(id);if(on)moveTo(el,right);else restore(el);label(el,text,on,short)}
  const menu=$('#gameMenu'),score=$('#scoreBox');
  if(on){moveTo(menu,top.querySelector('.pad-top-menu'));moveTo(score,top.querySelector('.pad-score-slot'));label(menu,'Menü',true)}
  else{label(menu,'',false);restore(menu);restore(score)}
  // Board and artwork geometry depend on the space around them.
  requestAnimationFrame(()=>{try{if(typeof SceneRenderer!=='undefined')SceneRenderer.refreshArtworkLayout?.()}catch(_){}dispatchEvent(new Event('resize'))});
 }
 function sync(){
  apply(wanted);
  if(!active||typeof state==='undefined'||!state)return;
  movesEl.textContent=String(state.moves||0);
  const par=(typeof optimal!=='undefined'&&optimal&&optimal.length)?optimal.length:null;
  parEl.textContent=par==null?'–':String(par);
  movesEl.parentElement.classList.toggle('over-par',par!=null&&state.moves>par);
  const diff=(typeof difficultyEl!=='undefined'&&difficultyEl?.value)?'D'+difficultyEl.value:'';
  // Two-ball levels are scored since v0.15.63; the ball count moved next to the level.
  const multi=typeof inMultiBallTest==='function'&&inMultiBallTest();
  // The two-ball mark sits in the small label: the value line stays short enough for narrow phones.
  levelEl.textContent=[diff,`${state.width}×${state.height}`].filter(Boolean).join(' · ');
  const levelLabel=$('#padLevelLabel');if(levelLabel)levelLabel.textContent=multi?'Pálya · ●●':'Pálya';
  levelEl.title=(typeof currentLevelId!=='undefined'&&currentLevelId)||'';

 }
 function setWanted(v){wanted=v;try{localStorage.setItem(KEY,v?'pad':'classic')}catch(_){}sw?.setAttribute('aria-checked',String(v));sync()}
 sw?.setAttribute('aria-checked',String(wanted));
 sw?.addEventListener('click',()=>setWanted(!wanted));
 // Keep in sync with every board render and theme change without touching the game loop:
 // render() is a global function of main.js, so wrapping it updates every caller.
 if(typeof window.render==='function'&&!window.render.__pad){const base=window.render;const wrapped=function(...a){const r=base.apply(this,a);try{sync()}catch(_){}return r};wrapped.__pad=true;window.render=wrapped}
 const board=$('#board');if(board)new MutationObserver(()=>sync()).observe(board,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
 new MutationObserver(()=>sync()).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
 sync();
 return{sync,setWanted,get active(){return active},get wanted(){return wanted}};
})();
