const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- hero: 100 threads, about 90 of them one company's ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  // faint woven background
  for(let i=0;i<=18;i++){
    el('line',{x1:0,y1:i*40,x2:1600,y2:i*40,stroke:'#1b1b1e','stroke-width':2},s);
  }
  for(let i=0;i<=40;i++){
    el('line',{x1:i*40,y1:0,x2:i*40,y2:720,stroke:'#1b1b1e','stroke-width':2},s);
  }
  txt(s,120,92,'Who makes the glass cloth inside AI chips?',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,132,'100 squares = 100% of high-end T-glass supply, TrendForce estimate',{fill:'#8d8a84','font-size':21});
  const X0=120,Y0=190,C=44,G=8, cells=[];
  for(let i=0;i<100;i++){
    const r=Math.floor(i/10), c=i%10;
    const gold=i<90;
    const q=el('rect',{x:X0+c*(C+G),y:Y0+r*(C+G),width:C,height:C,fill:gold?'#e0b65a':'#5d5a55',opacity:reduced?1:0},s);
    cells.push(q);
  }
  const g=el('g',{opacity:reduced?1:0},s);
  txt(g,760,330,'~90%',{fill:'#e0b65a','font-size':150,'font-weight':800});
  txt(g,760,382,'Nittobo, Japan',{fill:'#fff','font-size':36,'font-weight':700});
  txt(g,760,424,'also an estimated 60–70% of the next grade down (NER glass)',{fill:'#8d8a84','font-size':22});
  txt(g,760,520,'Lead time for the laminate it goes into: 8–10 weeks → 20+',{fill:'#cfcbc3','font-size':24});
  if(reduced) return;
  cells.forEach((q,i)=>setTimeout(()=>{q.style.transition='opacity .4s ease';q.setAttribute('opacity',1);},300+i*22));
  setTimeout(()=>{g.style.transition='opacity 1s ease';g.setAttribute('opacity',1);},2600);
})();

/* ---------------- scrolly: the package stack ---------------- */
(function(){
  const s=document.getElementById('stackChart'); if(!s) return;
  const W=640;
  const layers=[];
  function layer(id,y,h,fill,label,x=60,w=520){
    const g=el('g',{class:'layer',opacity:.25},s);
    el('rect',{x,y,width:w,height:h,fill,stroke:'#5d5a55','stroke-width':1.5},g);
    txt(g,x+14,y+h/2+5,label,{fill:'#0d0d0f','font-size':15,'font-weight':700});
    layers[id]=g; return g;
  }
  // chip + memory
  const top=el('g',{class:'layer',opacity:.25},s);
  el('rect',{x:150,y:50,width:170,height:44,fill:'#cfcbc3'},top);
  txt(top,165,78,'GPU chip',{fill:'#0d0d0f','font-size':15,'font-weight':700});
  [330,385,440,495].forEach(x=>el('rect',{x,y:50,width:46,height:44,fill:'#8d8a84'},top));
  txt(top,330,112,'HBM memory stacks',{fill:'#8d8a84','font-size':11});
  layers[0]=top;
  layer(1,120,34,'#b9d0e8','Silicon interposer');
  // substrate: flat and warped versions
  const sub=el('g',{class:'layer',opacity:.25},s); layers[2]=sub;
  el('rect',{x:60,y:170,width:520,height:12,fill:'#e0b65a'},sub);
  el('rect',{x:60,y:182,width:520,height:44,fill:'#d9c08a'},sub);
  for(let i=0;i<26;i++)el('line',{x1:60+i*20,y1:182,x2:60+i*20,y2:226,stroke:'#b08a3a','stroke-width':1},sub);
  for(let i=0;i<3;i++)el('line',{x1:60,y1:194+i*14,x2:580,y2:194+i*14,stroke:'#b08a3a','stroke-width':1},sub);
  el('rect',{x:60,y:226,width:520,height:12,fill:'#e0b65a'},sub);
  txt(sub,70,262,'Package substrate: glass cloth + resin core (T-glass)',{fill:'#e0b65a','font-size':13,'font-weight':600});
  // warped
  const warp=el('g',{class:'layer',opacity:0},s); layers[5]=warp;
  el('path',{d:'M60 160 Q320 214 580 160 L580 184 Q320 238 60 184 Z',fill:'#c2412d'},warp);
  txt(warp,70,262,'Warped when hot: solder joints crack, yield drops',{fill:'#c2412d','font-size':13,'font-weight':600});
  // board
  layer(3,282,52,'#d9d6cf','Circuit board (low-Dk glass layers)');
  txt(s,60,26,'Cross-section, simplified (not to scale)',{fill:'#8d8a84','font-size':12});
  const state=i=>{
    const op=i<0?[.85,.85,.85,.85,0]:[0,1,2,3].map(k=>k===i?1:.3).concat([0]);
    if(i===4){op[2]=0;op[4]=1;}
    [0,1,2,3].forEach(k=>layers[k].setAttribute('opacity',op[k]));
    layers[5].setAttribute('opacity',op[4]);
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
  e.target.querySelectorAll('.ltrack i').forEach(b=>b.style.width=b.dataset.w+'%');
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
