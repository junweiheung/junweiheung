/* ---------------- data ---------------- */
const STOPS = [
  { k:'Design',    who:'Nvidia',    v:75,   txt:'75¢',  smile:80, note:'gross margin' },
  { k:'EDA',       who:'Cadence',   v:88,   txt:'88¢',  smile:70, note:'non-GAAP gross' },
  { k:'Equipment', who:'ASML',      v:57.5, txt:'57¢',  smile:50, note:'gross margin' },
  { k:'Wafer fab', who:'TSMC',      v:66.4, txt:'66¢',  smile:28, note:'gross margin' },
  { k:'Memory',    who:'SK hynix',  v:80,   txt:'80¢',  smile:24, note:'operating margin', prev:47 },
  { k:'Packaging', who:'ASE',       v:22.1, txt:'22¢',  smile:30, note:'gross margin' },
  { k:'Assembly',  who:'Foxconn',   v:6.18, txt:'6¢',   smile:48, note:'gross margin' },
  { k:'Software',  who:'via Nvidia', v:75,   txt:'CUDA', smile:82, note:'inside Nvidia', hollow:true },
];
const SCARCE = new Set(['Equipment','Wafer fab','Memory']);

/* ---------------- helpers ---------------- */
const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
function smoothPath(pts,yMin,yMax){ // catmull-rom → bezier, kept inside the chart
  let d=`M${pts[0][0]},${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6], c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    if(yMin!==undefined){const lo=Math.min(p1[1],p2[1]),hi=Math.max(p1[1],p2[1]);
      // monotone-ish: don't let a segment swing past its own end points
      c1[1]=Math.max(Math.min(c1[1],hi+ (hi-lo)*.15, yMax),yMin); c2[1]=Math.max(Math.min(c2[1],hi+(hi-lo)*.15,yMax),yMin);}
    d+=` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ---------------- main scrolly chart ---------------- */
const svg=document.getElementById('curve');
const W=640,H=400,L=46,R=18,T=26,B=46;
const X=i=>L+(W-L-R)*(i/(STOPS.length-1));
const Y=v=>T+(H-T-B)*(1-v/100);
// grid
[0,25,50,75,100].forEach(v=>{el('line',{x1:L,x2:W-R,y1:Y(v),y2:Y(v),stroke:'#26262a','stroke-width':1},svg);
  const t=el('text',{x:L-8,y:Y(v)+4,'text-anchor':'end',fill:'#6d6a64','font-size':11,'font-family':'Inter'},svg);t.textContent=v+'¢';});
STOPS.forEach((s,i)=>{const t=el('text',{x:X(i),y:H-B+22,'text-anchor':'middle',fill:'#8d8a84','font-size':11,'font-family':'Inter'},svg);t.textContent=s.k;});
const smileD=smoothPath(STOPS.map((s,i)=>[X(i),Y(s.smile)]));
const smile=el('path',{d:smileD,fill:'none',stroke:'#8d8a84','stroke-width':2,'stroke-dasharray':'6 6',opacity:0},svg);
smile.style.transition='opacity .6s';
const realD=smoothPath(STOPS.map((s,i)=>[X(i),Y(s.v)]),Y(100),Y(0));
const real=el('path',{d:realD,fill:'none',stroke:'#e0b65a','stroke-width':3,'stroke-linecap':'round'},svg);
const realLen=real.getTotalLength(); real.style.strokeDasharray=realLen; real.style.strokeDashoffset=realLen; real.style.transition='stroke-dashoffset 1.4s ease';
const smileLbl=el('text',{x:X(3)-10,y:Y(30)+28,fill:'#8d8a84','font-size':12,'font-family':'Inter','font-style':'italic',opacity:0},svg);smileLbl.textContent='the textbook smile';
smileLbl.style.transition='opacity .6s';
// memory "before" ghost + arrow
const ghost=el('circle',{cx:X(4),cy:Y(47),r:7,fill:'none',stroke:'#8d8a84','stroke-width':2,'stroke-dasharray':'3 3',opacity:0},svg);
const arrow=el('line',{x1:X(4)+14,y1:Y(47)-4,x2:X(4)+14,y2:Y(80)+10,stroke:'#8d8a84','stroke-width':1.5,'stroke-dasharray':'4 4','marker-end':'url(#ah)',opacity:0},svg);
const defs=el('defs',{},svg);const mk=el('marker',{id:'ah',viewBox:'0 0 10 10',refX:5,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},defs);el('path',{d:'M0,0 L10,5 L0,10 z',fill:'#8d8a84'},mk);
[ghost,arrow].forEach(e=>e.style.transition='opacity .5s');

const dots=STOPS.map((s,i)=>{
  const g=el('g',{},svg);g.style.transition='opacity .5s, transform .9s cubic-bezier(.3,1.4,.5,1)';
  const halo=el('circle',{cx:X(i),cy:Y(s.v),r:16,fill:'#e0b65a',opacity:0},g);halo.style.transition='opacity .4s';
  const c=el('circle',{cx:X(i),cy:Y(s.v),r:8,fill:s.hollow?'#0d0d0f':'#e0b65a',stroke:'#e0b65a','stroke-width':s.hollow?2.5:0},g);c.style.transition='fill .4s, stroke .4s';
  const lab=el('text',{x:X(i),y:Y(s.v)-16,'text-anchor':'middle',fill:'#fff','font-size':12.5,'font-weight':600,'font-family':'Inter'},g);lab.textContent=s.txt;
  const who=el('text',{x:X(i),y:Y(s.v)+(s.v<15?-32:26),'text-anchor':'middle',fill:'#8d8a84','font-size':10.5,'font-family':'Inter'},g);who.textContent=s.who;
  g.style.opacity=0; g.style.transform=`translateY(${H-B-Y(s.v)}px)`;
  return {g,c,halo};
});
// rail
const rail=document.getElementById('rail');
STOPS.forEach(s=>{const sp=document.createElement('span');sp.textContent=s.k;rail.appendChild(sp);});
const railEls=[...rail.children];


/* ---------------- the chip's journey: what physically happens at each stop ----------------
   A picture above the margin curve, swapped as the reader scrolls. Each scene is its own <g>;
   only the active one is shown, and its small loop animations run only while it's active. */
const stage=document.getElementById('stage'), stageCap=document.getElementById('stageCap');
const SC={}; // scene groups by key
const sg=(k)=>{const g=el('g',{class:'stg','data-k':k},stage);SC[k]=g;return g;};
const T_=(p,x,y,str,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter','font-size':11,fill:'#8d8a84'},a),p);t.textContent=str;return t;};
const GOLDc='#e0b65a', BLUEc='#4d8bff', SIL='#b9c3cf';
// little icon set, reused by the overview strip
function iconBlueprint(p,x,y,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);el('rect',{x:-26,y:-20,width:52,height:40,rx:3,fill:'#1d3b6b'},g);for(let i=1;i<4;i++){el('line',{x1:-26,x2:26,y1:-20+i*10,y2:-20+i*10,stroke:'#3d64a8','stroke-width':.8},g);el('line',{x1:-26+i*13,x2:-26+i*13,y1:-20,y2:20,stroke:'#3d64a8','stroke-width':.8},g);}el('rect',{x:-14,y:-10,width:28,height:20,fill:'none',stroke:'#cfe0ff','stroke-width':1.5},g);return g;}
function iconScreen(p,x,y,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);el('rect',{x:-28,y:-20,width:56,height:36,rx:3,fill:'#26262b',stroke:'#55555c'},g);el('rect',{x:-6,y:16,width:12,height:6,fill:'#55555c'},g);for(let i=0;i<4;i++)el('line',{x1:-20,x2:-20+12+i*7,y1:-12+i*7,y2:-12+i*7,stroke:GOLDc,'stroke-width':2},g);return g;}
function iconWafer(p,x,y,r=22){const g=el('g',{},p);el('circle',{cx:x,cy:y,r,fill:SIL,stroke:'#8f9aa8'},g);const n=Math.floor(r/6);for(let i=-n;i<=n;i++)for(let k=-n;k<=n;k++){const cx=x+i*6,cy=y+k*6;if((i*6)**2+(k*6)**2<(r-5)**2)el('rect',{x:cx-2.4,y:cy-2.4,width:4.8,height:4.8,fill:'#7c5cc4',opacity:.85},g);}return g;}
function iconHBM(p,x,y,n=8,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);for(let i=0;i<n;i++)el('rect',{x:-16,y:-i*5,width:32,height:4,rx:1,fill:i%2?'#3fa36b':'#4fc26b'},g);return g;}
function iconPackage(p,x,y,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);el('rect',{x:-34,y:-16,width:68,height:32,rx:2,fill:'#2f6b3f'},g);el('rect',{x:-12,y:-11,width:24,height:22,fill:'#8a8f99'},g);[-26,18].forEach(dx=>{el('rect',{x:dx,y:-11,width:8,height:10,fill:'#4fc26b'},g);el('rect',{x:dx,y:1,width:8,height:10,fill:'#4fc26b'},g);});return g;}
function iconRack(p,x,y,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);el('rect',{x:-16,y:-26,width:32,height:52,rx:2,fill:'#1f1f23',stroke:'#55555c'},g);for(let i=0;i<6;i++){el('rect',{x:-12,y:-22+i*8,width:24,height:5,fill:'#3a3a40'},g);el('circle',{cx:8,cy:-19.5+i*8,r:1.2,fill:'#4fc26b'},g);}return g;}
function iconCode(p,x,y,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);el('rect',{x:-28,y:-18,width:56,height:36,rx:3,fill:'#1a1a1f',stroke:'#55555c'},g);T_(g,-22,-4,'</>',{fill:GOLDc,'font-size':13,'font-weight':800});T_(g,-22,10,'CUDA',{fill:'#cfcbc3','font-size':10,'font-weight':700});return g;}
function iconEUV(p,x,y,s=1){const g=el('g',{transform:`translate(${x} ${y}) scale(${s})`},p);el('rect',{x:-30,y:-20,width:60,height:40,rx:4,fill:'#d9dde3'},g);el('rect',{x:-30,y:-20,width:60,height:9,fill:'#a9b2be'},g);el('line',{x1:-6,y1:-6,x2:6,y2:12,stroke:'#b58cff','stroke-width':2.5},g);return g;}

// scene 0: intro
{const g=sg('intro');el('path',{d:'M20 120 Q48 76 76 120 Z',fill:'#d8c48f'},g);T_(g,48,138,'sand',{'text-anchor':'middle','font-size':12,fill:'#cfcbc3','font-weight':600});
 el('line',{x1:86,y1:100,x2:236,y2:100,stroke:'#55555c','stroke-width':2,'stroke-dasharray':'5 6'},g);
 const ch=el('g',{class:'stg-travel'},g);el('rect',{x:-9,y:-9,width:18,height:18,rx:2,fill:GOLDc},ch);
 iconRack(g,270,94,1.3);T_(g,270,146,'AI server',{'text-anchor':'middle','font-size':12,fill:'#cfcbc3','font-weight':600});}
// scene 1: design, a blueprint being drawn
{const g=sg('1');iconBlueprint(g,150,85,2.4);const tr=el('path',{class:'stg-draw',d:'M118 62 h64 v46 h-64 z M134 62 v46 M150 62 v46 M166 62 v46 M118 85 h64',fill:'none',stroke:'#fff','stroke-width':2},g);
 tr.style.setProperty('--len',520);
 }
// scene 2: EDA software checking the layout
{const g=sg('2');iconScreen(g,150,82,2.4);const ck=el('g',{class:'stg-blink'},g);el('circle',{cx:205,cy:52,r:10,fill:'#4fc26b'},ck);el('path',{d:'M200 52 l4 4 l7 -8',fill:'none',stroke:'#fff','stroke-width':2.4},ck);
 }
// scene 3: EUV machine prints the pattern on a wafer
{const g=sg('3');el('rect',{x:60,y:36,width:190,height:96,rx:8,fill:'#d9dde3'},g);el('rect',{x:60,y:36,width:190,height:22,rx:8,fill:'#a9b2be'},g);T_(g,155,51,'EUV',{'text-anchor':'middle','font-size':11,fill:'#2b2f36','font-weight':800});
 const beam=el('path',{class:'stg-pulse',d:'M100 70 L150 112 L200 70',fill:'none',stroke:'#b58cff','stroke-width':4,'stroke-linejoin':'round'},g);
 el('ellipse',{cx:150,cy:118,rx:34,ry:7,fill:SIL,stroke:'#8f9aa8'},g);
 }
// scene 4: wafer fab: ingot -> wafer -> layers
{const g=sg('4');el('rect',{x:40,y:56,width:50,height:62,rx:6,fill:SIL,stroke:'#8f9aa8'},g);T_(g,65,138,'ingot',{'text-anchor':'middle'});
 el('path',{d:'M98 87 h22',stroke:'#55555c','stroke-width':2,'marker-end':'url(#ah)'},g);
 const w=iconWafer(g,175,86,40);w.setAttribute('class','stg-spin');w.style.transformOrigin='175px 86px';T_(g,175,145,'300 mm wafer',{'text-anchor':'middle'});
 const lay=el('g',{},g);for(let i=0;i<5;i++){const r=el('rect',{class:'stg-layer',x:250,y:112-i*9,width:36,height:7,fill:['#7c5cc4','#b58cff','#c08a2d','#7c5cc4','#b58cff'][i]},lay);r.style.setProperty('--i',i);}T_(g,268,138,'layers',{'text-anchor':'middle'});
 T_(g,320,110,'steps over two to three months; then',{'font-size':12});}
// scene 5: HBM memory being stacked
{const g=sg('5');for(let i=0;i<12;i++){const r=el('rect',{class:'stg-stack',x:110,y:128-i*8,width:90,height:6,rx:1,fill:i%2?'#3fa36b':'#4fc26b'},g);r.style.setProperty('--i',i);}
 el('line',{x1:130,y1:40,x2:130,y2:134,stroke:'#c08a2d','stroke-width':1.5,'stroke-dasharray':'2 3'},g);el('line',{x1:180,y1:40,x2:180,y2:134,stroke:'#c08a2d','stroke-width':1.5,'stroke-dasharray':'2 3'},g);
 T_(g,155,152,'one HBM stack',{'text-anchor':'middle'});
 }
// scene 6: packaging, the GPU and its HBM slide together
{const g=sg('6');el('rect',{x:40,y:96,width:220,height:22,rx:3,fill:'#2f6b3f'},g);el('rect',{x:62,y:84,width:176,height:12,fill:'#8a6d3b'},g);
 const gpu=el('g',{class:'stg-join',style:'--d:0'},g);el('rect',{x:118,y:46,width:64,height:38,fill:'#8a8f99'},gpu);T_(gpu,150,70,'GPU',{'text-anchor':'middle',fill:'#1a1a1f','font-size':11,'font-weight':800});
 [[72,'-1'],[198,'1']].forEach(([x,dir],k)=>{const h=el('g',{class:'stg-join',style:`--d:${k+1};--dir:${dir}`},g);for(let i=0;i<6;i++)el('rect',{x,y:78-i*6,width:30,height:5,fill:i%2?'#3fa36b':'#4fc26b'},h);});
 T_(g,150,140,'silicon base (CoWoS)',{'text-anchor':'middle'});
 }
// scene 7: rack assembly, 72 chips in one rack
{const g=sg('7');el('rect',{x:110,y:20,width:90,height:136,rx:4,fill:'#1f1f23',stroke:'#55555c'},g);
 for(let i=0;i<9;i++){const tr=el('g',{class:'stg-tray',style:`--i:${i}`},g);el('rect',{x:116,y:26+i*14,width:78,height:10,fill:'#3a3a40'},tr);for(let k=0;k<4;k++)el('rect',{x:121+k*12,y:28+i*14,width:8,height:6,fill:GOLDc},tr);el('circle',{class:'stg-blink',cx:186,cy:31+i*14,r:1.8,fill:'#4fc26b'},tr);}
 }
// scene 8: software
{const g=sg('8');el('rect',{x:60,y:34,width:180,height:108,rx:6,fill:'#1a1a1f',stroke:'#55555c'},g);
 ['import torch','model.to("cuda")','train(model)'].forEach((l,i)=>{const t=T_(g,74,62+i*24,l,{fill:i===1?GOLDc:'#cfcbc3','font-size':12,'font-family':'ui-monospace,Menlo,monospace',class:'stg-type',style:`--i:${i}`});});
 }
// overview for the summary states: two rows of four
{const g=sg('all');const icons=[iconBlueprint,iconScreen,iconEUV,(p,x,y)=>iconWafer(p,x,y,18),(p,x,y)=>iconHBM(p,x,y+14,8),iconPackage,iconRack,iconCode];
 const names=['Design','EDA','Equipment','Wafer fab','Memory','Packaging','Assembly','Software'];
 icons.forEach((f,i)=>{const x=40+(i%4)*80, y=40+Math.floor(i/4)*76;const ig=el('g',{class:'stg-ico','data-k':names[i]},g);f(ig,x,y,.78);T_(ig,x,y+38,names[i],{'text-anchor':'middle','font-size':11,fill:'#cfcbc3'});});}

const CAP={
  none:'<b>From sand to server.</b> Follow one AI chip through eight stops. The picture shows what happens to it at each one.',
  smile:'<b>From sand to server.</b> Follow one AI chip through eight stops. The picture shows what happens to it at each one.',
  '1':'<b>Blueprint.</b> Engineers lay out the chip: Nvidia\u2019s Blackwell has 208 billion transistors.',
  '2':'<b>Design software</b> places every transistor and checks every wire before anything is built.',
  '3':'<b>Lithography.</b> ASML\u2019s EUV machine prints the circuit onto silicon with extreme-ultraviolet light. Only ASML makes them.',
  '4':'<b>Wafer fab.</b> A silicon ingot is sliced into 300 mm wafers, then printed, etched and layered through hundreds of steps over two to three months, and cut into chips.',
  '5a':'<b>Memory.</b> Eight to twelve thin memory chips are stacked and wired straight through, making one HBM stack.',
  '5':'<b>Memory.</b> Eight to twelve thin memory chips are stacked and wired straight through. SK hynix says it\u2019s booked into 2029.',
  '6':'<b>Packaging.</b> The processor and its memory stacks are joined side by side on one silicon base (TSMC\u2019s CoWoS), so data moves fast between them.',
  '7':'<b>Rack assembly.</b> 72 chips go into one server rack, with power, cooling and cables. Foxconn builds over 40% of AI servers.',
  '8':'<b>Software.</b> Developers write AI code for Nvidia\u2019s CUDA, so moving to another chip means rewriting it.',
  real:'<b>The whole journey:</b> eight stops from blueprint to server rack.',
  scarce:'<b>Blue: the bottlenecks.</b> The machines, the fab and the memory are sold out and hard to copy.'};
function setStage(s){
  const key={'smile':'intro','none':'intro','1':'1','2':'2','3':'3','4':'4','5a':'5','5':'5','6':'6','7':'7','8':'8','real':'all','scarce':'all'}[s]||'intro';
  Object.entries(SC).forEach(([k,g])=>g.classList.toggle('on',k===key));
  SC.all.querySelectorAll('.stg-ico').forEach(ic=>{const hot=s==='scarce'&&['Equipment','Wafer fab','Memory'].includes(ic.dataset.k);ic.classList.toggle('hot',hot);ic.classList.toggle('dim',s==='scarce'&&!hot);});
  if(stageCap) stageCap.innerHTML=CAP[s]||'';
  if(stageCap) stageCap.style.display=CAP[s]?'':'none';
}
const title=document.getElementById('chartTitle'), sub=document.getElementById('chartSub');
function setState(s){
  const order=['smile','1','2','3','4','5a','5','6','7','8','real','scarce'];
  const idx=order.indexOf(s);
  smile.setAttribute('opacity', idx>=0?.9:0); smileLbl.setAttribute('opacity', idx>=0 && idx<=4?1:(idx>=10?1:0));
  let shown=0; if(idx>=1) shown=Math.min(8, {1:1,2:2,3:3,4:4,5:4,6:5,7:6,8:7,9:8,10:8,11:8}[idx]);
  const current={1:0,2:1,3:2,4:3,5:4,6:4,7:5,8:6,9:7}[idx];
  dots.forEach((d,i)=>{
    const on=i<shown;
    d.g.style.opacity=on?1:0;
    d.g.style.transform=on?'translateY(0)':`translateY(${H-B-Y(STOPS[i].v)}px)`;
    d.halo.setAttribute('opacity', i===current?.25:0);
    let fill=STOPS[i].hollow?'#0d0d0f':'#e0b65a', stroke='#e0b65a', op=1;
    if(idx>=10 && (STOPS[i].k==='Wafer fab'||STOPS[i].k==='Memory')){fill='#4d8bff';stroke='#4d8bff';d.halo.setAttribute('opacity',.3);d.halo.setAttribute('fill','#4d8bff');}
    else d.halo.setAttribute('fill','#e0b65a');
    if(idx===11 && (STOPS[i].k==='Packaging'||STOPS[i].k==='Assembly')) op=.3;
    if(idx===11 && STOPS[i].k==='Equipment'){fill='#4d8bff';stroke='#4d8bff';}
    d.c.setAttribute('fill',fill); d.c.setAttribute('stroke',stroke); if(on) d.g.style.opacity=op;
  });
  // memory before/after
  const memBefore = s==='5a';
  if(memBefore){ dots[4].g.style.opacity=1; dots[4].g.style.transform=`translateY(${Y(47)-Y(80)}px)`; dots[4].g.querySelector('text').textContent='47¢'; }
  else dots[4].g.querySelector('text').textContent='80¢';
  ghost.setAttribute('opacity', s==='5'?1:0); arrow.setAttribute('opacity', s==='5'?1:0);
  real.style.strokeDashoffset = idx>=10 ? 0 : realLen;
  railEls.forEach((r,i)=>{r.classList.toggle('on',i===current);r.classList.toggle('done',current!==undefined?i<current:(idx>=10));});
  if(idx>=10){title.textContent= idx===11?'Margin follows scarcity':'The 2026 curve vs the textbook smile'; sub.textContent= idx===11?'Blue: bottlenecks that are sold out and hard to copy':'Gold line: what each step actually keeps';}
  else {title.textContent='Profit kept per dollar, by step'; sub.textContent='From idea (left) to customer (right)';}
  setStage(s);
}
setState('none');
const steps=[...document.querySelectorAll('.step')];
const sio=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){steps.forEach(s=>s.classList.remove('on'));e.target.classList.add('on');setState(e.target.dataset.s);}});},{rootMargin:'-45% 0px -45% 0px'});
steps.forEach(s=>sio.observe(s));

/* ---------------- table ---------------- */
const tb=document.getElementById('tbody');
const WHO={Design:'Nvidia',EDA:'Cadence',Equipment:'ASML','Wafer fab':'TSMC',Memory:'SK hynix',Packaging:'ASE',Assembly:'Foxconn',Software:'CUDA (Nvidia)'};
STOPS.forEach(s=>{
  const cls=SCARCE.has(s.k)?'blue':(s.v<30?'grey':'');
  tb.insertAdjacentHTML('beforeend',`<tr><td>${s.k}</td><td>${WHO[s.k]}</td><td style="width:40%"><div class="mbarline"><i class="${cls}" data-w="${s.hollow?0:s.v}" style="width:0;transition:width 1.2s ease"></i></div></td><td class="num">${s.hollow?'—':s.v+'%'}</td></tr>`);
});

/* ---------------- hero animated header (loops like a GIF) ---------------- */
const hs=document.getElementById('heroSvg');
const HX=i=>180+i*(1240/7), HY=v=>630-v*4.4;
for(let v=0;v<=100;v+=25) el('line',{x1:120,x2:1480,y1:HY(v),y2:HY(v),stroke:'#1e1e22'},hs);
const hSmile=el('path',{d:smoothPath(STOPS.map((s,i)=>[HX(i),HY(s.smile)])),fill:'none',stroke:'#5d5a55','stroke-width':3,'stroke-dasharray':'10 10'},hs);
const hReal=el('path',{d:smoothPath(STOPS.map((s,i)=>[HX(i),HY(s.v)]),HY(100),HY(0)),fill:'none',stroke:'#e0b65a','stroke-width':5,'stroke-linecap':'round'},hs);
const hLen=hReal.getTotalLength();hReal.style.strokeDasharray=hLen;
const hDots=STOPS.map((s,i)=>{const g=el('g',{},hs);
  el('circle',{cx:HX(i),cy:HY(s.v),r:14,fill:SCARCE.has(s.k)?'#4d8bff':'#e0b65a',opacity:s.hollow?0:1},g);
  if(s.hollow) el('circle',{cx:HX(i),cy:HY(s.v),r:12,fill:'none',stroke:'#e0b65a','stroke-width':4},g);
  const t=el('text',{x:HX(i),y:HY(s.v)-28,'text-anchor':'middle',fill:'#fff','font-size':26,'font-weight':700,'font-family':'Inter'},g);t.textContent=s.hollow?'':s.txt;
  const k=el('text',{x:HX(i),y:690,'text-anchor':'middle',fill:'#77746e','font-size':20,'font-family':'Inter'},hs);k.textContent=s.k;
  return {g,s,i};});
const hTitle=el('text',{x:120,y:80,fill:'#fff','font-size':34,'font-weight':700,'font-family':'Inter'},hs);hTitle.textContent='Who keeps each dollar of an AI chip';
const hSub=el('text',{x:120,y:118,fill:'#8d8a84','font-size':20,'font-family':'Inter'},hs);hSub.textContent='Dashed: the textbook smile · Gold: 2026';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut=t=>1-Math.pow(1-t,3), easeBack=t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
function heroFrame(now){
  const T=reduced?6.5:((now/1000)%9);   // 9-second loop
  hSmile.style.opacity = Math.min(1,T/0.6) * (T>8.4?Math.max(0,(9-T)/0.6):1);
  hDots.forEach(({g,s,i})=>{
    const t0=0.8+i*0.32, p=Math.min(1,Math.max(0,(T-t0)/0.7));
    const fade=T>8.4?Math.max(0,(9-T)/0.6):1;
    const y=(1-easeBack(p))*(630-HY(s.v));
    g.setAttribute('transform',`translate(0 ${y.toFixed(1)})`); g.style.opacity=(p>0?Math.min(1,p*3):0)*fade;
  });
  const lp=Math.min(1,Math.max(0,(T-4.0)/1.6)); hReal.style.strokeDashoffset=hLen*(1-easeOut(lp));
  hReal.style.opacity=T>8.4?Math.max(0,(9-T)/0.6):1;
  if(!reduced) requestAnimationFrame(heroFrame);
}
requestAnimationFrame(heroFrame);

/* ---------------- reveal + counters ---------------- */
function countUp(el){
  const to=+el.dataset.count, fmt=el.dataset.fmt, t0=performance.now(), d=1400;
  (function f(t){const p=Math.min(1,Math.max(0,(t-t0)/d)), v=to*easeOut(p);
    el.textContent = fmt==='t' ? '$'+v.toFixed(2)+'T' : '$'+v.toFixed(1)+'B';
    if(p<1) requestAnimationFrame(f);})(t0);
}
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting) return;
  e.target.classList.add('in-view'); rio.unobserve(e.target);
  e.target.querySelectorAll('.mbar').forEach(b=>b.style.height=b.dataset.h+'%');
  e.target.querySelectorAll('[data-count]').forEach(countUp);
  e.target.querySelectorAll('.mbarline i').forEach(b=>b.style.width=b.dataset.w+'%');
}),{threshold:.25});
document.querySelectorAll('.rv, #qs').forEach(e=>rio.observe(e));

/* ---------------- progress bar + TOC ---------------- */
const prog=document.getElementById('prog'), tocLinks=[...document.querySelectorAll('#toc a')];
const secs=tocLinks.map(a=>document.querySelector(a.getAttribute('href')));
addEventListener('scroll',()=>{
  const h=document.documentElement; prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=0; secs.forEach((s,i)=>{if(s && s.getBoundingClientRect().top<innerHeight*.35) cur=i;});
  tocLinks.forEach((a,i)=>a.classList.toggle('on',i===cur));
},{passive:true});
tocLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});}));

/* ---------------- small bits ---------------- */
document.getElementById('copyLink').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);e.target.textContent='Copied';}catch(_){e.target.textContent='Copy from address bar';}});
