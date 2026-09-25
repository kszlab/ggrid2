/* GGrid Motion Tilt v2 – fast, rate-independent tilt recognizer.
   One short tilt = one arrow press, fired DURING the outward tilt, not after
   the phone has settled again.

   Signal: gyroscope only (DeviceMotionEvent.rotationRate), mapped to screen axes
   with the same fixed axis profile as v1 and integrated with the real sample
   time step. No Euler angles (no gimbal problems when the phone is held
   upright), no sample-count features (works at 50, 60, 100 or 200 Hz).

   State machine
     idle      → armed      when the angular speed exceeds startRate
     armed     → fire       when the integrated tilt on one axis reaches
                            commitAngle, dominates the other axis, and the
                            phone is on that side of its neutral pose
     armed     → idle       after armMs without a decision (slow drift, wobble)
     fired     → idle       after the return movement (angle back toward the
                            start and quiet for settleMs) or timeout
   The neutral pose is the slowly leaking integrated angle; a fast movement
   that only brings the phone back to neutral never fires (return guard).
   Presentation-free: the caller maps directions to moves. */
(function(root){
 'use strict';
 const AXES=Object.freeze({x:{alpha:0,beta:1,gamma:0},y:{alpha:1,beta:0,gamma:0}});
 function finite(v){return typeof v==='number'&&Number.isFinite(v)}
 function rotate(x,y,angle){const a=((angle%360)+360)%360;
  if(a===90)return{x:y,y:-x};if(a===180)return{x:-x,y:-y};if(a===270)return{x:-y,y:x};return{x,y}}
 const lerp=(a,b,t)=>a+(b-a)*t;
 // sensitivity 1..10 (10 = most sensitive), settle 1..10 (10 = longest pause between steps)
 function tuning(sensitivity=5,settle=5){
  const s=(Math.max(1,Math.min(10,sensitivity))-1)/9,q=(Math.max(1,Math.min(10,settle))-1)/9;
  return{
   // Defaults at sensitivity 5 (12° / 11°) were fitted on 8 real calibration recordings
   // (96 tilts, 32 lift/lower, 32 slides; leave-one-file-out: 92% tilts, 0 slides, 4/32 lifts).
   commitX:lerp(17,6,s),            // degrees of roll (left/right) that make one step
   commitY:lerp(15.5,5.5,s),        // degrees of pitch (up/down)
   liftPre:1.0,liftPost:3.0,        // m/s² push along the screen normal AGAINST the turn (before / after peak speed) = lift/lower
   liftAxes:'y',                    // which screen axes the lift check applies to ('y' portrait pitch, 'xy' both)
   blockMs:800,                     // after a step the opposite step on the same axis waits for calm (max this long)
   startRate:lerp(55,28,s),         // deg/s that start a candidate
   dominance:1.6,                   // dominant/other axis angle ratio
   neutralShare:.45,                // pose must be ≥ this share of commitAngle on the fired side
   armMs:520,                       // a candidate must decide within this time
   settleMs:lerp(90,260,q),         // quiet time after the return before the next step
   returnShare:.5,                  // return = angle back below this share of the peak
   quietRate:22,                    // deg/s counted as "still"
   maxFiredMs:1100,                 // safety timeout of the fired state
   neutralTauMs:6000,               // how fast a held pose becomes the new neutral
   returnGuard:.4,                  // earlier opposite pose ≥ this share of the movement = return
   biasTauMs:2500,maxBias:6         // gyro bias tracking while still
  };
 }
 class MotionTiltRecognizerV2{
  constructor(options={},onDirection=()=>{}){
   this.p={...tuning(options.sensitivity,options.settle),...(options.tuning||{})};
   this.axes=options.axes||AXES;this.onDirection=onDirection;this.reset();
  }
  reset(){
   this.state='idle';this.last=null;this.angle=null;this.block=null;this.azRecent=[];
   this.bias={x:0,y:0};this.pose={x:0,y:0};this.rest={x:0,y:0,t:0};this.g=null;this.quietSince=null;this.lockUntil=0;
  }
  orientation(){/* not needed; kept for interface compatibility with v1 */}
  motion(raw,t,angle=0){
   if(!finite(t)||![raw.alpha,raw.beta,raw.gamma].every(finite))return;
   const p=this.p;
   if(this.last===null||t<=this.last||t-this.last>400||this.angle!==angle){
    // Gap, clock jump or screen rotation: start clean but keep the bias estimate.
    this.last=t;this.angle=angle;this.state='idle';this.g=null;this.pose={x:0,y:0};this.rest={x:0,y:0,t};this.quietSince=null;return;
   }
   const dt=(t-this.last)/1000;this.last=t;
   const az=finite(raw.az)?raw.az:0;this.azRecent.push([t,az]);while(this.azRecent.length&&this.azRecent[0][0]<t-350)this.azRecent.shift();
   const ax=this.axes,r0={x:ax.x.alpha*raw.alpha+ax.x.beta*raw.beta+ax.x.gamma*raw.gamma,y:ax.y.alpha*raw.alpha+ax.y.beta*raw.beta+ax.y.gamma*raw.gamma};
   const rs=rotate(r0.x,r0.y,angle);
   const w={x:rs.x-this.bias.x,y:rs.y-this.bias.y},speed=Math.hypot(w.x,w.y);
   const still=speed<p.quietRate;
   if(still){if(this.quietSince===null)this.quietSince=t}else this.quietSince=null;
   if(this.block&&(t-this.block.firedAt>p.blockMs||this.state!=='fired'&&this.quietSince!==null&&t-this.quietSince>=p.settleMs&&this.quietSince>this.block.firedAt))this.block=null;
   // Bias: only from very still samples, slowly.
   if(speed<p.maxBias*1.5&&this.state==='idle'){const k=Math.min(1,dt*1000/p.biasTauMs);this.bias.x+=k*(rs.x-this.bias.x);this.bias.y+=k*(rs.y-this.bias.y);
    this.bias.x=Math.max(-p.maxBias,Math.min(p.maxBias,this.bias.x));this.bias.y=Math.max(-p.maxBias,Math.min(p.maxBias,this.bias.y))}
   // Pose relative to neutral: integrate, and leak toward 0 while the phone is still.
   this.pose.x+=w.x*dt;this.pose.y+=w.y*dt;
   if(still){const k=Math.min(1,dt*1000/p.neutralTauMs);this.pose.x-=k*this.pose.x;this.pose.y-=k*this.pose.y}
   // Last still pose: the tilt is measured from here, so the slow start of the
   // movement (before startRate is reached) is not lost.
   if(this.state==='idle'&&speed<p.quietRate*.6)this.rest={x:this.pose.x,y:this.pose.y,t};
   if(this.state==='idle'){
    if(t<this.lockUntil||speed<p.startRate)return;
    const fresh=t-this.rest.t<=450;
    this.state='armed';this.g={start:fresh?this.rest.t:t,th:fresh?{x:this.pose.x-this.rest.x,y:this.pose.y-this.rest.y}:{x:w.x*dt,y:w.y*dt},peak:0,dir:null,startPose:fresh?{x:this.rest.x,y:this.rest.y}:{x:this.pose.x,y:this.pose.y},peakSpeed:speed,pre:{lo:Math.min(0,...this.azRecent.map(v=>v[1])),hi:Math.max(0,...this.azRecent.map(v=>v[1]))},post:{lo:0,hi:0}};
   }
   const g=this.g;
   if(this.state==='armed'){
    if(g.armedAt===t){}else if(g.armedAt===undefined){g.armedAt=t}else{g.th.x+=w.x*dt;g.th.y+=w.y*dt}
    // Screen-normal push, split at the moment of peak turning speed: before it (speed-up)
    // and after it (braking). Braking a real tilt pushes back a little; lifting pushes early or hard.
    if(speed>=g.peakSpeed){g.pre.lo=Math.min(g.pre.lo,g.post.lo,az);g.pre.hi=Math.max(g.pre.hi,g.post.hi,az);g.post={lo:0,hi:0};g.peakSpeed=speed}
    else{g.post.lo=Math.min(g.post.lo,az);g.post.hi=Math.max(g.post.hi,az)}
    const ex=Math.abs(g.th.x),ey=Math.abs(g.th.y),axis=ex>=ey?'x':'y',dom=Math.max(ex,ey),other=Math.min(ex,ey);
    const commit=axis==='x'?p.commitX:p.commitY;
    if(dom>=commit&&dom>=p.dominance*other){
     const sign=Math.sign(g.th[axis]),dir=axis==='x'?(sign>0?'right':'left'):(sign>0?'down':'up');
     const onSide=sign*this.pose[axis]>=p.neutralShare*commit;
     // Return guard: the phone was held tilted the other way before this movement
     // and the movement mostly just brings it back. Crossing well past neutral is allowed.
     const isReturn=sign*g.startPose[axis]<=-p.returnGuard*dom;
     // Outward: still turning the same way (or just stopped), not already swinging back.
     const outward=sign*w[axis]>-p.quietRate;
     // Lift/lower: strong push along the screen normal during a pitch.
     // Measured on the device: a real tilt pushes the screen along its normal in the
     // turning direction; lifting/lowering first pushes it the other way.
     const devAxis=((((angle%180)+180)%180)===90)?(axis==='x'?'y':'x'):axis;
     const pre=sign>0?g.pre.lo:-g.pre.hi,post=sign>0?g.post.lo:-g.post.hi;
     const lift=p.liftAxes.includes(devAxis)&&(pre<-p.liftPre||post<-p.liftPost);
     const b=this.block,blocked=b&&b.axis===axis&&b.sign===-sign;
     if(onSide&&!isReturn&&outward&&!lift&&!blocked){
      this.state='fired';g.dir=dir;g.axis=axis;g.sign=sign;g.firedAt=t;g.peak=dom;this.block={axis,sign,firedAt:t};
      this.onDirection(dir,'tilt',{latencyMs:t-g.start,angle:dom});
      return;
     }
     // Not (yet) a valid step: keep integrating; it may still become one, or time out.
    }
    if(t-g.start>p.armMs||(still&&t-g.start>120&&this.quietSince!==null&&t-this.quietSince>=60)){this.state='idle';this.g=null;this.lockUntil=t+40}
    return;
   }
   if(this.state==='fired'){
    g.th.x+=w.x*dt;g.th.y+=w.y*dt;
    const cur=g.sign*g.th[g.axis];g.peak=Math.max(g.peak,cur);
    const returned=cur<=p.returnShare*g.peak;
    const quietLong=this.quietSince!==null&&t-this.quietSince>=p.settleMs;
    // Held tilt: once still for a while the held pose is simply the new situation; no repeat.
    const heldStill=this.quietSince!==null&&t-this.quietSince>=p.settleMs+160;
    // Rapid play: once the phone is almost back, the next tilt may start at once,
    // measured from here. Its opposite-direction tail cannot fire (neutral guard).
    const deepReturn=cur<=.3*g.peak&&t-g.firedAt>=p.settleMs*.6;
    if(deepReturn||(returned&&quietLong)||heldStill||t-g.firedAt>p.maxFiredMs){this.state='idle';this.g=null;this.rest={x:this.pose.x,y:this.pose.y,t};this.lockUntil=deepReturn&&!quietLong?t:t+30}
   }
  }
 }
 root.MotionTiltRecognizerV2=MotionTiltRecognizerV2;
 root.MotionTiltV2Tuning=tuning;
 if(typeof module!=='undefined'&&module.exports)module.exports={MotionTiltRecognizerV2,tuning,AXES};
})(typeof window!=='undefined'?window:globalThis);
