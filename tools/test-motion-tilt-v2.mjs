// Synthetic regression test for Motion Tilt v2 (and a v1 reference run).
// Synthetic gestures are NOT a substitute for real recordings; use
// tools/replay-motion-gesture.js --engine v2 on GGrid-calibration-*.json for that.
import {createRequire} from 'module';
const require=createRequire(import.meta.url);
const {MotionTiltRecognizerV2}=require('../js/motion-tilt-v2.js');
require('../js/motion-model.js');
const {MotionGestureRecognizer,DEFAULT_PROFILE}=require('../js/motion-gesture.js');
const verbose=process.argv.includes('--verbose');

// Deterministic PRNG so the test is stable.
let seed=Number(process.env.SEED||12345);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const smooth=x=>x<=0?0:x>=1?1:.5-.5*Math.cos(Math.PI*x);

// A scenario is a list of angle keyframes per screen axis plus optional linear acceleration bumps.
// angle(t) returns {x,y} in degrees relative to the start pose.
function tilt(dir,amp,outMs,holdMs,backMs,cross=.2,start=300){
 const ax=dir==='left'||dir==='right'?'x':'y',s=dir==='right'||dir==='down'?1:-1,o=ax==='x'?'y':'x';
 return{expect:[dir],end:start+outMs+holdMs+backMs+500,angle:t=>{
  const u=t<start?0:t<start+outMs?smooth((t-start)/outMs):t<start+outMs+holdMs?1:1-smooth((t-start-outMs-holdMs)/backMs);
  return{[ax]:s*amp*u,[o]:cross*amp*u*Math.sin(t/90)}}}}
function seq(...parts){let off=0;const segs=parts.map(p=>{const s={...p,off};off+=p.end;return s});
 return{expect:parts.flatMap(p=>p.expect),end:off,angle:t=>{let a={x:0,y:0};for(const s of segs){if(t>=s.off){const v=s.angle(Math.min(t-s.off,s.end));a={x:a.x+(v.x||0),y:a.y+(v.y||0)}}}return a},accel:t=>{for(const s of segs)if(s.accel&&t>=s.off&&t<s.off+s.end)return s.accel(t-s.off);return null}}}
const lift=(up=true)=>({expect:[],end:1300,angle:t=>({x:1.5*Math.sin(t/70)*smooth((t-300)/200)*(1-smooth((t-800)/200)),y:2*Math.sin(t/110)*smooth((t-300)/200)*(1-smooth((t-800)/200))}),accel:t=>{const u=(t-300)/500;return u<0||u>1?null:{x:0,y:0,z:(up?1:-1)*3.2*Math.sin(2*Math.PI*u)}}});
const slowOutFastBack=dir=>{const ax=dir==='left'||dir==='right'?'x':'y',s=dir==='right'||dir==='down'?1:-1;
 // 26° over 1.1 s (≈13°/s, below every start rate), hold, then snap back in 180 ms: must produce nothing.
 return{expect:[],end:2600,angle:t=>{const u=t<200?0:t<1300?(t-200)/1100:t<1600?1:t<1780?1-smooth((t-1600)/180):0;return{[ax]:s*26*u}}}};
const wobble={expect:[],end:2000,angle:t=>({x:2.2*Math.sin(t/60)+1.4*Math.sin(t/23),y:2*Math.sin(t/75)})};

function stream(sc,hz,{noise=1.5,bias={x:.6,y:-.4},pose={beta:40,gamma:0}}={}){
 const out=[],dt=1000/hz;let prev=sc.angle(0),t0=1000;
 for(let t=0;t<=sc.end;t+=dt*(0.9+0.2*rnd())){
  const a=sc.angle(t),d=Math.max(1,t-(out.length?out[out.length-1].tt:0));
  const rx=((a.x||0)-(prev.x||0))*1000/d,ry=((a.y||0)-(prev.y||0))*1000/d;prev=a;
  const acc=sc.accel?.(t)||{x:.08*rx/50+.05*gauss(),y:.08*ry/50+.05*gauss(),z:.05*gauss()};
  // Fixed axis profile of this device family: screen x ← rotationRate.beta, y ← rotationRate.alpha; orientation x ← gamma, y ← beta.
  out.push({tt:t,t:t0+t,alpha:ry+bias.y+noise*gauss(),beta:rx+bias.x+noise*gauss(),gamma:noise*gauss(),ax:acc.x,ay:acc.y,az:acc.z,
   obeta:pose.beta+(a.y||0)+.3*gauss(),ogamma:pose.gamma+(a.x||0)+.3*gauss()});
 }
 return out;
}
function runV2(samples,opts){const got=[];const r=new MotionTiltRecognizerV2(opts,(d,k,i)=>got.push({d,lat:i.latencyMs}));for(const s of samples)r.motion(s,s.t,0);return got}
function runV1(samples){const got=[];const f=.40;const p={...DEFAULT_PROFILE,minimumRate:Math.max(25,DEFAULT_PROFILE.minimumRate*f),minimumExcursion:Math.max(2,DEFAULT_PROFILE.minimumExcursion*f),triggerRate:Math.max(20,DEFAULT_PROFILE.triggerRate*f),triggerAcceleration:Math.max(.7,DEFAULT_PROFILE.triggerAcceleration*f),quietMs:180};
 const r=new MotionGestureRecognizer(p,d=>got.push({d,t:last}),{});let last=0;
 // v1 fires at the end of the gesture; latency is measured from the first sample above 30 deg/s.
 let startT=null;
 for(const s of samples){last=s.t;if(startT===null&&Math.hypot(s.alpha,s.beta)>30)startT=s.t;r.orientation({beta:s.obeta,gamma:s.ogamma},s.t,0);r.motion({ax:s.ax,ay:s.ay,az:s.az,alpha:s.alpha,beta:s.beta,gamma:s.gamma},s.t,0)}
 return got.map(g=>({d:g.d,lat:startT===null?null:g.t-startT}))}

const DIRS=['right','left','up','down'];
const scenarios=[];
for(const d of DIRS){
 for(const [amp,out,hold,back] of [[16,160,40,200],[22,220,80,260],[14,140,0,180],[35,260,120,300],[15,300,0,350]])scenarios.push({name:`tilt ${d} ${amp}°/${out}ms`,sc:tilt(d,amp,out,hold,back,.25),kind:'tilt'});
 scenarios.push({name:`double ${d}`,sc:seq(tilt(d,20,170,30,200,.2,150),tilt(d,20,170,30,200,.2,120)),kind:'double'});
 scenarios.push({name:`slow-out fast-back ${d}`,sc:slowOutFastBack(d),kind:'negative'});
}
for(const d of DIRS){
 // Held tilt then a fast return: exactly one step.
 scenarios.push({name:`hold 2s + snap back ${d}`,sc:tilt(d,24,180,2000,160,.15),kind:'tilt'});
 // Four quick tilts with no pause between them.
 scenarios.push({name:`rapid x4 ${d}`,sc:seq(...[0,1,2,3].map(()=>tilt(d,18,150,0,180,.15,20))),kind:'double'});
}
// Held left, then a deliberate tilt right well past neutral: one "right".
scenarios.push({name:'held left, cross to right',sc:{expect:['left','right'],end:3200,angle:t=>{const u=t<200?0:t<380?smooth((t-200)/180):t<1600?1:t<1950?1-2*smooth((t-1600)/350):-1;return{x:-22*u,y:0}}},kind:'double'});
scenarios.push({name:'rapid right,left,right',sc:seq(tilt('right',18,150,0,180,.15,20),tilt('left',18,150,0,180,.15,20),tilt('right',18,150,0,180,.15,20)),kind:'double'},{name:'rapid up,down',sc:seq(tilt('up',18,150,0,180,.15,20),tilt('down',18,150,0,180,.15,20)),kind:'double'});
scenarios.push({name:'right then up',sc:seq(tilt('right',20,170,40,200,.2,150),tilt('up',20,170,40,200,.2,150)),kind:'double'});
scenarios.push({name:'left then down',sc:seq(tilt('left',16,150,0,200,.2,150),tilt('down',18,190,40,220,.2,150)),kind:'double'});
for(const d of DIRS)scenarios.push({name:`small ${d} 10° (sens 8)`,sc:tilt(d,10,130,0,170,.2),kind:'tilt',opts:{sensitivity:8,settle:5}});
scenarios.push({name:'lift',sc:lift(true),kind:'negative'},{name:'lower',sc:lift(false),kind:'negative'},{name:'hand wobble',sc:wobble,kind:'negative'});

let fail=0;const report={v2:{ok:0,total:0,lat:[]},v1:{ok:0,total:0,lat:[]}};
for(const hz of [50,60,100,200])for(const sc of scenarios){
 const samples=stream(sc.sc,hz);
 for(const eng of ['v2','v1']){
  const got=eng==='v2'?runV2(samples,sc.opts||{sensitivity:5,settle:5}):runV1(samples);
  const ok=got.length===sc.sc.expect.length&&got.every((g,i)=>g.d===sc.sc.expect[i]);
  report[eng].total++;if(ok){report[eng].ok++;if(got.length&&got[0].lat!=null)report[eng].lat.push(got[0].lat)}
  if(eng==='v2'&&!ok){fail++;console.error(`FAIL v2 ${hz}Hz ${sc.name}: expected [${sc.sc.expect}] got [${got.map(g=>g.d)}]`)}
  else if(verbose&&!ok)console.log(`   v1 ${hz}Hz ${sc.name}: expected [${sc.sc.expect}] got [${got.map(g=>g.d)}]`);
 }
}
const med=a=>a.length?Math.round(a.slice().sort((x,y)=>x-y)[a.length>>1]):null;
for(const e of ['v2','v1'])console.log(`${e}: ${report[e].ok}/${report[e].total} scenarios correct · median first-step latency ${med(report[e].lat)} ms`);
// v1 is only a reference: its classifier was trained on real recordings, synthetic signals are unfamiliar to it.
if(fail){console.error(fail+' v2 failure(s)');process.exit(1)}
console.log('motion tilt v2 OK');
