// Motion Tilt v2 on real phone recordings (8 calibration sessions, Android Chrome, 60 Hz):
// 96 tilts, 32 lift/lower, 32 in-plane slides. Guards against regressions of the fitted defaults.
// Numbers are in-sample; leave-one-file-out gave 88/96 tilts, 4/32 lifts, 0 slides, 1 double step.
import {createRequire} from 'module';import fs from 'fs';import zlib from 'zlib';
const require=createRequire(import.meta.url);
const {MotionTiltRecognizerV2}=require('../js/motion-tilt-v2.js');
const fx=JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('./fixtures/motion-calibration-2026-09-24.json.gz',import.meta.url))));
const sens=Number(process.env.SENS||5),settle=Number(process.env.SETTLE||5);
const c={tilts:0,ok:0,miss:0,wrong:0,lifts:0,liftFP:0,slides:0,slideFP:0,extra:0,lat:[]};
for(const s of fx.sessions)for(const seg of s.segments){
 const out=[];let now=0,start=null;
 const r=new MotionTiltRecognizerV2({sensitivity:sens,settle},d=>out.push({d,t:now}));
 for(const [t,ax,ay,az,a,b,g,angle] of seg.samples){now=t;if(start===null&&Math.hypot(a,b)>30)start=t;r.motion({ax,ay,az,alpha:a,beta:b,gamma:g},t,angle)}
 if(out.length>1)c.extra++;
 if(seg.expectedDirection){c.tilts++;if(!out.length)c.miss++;else if(out[0].d===seg.expectedDirection){c.ok++;c.lat.push(out[0].t-start)}else c.wrong++}
 else if(seg.to.startsWith('slide')){c.slides++;if(out.length)c.slideFP++}
 else{c.lifts++;if(out.length)c.liftFP++}
}
c.lat.sort((a,b)=>a-b);const med=Math.round(c.lat[c.lat.length>>1]),p90=Math.round(c.lat[Math.floor(c.lat.length*.9)]);delete c.lat;
console.log({sensitivity:sens,settle,...c,medianLatencyMs:med,p90LatencyMs:p90});
if(sens===5&&settle===5){
 const fails=[];
 if(c.ok<89)fails.push(`tilts correct ${c.ok}/96 < 89`);
 if(c.liftFP>4)fails.push(`lift/lower false steps ${c.liftFP} > 4`);
 if(c.slideFP>0)fails.push(`slide false steps ${c.slideFP} > 0`);
 if(c.extra>0)fails.push(`double steps ${c.extra} > 0`);
 if(med>120)fails.push(`median latency ${med} ms > 120`);
 if(fails.length){console.error('FAIL',fails.join('; '));process.exit(1)}
 console.log('motion recordings OK');
}
