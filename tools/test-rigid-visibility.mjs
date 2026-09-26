// Every multi-cell rigid body that occurs in a level must stay visible in every theme:
// if the renderer hides its cells (shape/composite), the overlay must be drawable –
// in a painted (artwork) theme that means an image asset. Regression test for the
// invisible Celestial Library codices (v0.15.53–v0.15.65).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import RigidShapes from '../js/rigid-shapes.js';
import ThemeAssets from '../js/theme-assets.js';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const shapes=new Map();
for(const cat of ['content/levels/catalog.json','content/levels/multiball/catalog.json','content/levels/generated-test/catalog.json']){
 for(const p of read(cat).packs||[])for(const l of read(path.join(path.dirname(cat),p.src)).levels||[])for(const e of l.entities||[]){
  const cells=e.properties?.cells||[];if(e.type!=='rigid-body'||cells.length<2)continue;
  const id=RigidShapes.identify(cells);if(!shapes.has(id))shapes.set(id,cells);
 }
}
assert.ok(shapes.size>0,'no multi-cell rigid bodies found');
const index=read('content/themes/index.json'),report={};
for(const entry of index.themes){
 const theme=read(path.join('content/themes',entry.src)),artwork=ThemeAssets.renderMode(theme)==='artwork';
 const tiles=!!(theme.artwork?.pieces?.rigidTiles?.ring&&theme.artwork?.pieces?.rigidTiles?.block);
 const modes={};
 for(const [id,cells] of shapes){
  const plan=RigidShapes.renderPlan(theme,cells,{tiles,artwork});
  if(plan.mode==='shape'||plan.mode==='composite'){
   assert.ok(plan.spec,`${entry.id} ${id}: hidden cells without overlay spec`);
   if(artwork)assert.ok(plan.spec.asset,`${entry.id} ${id}: artwork overlay without image`);
  }
  modes[plan.mode]=(modes[plan.mode]||0)+1;
 }
 report[entry.id]=modes;
}
// The painted theme must use its own codex pictures for the shapes it has.
const cl=read('content/themes/celestial-library/theme.json');
for(const id of Object.keys(cl.artwork.pieces.rigidShapes))assert.equal(RigidShapes.renderPlan(cl,shapes.get(id)||[],{artwork:true}).mode,'shape','celestial-library '+id);
console.log(JSON.stringify({rigidVisibility:'passed',shapes:shapes.size,themes:Object.keys(report).length,celestial:report['celestial-library']}));
