/* GGrid rigid-body shape classifier.
   Shape IDs are orientation-specific and stable across themes.
   Unknown shapes receive a deterministic generic ID so future level generators
   can introduce new geometry without breaking rendering. */
const RigidShapes=(()=>{
 const aliases=new Map([
  ['0,0;1,0','2H'],
  ['0,0;0,1','2V'],
  ['0,0;1,0;2,0','3H'],
  ['0,0;0,1;0,2','3V'],
  ['0,0;1,0;0,1','L3-TL'],
  ['0,0;1,0;1,1','L3-TR'],
  ['0,0;0,1;1,1','L3-BL'],
  ['1,0;0,1;1,1','L3-BR']
 ]);
 function normalize(cells=[]){
  if(!cells.length)return[];
  const pts=cells.map(c=>({x:Number(c.x)||0,y:Number(c.y)||0}));
  const minX=Math.min(...pts.map(p=>p.x)),minY=Math.min(...pts.map(p=>p.y));
  return pts.map(p=>({x:p.x-minX,y:p.y-minY})).sort((a,b)=>a.y-b.y||a.x-b.x);
 }
 function signature(cells=[]){return normalize(cells).map(p=>p.x+','+p.y).join(';')}
 function bounds(cells=[]){
  const pts=normalize(cells);
  if(!pts.length)return{width:0,height:0,count:0};
  return{width:Math.max(...pts.map(p=>p.x))+1,height:Math.max(...pts.map(p=>p.y))+1,count:pts.length};
 }
 function identify(cells=[]){
  const pts=normalize(cells),sig=pts.map(p=>p.x+','+p.y).join(';'),known=aliases.get(sig);
  if(known)return known;
  const b=bounds(pts),set=new Set(pts.map(p=>p.x+','+p.y));
  let bits='';
  for(let y=0;y<b.height;y++)for(let x=0;x<b.width;x++)bits+=set.has(x+','+y)?'1':'0';
  return 'P'+b.count+'-'+b.width+'x'+b.height+'-'+bits;
 }
 function isRectangular(cells=[]){
  const b=bounds(cells);return b.count>0&&b.count===b.width*b.height;
 }
 const clips={
  'L3-TL':'polygon(0 0,100% 0,100% 50%,50% 50%,50% 100%,0 100%)',
  'L3-TR':'polygon(0 0,100% 0,100% 100%,50% 100%,50% 50%,0 50%)',
  'L3-BL':'polygon(0 0,50% 0,50% 50%,100% 50%,100% 100%,0 100%)',
  'L3-BR':'polygon(50% 0,100% 0,100% 100%,0 100%,0 50%,50% 50%)'
 };
 function cssClass(id=''){return 'sr-shape-'+String(id).toLowerCase().replace(/[^a-z0-9_-]+/g,'-')}
 function clipPath(id=''){return clips[id]||''}
 /* How a multi-cell rigid body is drawn in a theme:
    tiles | silhouette – painted material from artwork.pieces.rigidTiles;
    shape     – the theme's own picture for this exact shape (renderer.rigid:'shape');
    composite – one generic rigidBody element over the whole (rectangular) body;
    cells     – every cell drawn on its own with the single-brick look.
    For shape/composite the cells underneath are hidden, so the overlay must be
    drawable: in a painted (artwork) theme that means it needs an image, because
    CSS-markup parts render empty there. Otherwise fall back to cells, so a body
    can never become invisible. */
 function renderPlan(theme,cells,{tiles=false,artwork=false}={}){
  const art=theme?.artwork?.pieces||{},base=art.rigidBody||theme?.pieces?.rigidBody||null;
  const variants=art.rigidShapes||art.rigidBodyVariants||theme?.pieces?.rigidBodyVariants||{};
  const shapeId=identify(cells),variant=variants[shapeId]||null,mode=theme?.renderer?.rigid||'material';
  const drawable=s=>!!s&&(!artwork||!!s.asset);
  if(mode==='tiles'&&tiles)return{mode:'tiles',shapeId,spec:null,variant};
  if(mode==='material'&&tiles)return{mode:'silhouette',shapeId,spec:null,variant};
  if(mode==='shape'&&drawable(variant))return{mode:'shape',shapeId,spec:variant,variant};
  if(isRectangular(cells)&&drawable(base))return{mode:'composite',shapeId,spec:base,variant};
  return{mode:'cells',shapeId,spec:null,variant};
 }
 return{normalize,signature,bounds,identify,isRectangular,cssClass,clipPath,renderPlan};
})();
if(typeof globalThis!=='undefined')globalThis.RigidShapes=RigidShapes;
if(typeof module!=='undefined'&&module.exports)module.exports=RigidShapes;
