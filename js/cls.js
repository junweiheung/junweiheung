const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* How a typical April 2025 day of FX obligations (>$14tn) was settled, % (BIS). Squares rounded to sum to 100. */
const CATS=[
  {k:'pvp', n:'Payment-versus-payment', a:'36%', sq:36, c:'#4d8bff'},
  {k:'net', n:'Netted before settling', a:'15%', sq:15, c:'#2f9a8a'},
  {k:'grp', n:'Inside one banking group', a:'>35%', sq:36, c:'#8d8a84'},
  {k:'tim', n:'Timing controls', a:'3%', sq:3, c:'#e0b65a'},
  {k:'gro', n:'Gross, no safeguard', a:'10%', sq:10, c:'#c2412d'}
];

/* ---------------- hero: the settlement mix as one bar ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  for(let i=0;i<=18;i++) el('line',{x1:0,y1:i*40,x2:1600,y2:i*40,stroke:'#1b1b1e','stroke-width':2},s);
  txt(s,120,92,'The bank behind the currency market',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,132,'How a day of foreign-exchange obligations gets settled (BIS, April 2025)',{fill:'#8d8a84','font-size':21});
  txt(s,120,300,'$14tn+',{fill:'#e0b65a','font-size':150,'font-weight':800});
  txt(s,120,352,'of currency payments come due every day',{fill:'#fff','font-size':32,'font-weight':700});
  txt(s,120,392,'only 36% settle with both sides locked together, and $1.4tn has no safeguard',{fill:'#8d8a84','font-size':22});
  const X=120,W=1360,Y=470,H=70; let x=X; const bars=[];
  CATS.forEach(c=>{
    const w=W*c.sq/100;
    const r=el('rect',{x,y:Y,width:reduced?w-3:0,height:H,fill:c.c},s); r._w=w-3; bars.push(r);
    if(c.sq>=10){ txt(s,x+8,Y+H+34,c.a,{fill:c.c,'font-size':30,'font-weight':800}); txt(s,x+8,Y+H+62,c.n,{fill:'#cfcbc3','font-size':18}); }
    x+=w;
  });
  txt(s,120,Y-18,'Labels for the 3% slice (timing controls) omitted for space. Graphic: Jun Wei Heung.',{fill:'#5d5a55','font-size':16});
  txt(s,120,660,'One of those safeguards is a single bank in New York that settles 18 currencies at once.',{fill:'#cfcbc3','font-size':24});
  if(reduced) return;
  const t0=performance.now()+300,dur=2600;
  (function step(now){
    const p=Math.max(0,Math.min(1,(now-t0)/dur)),e=1-Math.pow(1-p,3);
    bars.forEach(b=>b.setAttribute('width',(b._w*e).toFixed(1)));
    if(p<1)requestAnimationFrame(step);
  })(performance.now());
})();

/* ---------------- scrolly: the waffle ---------------- */
(function(){
  const s=document.getElementById('waffle'); if(!s) return;
  const sq=[]; CATS.forEach(c=>{for(let i=0;i<c.sq;i++)sq.push(c);});
  const rects=sq.map((c,i)=>{
    const col=i%10,row=Math.floor(i/10);
    return {c,r:el('rect',{class:'sq',x:40+col*34,y:30+row*29,width:30,height:25,fill:c.c,opacity:.9},s)};
  });
  const lab=el('g',{},s);
  const big=txt(s,430,100,'',{fill:'#fff','font-size':54,'font-weight':800});
  const nm=txt(s,430,130,'',{fill:'#cfcbc3','font-size':16,'font-weight':700});
  const sm=txt(s,430,152,'',{fill:'#8d8a84','font-size':13});
  txt(s,430,300,'1 square ≈ 1% of the day',{fill:'#8d8a84','font-size':12});
  txt(s,430,318,'Rounded so 100 squares add up',{fill:'#8d8a84','font-size':12});
  const sub=['Locked both ways, no exposure.','Cut down before it moves.','Both sides sit in one group.','Safeguards, but not eliminated.','Full trade value at risk for a while.'];
  const state=i=>{
    const order=CATS.map(c=>c.k);
    rects.forEach(({c,r})=>{
      const ci=order.indexOf(c.k);
      r.setAttribute('opacity',i<0?.9:(ci===i?1:(ci<i?.5:.12)));
    });
    if(i<0){big.textContent='';nm.textContent='';sm.textContent='';return;}
    const c=CATS[i]; big.textContent=c.a; big.setAttribute('fill',c.c); nm.textContent=c.n; sm.textContent=sub[i];
  };
  state(-1);
  const steps=[...document.querySelectorAll('.step')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach(x=>x.classList.remove('on'));e.target.classList.add('on');state(+e.target.dataset.s);}}),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(x=>io.observe(x));
})();

/* ---------------- reveal on scroll ---------------- */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add('in-view');rio.unobserve(e.target);
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
