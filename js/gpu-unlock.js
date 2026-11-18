const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut=t=>1-Math.pow(1-t,3);

/* ---------------- hero: locked vs unlocked, loops like a GIF ---------------- */
(function(){
  const s=document.getElementById('heroSvg');
  const t1=el('text',{x:120,y:90,fill:'#fff','font-size':36,'font-weight':700,'font-family':'Inter'},s);t1.textContent='Same card, same power limit';
  const t2=el('text',{x:120,y:130,fill:'#8d8a84','font-size':21,'font-family':'Inter'},s);t2.textContent='Dense BF16 matrix compute, TFLOPS · grey: as shipped · gold: unlocked';
  const X0=320, SCALE=3.0; // px per TFLOPS
  const rows=[
    {name:'RTX 3090',y:250,base:75,full:125,lab0:'75',lab1:'125 TFLOPS',gain:'+65%'},
    {name:'RTX 4090',y:440,base:165,full:329,lab0:'165 TFLOPS',lab1:'329 TFLOPS',gain:'≈2×'},
  ];
  const parts=rows.map(r=>{
    el('text',{x:120,y:r.y+48,fill:'#fff','font-size':30,'font-weight':700,'font-family':'Inter'},s).textContent=r.name;
    el('rect',{x:X0,y:r.y,width:r.full*SCALE,height:80,fill:'#1a1a1d'},s);
    const base=el('rect',{x:X0,y:r.y,width:0,height:80,fill:'#5d5a55'},s);
    const ext=el('rect',{x:X0+r.base*SCALE,y:r.y,width:0,height:80,fill:'#e0b65a'},s);
    const l0=el('text',{x:X0+16,y:r.y+50,fill:'#fff','font-size':24,'font-weight':600,'font-family':'Inter'},s);l0.textContent=r.lab0;
    const l1=el('text',{x:X0+r.full*SCALE+18,y:r.y+50,fill:'#e0b65a','font-size':28,'font-weight':700,'font-family':'Inter'},s);l1.textContent=r.lab1+'  '+r.gain;
    // padlock at the boundary
    const lock=el('g',{transform:`translate(${X0+r.base*SCALE-22},${r.y-62})`},s);
    const shackle=el('path',{d:'M8 26 V16 a14 14 0 0 1 28 0 V26',fill:'none',stroke:'#fff','stroke-width':5},lock);
    el('rect',{x:0,y:24,width:44,height:34,rx:4,fill:'#fff'},lock);
    el('circle',{cx:22,cy:40,r:5,fill:'#0d0d0f'},lock);
    return {r,base,ext,l0,l1,lock,shackle};
  });
  el('text',{x:120,y:640,fill:'#77746e','font-size':20,'font-family':'Inter'},s).textContent='Games: +0%  ·  Chatbot replies: +0%  ·  Same power limit';
  function frame(now){
    const T=reduced?7:((now/1000)%9);
    const fade=T>8.4?Math.max(0,(9-T)/0.6):1;
    parts.forEach(({r,base,ext,l0,l1,lock,shackle},i)=>{
      const p0=easeOut(Math.min(1,Math.max(0,(T-0.4-i*0.25)/1.1)));
      base.setAttribute('width',r.base*SCALE*p0); l0.style.opacity=p0*fade; base.style.opacity=fade;
      const open=Math.min(1,Math.max(0,(T-2.4-i*0.3)/0.4));
      shackle.setAttribute('transform',`translate(0 ${-14*open}) rotate(${-25*open} 36 26)`);
      lock.style.opacity=(T<2.4+i*0.3+1.2?1:Math.max(0,1-(T-3.6-i*0.3)/0.4))*fade;
      const p1=easeOut(Math.min(1,Math.max(0,(T-3.2-i*0.3)/1.4)));
      ext.setAttribute('width',(r.full-r.base)*SCALE*p1); ext.style.opacity=fade;
      l1.style.opacity=Math.min(1,Math.max(0,(T-4.4-i*0.3)/0.5))*fade;
    });
    if(!reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------------- product segmentation: animated chip ---------------- */
(function(){
  const svg=document.getElementById('segSvg'); if(!svg) return;
  const GOLD='#e0b65a', OFF='#2b2925', BLUE='#4d8bff';
  // die outline
  el('rect',{x:20,y:20,width:600,height:250,rx:6,fill:'#141417',stroke:'#3a3833','stroke-width':2},svg);
  // left block: shader & RT cores (games), always fully on
  el('text',{x:40,y:48,fill:'#cfcbc3','font-size':12,'font-weight':600,'font-family':'Inter'},svg).textContent='SHADER & RT CORES · games';
  for(let r=0;r<4;r++)for(let c=0;c<6;c++)
    el('rect',{x:40+c*40,y:62+r*48,width:32,height:38,rx:3,fill:BLUE,opacity:.85},svg);
  // right block: tensor cores, FP32-accumulate path. 24 cells; 14 lit ≈ 75/125 of 24
  el('text',{x:340,y:48,fill:'#cfcbc3','font-size':12,'font-weight':600,'font-family':'Inter'},svg).textContent='TENSOR CORES · AI maths';
  const N=24, LIT=Math.round(N*75/125), cells=[];
  for(let r=0;r<4;r++)for(let c=0;c<6;c++){
    const i=r*6+c;
    cells.push(el('rect',{class:'cell',x:340+c*44,y:62+r*48,width:36,height:38,rx:3,fill:i<LIT?GOLD:OFF},svg));
  }
  // order cells light up in: a diagonal sweep from the switch side
  const order=cells.map((_,i)=>i).filter(i=>i>=LIT);
  // speed-select switch
  const sw=el('g',{transform:'translate(250,292)'},svg);
  el('text',{x:-6,y:15,'text-anchor':'end',fill:'#8d8a84','font-size':12,'font-family':'Inter'},sw).textContent='speed setting';
  const track=el('rect',{class:'sw-track',x:0,y:0,width:56,height:22,rx:11,fill:'#3a3833'},sw);
  const knob=el('circle',{class:'sw-knob',cx:11,cy:11,r:8,fill:'#fff'},sw);
  const swLbl=el('text',{x:66,y:15,fill:'#fff','font-size':12,'font-weight':600,'font-family':'Inter'},sw); swLbl.textContent='half rate';
  // lock badge on the tensor block
  const lock=el('g',{transform:'translate(586,28)'},svg);
  const shackle=el('path',{d:'M5 13 V8 a7 7 0 0 1 14 0 V13',fill:'none',stroke:'#fff','stroke-width':2.5},lock);
  el('rect',{x:0,y:12,width:24,height:18,rx:3,fill:'#fff'},lock);
  shackle.style.transition='transform .4s'; lock.style.transition='opacity .4s';

  const val=document.getElementById('segVal'), bL=document.getElementById('segLocked'), bU=document.getElementById('segUnlocked');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timers=[], raf;
  const clear=()=>{timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(raf);};
  function count(from,to,ms){
    const t0=performance.now();
    (function f(t){const p=Math.min(1,Math.max(0,(t-t0)/ms)),v=from+(to-from)*(1-Math.pow(1-p,3));
      val.textContent=Math.round(v)+' TFLOPS'; if(p<1) raf=requestAnimationFrame(f);})(t0);
    timers.push(setTimeout(()=>{cancelAnimationFrame(raf);val.textContent=to+' TFLOPS';},ms+60)); // always land on the exact value
  }
  function set(unlocked,animate){
    clear();
    bL.setAttribute('aria-pressed',!unlocked); bU.setAttribute('aria-pressed',unlocked);
    knob.style.transform=unlocked?'translateX(34px)':'none';
    track.setAttribute('fill',unlocked?GOLD:'#3a3833');
    swLbl.textContent=unlocked?'full rate':'half rate';
    shackle.style.transform=unlocked?'translateY(-5px)':'none';
    lock.style.opacity=unlocked?0:1;
    val.classList.toggle('up',unlocked);
    if(!animate||reduced){
      order.forEach(i=>cells[i].setAttribute('fill',unlocked?GOLD:OFF));
      val.textContent=(unlocked?125:75)+' TFLOPS'; return;
    }
    const seq=unlocked?order:[...order].reverse(), step=50, start=unlocked?450:0;
    seq.forEach((i,k)=>timers.push(setTimeout(()=>cells[i].setAttribute('fill',unlocked?GOLD:OFF),start+k*step)));
    timers.push(setTimeout(()=>count(unlocked?75:125,unlocked?125:75,seq.length*step+300),start));
  }
  // starts "As shipped"; only the reader's clicks change it
  bL.addEventListener('click',()=>set(false,true));
  bU.addEventListener('click',()=>set(true,true));
  set(false,false);
})();

/* ---------------- flat analogy: animated floor plans ---------------- */
(function(){
  const svg=document.getElementById('flatSvg'); if(!svg) return;
  const PAPER='#f7f5f0', LIT='#f3dca0', LOCKED='#dcd8cf';
  const defs=el('defs',{},svg);
  const pat=el('pattern',{id:'hatchPat',width:8,height:8,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs);
  el('line',{x1:0,y1:0,x2:0,y2:8,stroke:'#a9a59c','stroke-width':2},pat);

  // rooms in flat coordinates (each flat is 280 × 200)
  const ROOMS=[
    {k:'Living',x:0,y:0,w:160,h:120},
    {k:'Kitchen',x:160,y:0,w:120,h:70},
    {k:'Bath',x:160,y:70,w:120,h:50},
    {k:'Bedroom',x:0,y:120,w:120,h:80},
    {k:'Master bedroom',x:120,y:120,w:160,h:80,master:true},
  ];
  // walls, with a door gap into the master bedroom at x 125–155 on y 120
  const WALLS='M0 0 H280 V200 H0 Z M160 0 V120 M160 70 H280 M0 120 H125 M155 120 H280 M120 120 V200';

  function flat(x0,y0,title,price,locked){
    const T=(x,y)=>`${x0+x},${y0+y}`;
    el('text',{x:x0,y:y0-14,fill:'#111','font-size':13,'font-weight':700,'font-family':'Inter'},svg).textContent=title;
    const rooms={};
    ROOMS.forEach(r=>{
      rooms[r.k]=el('rect',{class:'room',x:x0+r.x,y:y0+r.y,width:r.w,height:r.h,fill:PAPER,opacity:0},svg);
      const t=el('text',{x:x0+r.x+r.w/2,y:y0+r.y+r.h/2+4,'text-anchor':'middle',fill:'#76736c','font-size':11,'font-family':'Inter'},svg);
      t.textContent=r.k; t.classList.add('room'); t.style.opacity=0; rooms[r.k+'_lbl']=t;
    });
    const m=ROOMS[4];
    const hatch=el('rect',{class:'hatch',x:x0+m.x,y:y0+m.y,width:m.w,height:m.h,fill:'url(#hatchPat)',opacity:0},svg);
    const wall=el('path',{class:'wall',d:WALLS,pathLength:1,transform:`translate(${x0} ${y0})`},svg);
    // door leaf: hinged at (125,120); 0° = shut across the gap, 75° = swung open into the master bedroom
    const hx=x0+125, hy=y0+120;
    const door=el('line',{class:'door',x1:hx,y1:hy,x2:hx+30,y2:hy,stroke:'#111','stroke-width':3},svg);
    door.style.transformOrigin=`${hx}px ${hy}px`;
    // padlock in the middle of the master bedroom
    const lock=el('g',{class:'lock',opacity:0},svg);
    const cx=x0+m.x+m.w/2, cy=y0+m.y+m.h/2-18; // sits above the room label
    const shackle=el('path',{d:`M${cx-7} ${cy} V${cy-6} a7 7 0 0 1 14 0 V${cy}`,fill:'none',stroke:'#c2412d','stroke-width':3},lock);
    shackle.style.transition='transform .4s ease'; shackle.style.transformOrigin=`${cx+7}px ${cy}px`;
    el('rect',{x:cx-11,y:cy-1,width:22,height:17,rx:3,fill:'#c2412d'},lock);
    // key that travels to the door
    const key=el('g',{class:'key',opacity:0},svg);
    el('circle',{cx:0,cy:0,r:6,fill:'none',stroke:'#b8892b','stroke-width':3},key);
    el('path',{d:'M6 0 H22 M16 0 V5 M20 0 V5',fill:'none',stroke:'#b8892b','stroke-width':3},key);
    key.style.transform=`translate(${x0+140}px,${y0+232}px)`;
    // price tag
    const tag=el('text',{class:'tag',x:x0+280,y:y0-14,'text-anchor':'end',fill:locked?'#76736c':'#b8892b','font-size':12,'font-weight':600,'font-family':'Inter',opacity:0},svg);
    tag.textContent=price;
    return {rooms,hatch,wall,door,lock,shackle,key,tag,x0,y0,locked};
  }
  const A=flat(24,40,'Company buyer','Full price',false);
  const B=flat(336,40,'Family buyer','Pays less',true);
  const note=el('text',{x:320,y:300,'text-anchor':'middle',fill:'#76736c','font-size':12,'font-style':'italic','font-family':'Source Serif 4, Georgia, serif',opacity:0},svg);
  note.style.transition='opacity .5s'; note.textContent='Same walls, same rooms. One lock.';

  const btn=document.getElementById('flatUnlock');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timers=[];
  const at=(ms,fn)=>timers.push(setTimeout(fn,reduced?0:ms));
  const room=(F,k,fill)=>{F.rooms[k].setAttribute('fill',fill);};
  function openMaster(F){
    F.door.style.transform='rotate(75deg)';
    room(F,'Master bedroom',LIT); F.hatch.setAttribute('opacity',0);
    F.shackle.style.transform='translateY(-6px) rotate(25deg)';
    at(350,()=>F.lock.setAttribute('opacity',0));
  }
  function lockMaster(F){
    F.door.style.transform='rotate(0deg)';
    room(F,'Master bedroom',LOCKED); F.hatch.setAttribute('opacity',1);
    F.shackle.style.transform='none'; F.lock.setAttribute('opacity',1);
  }
  function reset(){
    timers.forEach(clearTimeout); timers=[];
    svg.classList.remove('drawn');
    [A,B].forEach(F=>{
      Object.values(F.rooms).forEach(r=>r.style.opacity=0);
      ROOMS.forEach(r=>room(F,r.k,PAPER));
      F.hatch.setAttribute('opacity',0); F.lock.setAttribute('opacity',0); F.shackle.style.transform='none';
      F.door.style.transform='rotate(0deg)'; F.tag.setAttribute('opacity',0);
      F.key.setAttribute('opacity',0); F.key.style.transform=`translate(${F.x0+140}px,${F.y0+232}px)`;
    });
    note.setAttribute('opacity',0); btn.setAttribute('aria-pressed','false');
  }
  function play(){
    reset();
    at(50,()=>svg.classList.add('drawn'));                                   // walls draw in
    at(1100,()=>[A,B].forEach(F=>{Object.values(F.rooms).forEach(r=>r.style.opacity=1);F.tag.setAttribute('opacity',1);}));
    at(1700,()=>{A.key.setAttribute('opacity',1);A.key.style.transform=`translate(${A.x0+132}px,${A.y0+108}px)`;}); // key to the door
    at(2400,()=>{openMaster(A);A.key.setAttribute('opacity',0);});            // company: door opens, room lights up
    at(2900,()=>btn.getAttribute('aria-pressed')==='true'?openMaster(B):lockMaster(B)); // family: door shuts, room locked (unless the reader already unlocked it)
    at(3500,()=>note.setAttribute('opacity',1));
  }
  btn.addEventListener('click',()=>{
    const on=btn.getAttribute('aria-pressed')!=='true';
    if(!svg.classList.contains('drawn')) play();
    btn.setAttribute('aria-pressed',on);
    at(reduced?0:(svg.classList.contains('drawn')?0:3600),()=>{ if(on){openMaster(B);note.textContent='The unlock: same flat, and now the family has the key.';} else {lockMaster(B);note.textContent='Same walls, same rooms. One lock.';} });
  });
  document.getElementById('flatReplay').addEventListener('click',play);
  reset();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.disconnect();play();}}),{threshold:.5});
  io.observe(svg);
})();

/* ---------------- scrolly: gains by task ---------------- */
const TASKS=[
  {k:'AI images',lo:30,hi:55,cb:true},
  {k:'Fine-tuning',lo:25,hi:50,cb:true},
  {k:'Long prompts (prefill)',lo:25,hi:55,cb:true},
  {k:'AI video',lo:15,hi:20,cb:true},
  {k:'Compressed local models',lo:0,hi:15,cb:true},
  {k:'Games (frame rate)',lo:0,hi:0},
  {k:'Chatbot replies',lo:0,hi:0},
];
(function(){
  const svg=document.getElementById('gainChart');
  const W=640,L=180,R=30,T=16,rowH=48;
  const X=v=>L+(W-L-R)*(v/70);
  [0,20,40,60].forEach(v=>{el('line',{x1:X(v),x2:X(v),y1:T-6,y2:T+rowH*TASKS.length,stroke:'#26262a'},svg);
    const t=el('text',{x:X(v),y:T+rowH*TASKS.length+18,'text-anchor':'middle',fill:'#6d6a64','font-size':11,'font-family':'Inter'},svg);t.textContent='+'+v+'%';});
  const rows=TASKS.map((d,i)=>{
    const y=T+i*rowH+rowH/2;
    const g=el('g',{},svg); g.style.transition='opacity .4s';
    const lab=el('text',{x:L-12,y:y+4,'text-anchor':'end',fill:'#cfcbc3','font-size':13,'font-family':'Inter'},g);lab.textContent=d.k;
    const bar=el('rect',{x:X(0),y:y-11,height:22,width:0,fill:d.cb?'#e0b65a':'#5d5a55',rx:1},g);
    bar.style.transition='width .9s cubic-bezier(.2,.8,.2,1)';
    const rng=el('rect',{x:X(d.lo),y:y-11,height:22,width:0,fill:'#e0b65a',opacity:.45},g);
    rng.style.transition='width .9s cubic-bezier(.2,.8,.2,1) .2s';
    const zero=el('circle',{cx:X(0),cy:y,r:6,fill:'#8d8a84',opacity:0},g); zero.style.transition='opacity .4s';
    const val=el('text',{x:X(d.hi)+10,y:y+5,fill:'#fff','font-size':14,'font-weight':700,'font-family':'Inter',opacity:0},g);
    val.textContent=d.hi===0?'0%':(d.lo===0?'0–'+d.hi+'%':'+'+d.lo+'–'+d.hi+'%'); val.style.transition='opacity .4s';
    return {d,g,bar,rng,zero,val};
  });
  function setState(n){
    rows.forEach((r,i)=>{
      const shown=i<=n || n===7;
      r.bar.setAttribute('width',shown?Math.max(0,X(r.d.lo)-X(0)):0);
      r.rng.setAttribute('width',shown?X(r.d.hi)-X(r.d.lo):0);
      r.zero.setAttribute('opacity',shown&&r.d.hi===0?1:0);
      r.val.setAttribute('opacity',shown?1:0);
      r.g.style.opacity=(i===n||n===7)?1:(shown?.45:.25);
    });
    document.getElementById('gainSub').textContent=n>=5?'The gains only reach work limited by matrix compute':'Gold: work limited by matrix compute · Grey: everything else';
  }
  setState(-1);
  const steps=[...document.querySelectorAll('.step')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach(s=>s.classList.remove('on'));e.target.classList.add('on');setState(+e.target.dataset.s);}}),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(s=>io.observe(s));
})();

/* ---------------- wafer calculator: every input is listed in the figure's table ---------------- */
(function(){
  const $=id=>document.getElementById(id); if(!$('calc')) return;
  const FX=1.29, D=300, E=3;                                      // S$ per US$; wafer diameter and edge exclusion (mm)
  const B200_DIE=830, B200_COST=6400, AD102_DIE=608.44;           // mm², US$, mm²
  const gross=S=>Math.PI*Math.pow(D/2-E,2)/S - Math.PI*(D-2*E)/Math.sqrt(2*S);   // chips per wafer, before defects
  const sgd=n=>'S$'+Math.round(n*FX).toLocaleString('en-US'), usd=n=>'US$'+n.toLocaleString('en-US');
  function update(){
    const price=+$('sB2').value, y=+$('sYield').value/100, gm=+$('sGm').value;
    const b200s=gross(B200_DIE)*y/2, chips=gross(AD102_DIE)*y;    // a B200 uses two working chips
    const dcRev=b200s*price, dcGp=b200s*(price-B200_COST), gmRev=chips*gm;
    $('oB2').textContent=usd(price); $('oYield').textContent=$('aYield').textContent=Math.round(y*100)+'%';
    $('oGm').textContent=$('aGm').textContent=usd(gm);
    $('wDcRev').textContent=sgd(dcRev); $('wDcGp').textContent=sgd(dcGp); $('wGmRev').textContent=sgd(gmRev);
    [['bDcRev',dcRev],['bDcGp',dcGp],['bGmRev',gmRev]].forEach(([id,v])=>{ $(id).dataset.w=(v/dcRev*100).toFixed(2);
      if($('waferFig').classList.contains('in-view')) $(id).style.width=$(id).dataset.w+'%'; });
    $('cChips').textContent=b200s.toFixed(0)+' B200s · '+chips.toFixed(0)+' 4090s';
    $('cRatio').textContent=Math.round(dcRev/gmRev)+'×';
    $('cOpp').textContent=sgd((dcRev-gmRev)/chips);
  }
  ['sB2','sYield','sGm'].forEach(id=>$(id).addEventListener('input',update));
  update();
})();

/* ---------------- reveal + counters ---------------- */
function countUp(n){
  const to=+n.dataset.count,t0=performance.now(),d=1400;
  (function f(t){const p=Math.min(1,Math.max(0,(t-t0)/d));n.textContent='S$'+Math.round(to*easeOut(p)).toLocaleString('en-US')+(p===1&&n.dataset.plus?'+':'');if(p<1)requestAnimationFrame(f);})(t0);
}
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add('in-view');rio.unobserve(e.target);
  e.target.querySelectorAll('.mbar').forEach(b=>b.style.height=b.dataset.h+'%');
  e.target.querySelectorAll('[data-count]').forEach(countUp);
  e.target.querySelectorAll('.wtrack i').forEach(b=>b.style.width=b.dataset.w+'%');
}),{threshold:.25});
document.querySelectorAll('.rv, #qs').forEach(e=>rio.observe(e));

/* ---------------- progress bar + TOC ---------------- */
const prog=document.getElementById('prog'),tocLinks=[...document.querySelectorAll('#toc a')];
const secs=tocLinks.map(a=>document.querySelector(a.getAttribute('href')));
addEventListener('scroll',()=>{
  const h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=0;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<innerHeight*.35)cur=i;});
  tocLinks.forEach((a,i)=>a.classList.toggle('on',i===cur));
},{passive:true});
tocLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});}));

document.getElementById('copyLink').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);e.target.textContent='Copied';}catch(_){e.target.textContent='Copy from address bar';}});
