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
