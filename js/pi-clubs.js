const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Layers of the 2024/25 programme, bottom to top: [name, size label, relative height in px, colour]. Not to scale. */
const LAYERS=[
  {k:'club', n:'Club', a:'first $10m', c:'#4d8bff', h:36},
  {k:'pool', n:'Pool', a:'$90m above $10m', c:'#2f9a8a', h:56},
  {k:'gxl',  n:'Reinsurance (GXL)', a:'$2bn above $100m', c:'#e0b65a', h:120},
  {k:'ovs',  n:'Overspill', a:'$1bn on top', c:'#cfcbc3', h:64}
];

/* ---------------- hero: the tower and the Dali claim ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  for(let i=0;i<=18;i++) el('line',{x1:0,y1:i*40,x2:1600,y2:i*40,stroke:'#1b1b1e','stroke-width':2},s);
  txt(s,120,92,'Who insures the world’s ships?',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,132,'12 mutual clubs share one tower of cover, about $3.1bn deep (2024/25 layers)',{fill:'#8d8a84','font-size':21});
  txt(s,120,300,'~90%',{fill:'#e0b65a','font-size':150,'font-weight':800});
  txt(s,120,352,'of the world’s ocean-going tonnage',{fill:'#fff','font-size':32,'font-weight':700});
  txt(s,120,392,'covered for liability by the International Group of P&I Clubs',{fill:'#8d8a84','font-size':22});
  txt(s,120,500,'Dali, Baltimore, March 2024: reserved at more than $2.8bn',{fill:'#cfcbc3','font-size':26});
  txt(s,120,540,'the first claim ever to reach the top layer',{fill:'#c2412d','font-size':26,'font-weight':700});
  // tower
  const X=1050,W=260,BOT=640,SC=1.0; let y=BOT; const tops={};
  const g=el('g',{},s);
  LAYERS.forEach(L=>{const h=L.h*1.6; y-=h; tops[L.k]={y,h};
    el('rect',{x:X,y,width:W,height:h,fill:'#17171a',stroke:L.c,'stroke-width':3},g);
    txt(g,X-18,y+h/2+6,L.a,{fill:'#8d8a84','font-size':20,'text-anchor':'end'});
    txt(g,X+W+18,y+h/2+6,L.n,{fill:L.c,'font-size':22,'font-weight':700});});
  const top=y, h0=BOT-top;
  // fill: club, pool, gxl full, overspill 70%
  const fills=[];
  LAYERS.forEach(L=>{const t=tops[L.k]; const frac=L.k==='ovs'?.7:1; const hh=t.h*frac;
    fills.push(el('rect',{x:X+4,y:t.y+t.h-hh,width:W-8,height:reduced?hh-0:0,fill:'#c2412d',opacity:.9},g)); fills[fills.length-1]._t={y:t.y+t.h-hh,h:hh};});
  txt(g,X+W/2,top-16,'$2.8bn+ reserved',{fill:'#c2412d','font-size':26,'font-weight':800,'text-anchor':'middle'});
  if(reduced){fills.forEach(f=>{f.setAttribute('y',f._t.y);f.setAttribute('height',f._t.h);});return;}
  // animate fill from bottom to top, layer by layer
  const t0=performance.now()+400,dur=3200;
  const tot=fills.reduce((a,f)=>a+f._t.h,0);
  (function step(now){
    let p=Math.max(0,Math.min(1,(now-t0)/dur)),used=p*tot;
    fills.forEach(f=>{const hh=Math.max(0,Math.min(f._t.h,used));used-=hh;
      const base=f._t.y+f._t.h;f.setAttribute('height',hh);f.setAttribute('y',base-hh);});
    if(p<1)requestAnimationFrame(step);
  })(performance.now());
})();

/* ---------------- scrolly: the tower, layer by layer ---------------- */
(function(){
  const s=document.getElementById('towerChart'); if(!s) return;
  const X=230,W=170,BOT=320; let y=BOT; const G={};
  LAYERS.forEach(L=>{
    y-=L.h; const g=el('g',{class:'lyr',opacity:.35},s);
    el('rect',{x:X,y,width:W,height:L.h,fill:'#17171a',stroke:L.c,'stroke-width':2},g);
    const f=el('rect',{class:'fill',x:X+3,y:y+L.h,width:W-6,height:0,fill:'#c2412d',opacity:.9},g);
    txt(g,X-12,y+L.h/2+5,L.a,{fill:'#cfcbc3','font-size':13,'text-anchor':'end'});
    txt(g,X+W+12,y+L.h/2+5,L.n,{fill:L.c,'font-size':14,'font-weight':700});
    G[L.k]={g,f,y,h:L.h};
  });
  // tick: first reserve of ~$1.5bn sits about 70% up the reinsurance layer
  const gx=G.gxl, tickY=gx.y+gx.h*(1-0.7);
  const tick=el('g',{opacity:0},s);
  el('line',{x1:X-6,y1:tickY,x2:X+W+6,y2:tickY,stroke:'#fff','stroke-width':2,'stroke-dasharray':'4 3'},tick);
  txt(tick,X+W+12,tickY-4,'~$1.5bn first reserve',{fill:'#fff','font-size':12});
  const flag=el('text',{x:X+W/2,y:36,'text-anchor':'middle','font-family':'Inter','font-size':16,'font-weight':800,fill:'#c2412d',opacity:0},s);
  flag.textContent='$2.8bn+ reserved';
  const setFill=(k,frac)=>{const o=G[k];const hh=o.h*frac;o.f.style.height=hh+'px';o.f.style.y=(o.y+o.h-hh)+'px';o.f.setAttribute('height',hh);o.f.setAttribute('y',o.y+o.h-hh);};
  const state=i=>{
    const hi=[['club'],['pool'],['gxl'],['ovs'],['ovs']][Math.max(i,0)];
    Object.keys(G).forEach(k=>G[k].g.setAttribute('opacity',i<0||hi.includes(k)?1:.35));
    const lv={club:0,pool:0,gxl:0,ovs:0};
    if(i>=0)lv.club=1; if(i>=1)lv.pool=1; if(i>=2)lv.gxl=.7; if(i>=3)lv.gxl=1; if(i>=4)lv.ovs=.7;
    if(i===0)lv.club=1;
    Object.keys(lv).forEach(k=>setFill(k,lv[k]));
    tick.setAttribute('opacity',i===2?1:0); flag.setAttribute('opacity',i>=4?1:0);
    if(i===4)Object.keys(G).forEach(k=>G[k].g.setAttribute('opacity',1));
  };
  state(-1);
  const steps=[...document.querySelectorAll('.step')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach(x=>x.classList.remove('on'));e.target.classList.add('on');state(+e.target.dataset.s);}}),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(x=>io.observe(x));
})();

/* ---------------- reveal on scroll ---------------- */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add('in-view');rio.unobserve(e.target);
  e.target.querySelectorAll('.mbar').forEach(b=>b.style.height=b.dataset.h+'%');
  e.target.querySelectorAll('.ltrack i[data-w]').forEach(b=>b.style.width=b.dataset.w+'%');
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
tocLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:reduced?'auto':'smooth'});}));
document.getElementById('copyLink').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);e.target.textContent='Copied';}catch(_){e.target.textContent='Copy from address bar';}});
