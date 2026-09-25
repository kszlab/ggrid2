/* GGrid v0.15.58 – unified free-play level pool.
   One "Játék indítása" draws from every level library (core single-ball,
   two-ball and generator-verified packs) inside a size set and a D range.
   The chosen range is remembered per browser. */
const LevelPool=(()=>{
 const KEY='ggrid.freeplay.range.v1';
 const SIZES=['3','4','5','5x6','5x7','5x8'];
 const dims=v=>{v=String(v);if(v.includes('x')){const [w,h]=v.split('x').map(Number);return{w,h}}return{w:+v,h:+v}};
 const sizeValue=(w,h)=>w===h?String(w):`${w}x${h}`;
 let range={sizes:['4'],min:3,max:6};
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');
  if(s&&Array.isArray(s.sizes)){const sizes=s.sizes.filter(x=>SIZES.includes(x));if(sizes.length)range.sizes=sizes}
  if(s&&Number.isInteger(s.min)&&Number.isInteger(s.max)&&s.min>=1&&s.max<=10&&s.min<=s.max){range.min=s.min;range.max=s.max}
 }catch(_){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(range))}catch(_){}}
 function setRange(next,persist=true){range={...range,...next};range.sizes=SIZES.filter(s=>range.sizes.includes(s));if(persist)save()}
 const sources=()=>[
  {id:'core',lib:typeof LevelLibrary!=='undefined'?LevelLibrary:null},
  {id:'multiball',lib:typeof MultiBallLibrary!=='undefined'?MultiBallLibrary:null},
  {id:'generated',lib:typeof GeneratedTestLibrary!=='undefined'?GeneratedTestLibrary:null}
 ].filter(s=>s.lib);
 async function init(){await Promise.all(sources().map(s=>s.lib.init()))}
 function candidates(sizes=range.sizes,min=range.min,max=range.max){
  const out=[],ids=new Set();
  for(const size of sizes){const {w,h}=dims(size);
   for(let d=min;d<=max;d++)for(const s of sources())for(const level of s.lib.candidates(w,h,d)){
    if(ids.has(level.levelId))continue;ids.add(level.levelId);
    out.push({source:s.id,lib:s.lib,level,balls:level._state.objects.filter(o=>o.type==='ball').length});
   }
  }
  return out;
 }
 function count(sizes,min,max){return candidates(sizes,min,max).length}
 function hasSize(size){const {w,h}=dims(size);for(let d=1;d<=10;d++)for(const s of sources())if(s.lib.candidates(w,h,d).length)return true;return false}
 // Random pick: levels not yet completed in this browser first, and never the
 // same level twice in a row while an alternative exists.
 const recent=[];
 function pick(isDone=()=>false){
  const all=candidates();if(!all.length)return null;
  const fresh=all.filter(c=>!recent.includes(c.level.levelId));
  const base=fresh.length?fresh:all.filter(c=>c.level.levelId!==recent[recent.length-1]);
  const open=base.filter(c=>!isDone(c.level.levelId));
  const pool=open.length?open:(base.length?base:all);
  const c=pool[Math.floor(Math.random()*pool.length)];
  recent.push(c.level.levelId);if(recent.length>Math.min(40,Math.floor(all.length/2)))recent.shift();
  return c;
 }
 return{init,candidates,count,pick,hasSize,setRange,sizeValue,dims,SIZES,get range(){return{...range,sizes:[...range.sizes]}}};
})();
