const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* World iodine sales by producer group, 2024, % (SQM Form 20-F). Squares rounded so the grid sums to 100;
   the last group is the remainder (my arithmetic), and the groups overlap with recycling. */
const CATS=[
  {k:'sqm', n:'SQM (Chile)', a:'37%', sq:37, c:'#4d8bff'},
  {k:'chl', n:'Four other Chilean producers', a:'23%', sq:23, c:'#2f9a8a'},
  {k:'jpn', n:'Eight Japanese producers', a:'23%', sq:23, c:'#c2412d'},
  {k:'usa', n:'US producers', a:'~5%', sq:5, c:'#e0b65a'},
  {k:'rst', n:'Everyone else (remainder)', a:'~12%', sq:12, c:'#5d5a55'}
];
const PROD=[['Chile',23000,'#4d8bff'],['Japan',9000,'#c2412d'],['Turkmenistan',800,'#e0b65a'],['Iran',700,'#e0b65a'],['Azerbaijan',210,'#e0b65a'],['Indonesia',50,'#e0b65a'],['Russia',8,'#e0b65a']];

/* ---------------- hero: who digs up the world's iodine ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  for(let i=0;i<=18;i++) el('line',{x1:0,y1:i*40,x2:1600,y2:i*40,stroke:'#1b1b1e','stroke-width':2},s);
  txt(s,120,92,'The crystal behind your scan and your screen',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,132,'Reported iodine production by country, 2025, tonnes (USGS; US output withheld)',{fill:'#8d8a84','font-size':21});
  txt(s,120,300,'~2/3',{fill:'#e0b65a','font-size':150,'font-weight':800});
  txt(s,120,352,'of world iodine comes from one Chilean desert',{fill:'#fff','font-size':32,'font-weight':700});
  txt(s,120,392,'excluding the US, whose output is not published',{fill:'#8d8a84','font-size':22});
  const X=640,Y0=420,H=24,G=16,W=760; const bars=[];
  PROD.forEach((p,i)=>{
    const y=Y0+i*(H+G)-10, w=Math.max(3,W*p[1]/23000);
    txt(s,120,y+H-4,p[0],{fill:'#cfcbc3','font-size':22,'font-weight':600});
    const r=el('rect',{x:X,y,width:reduced?w:0,height:H,fill:p[2]},s); r._w=w; bars.push(r);
    txt(s,X+w+14,y+H-4,p[1].toLocaleString('en-US'),{fill:p[2],'font-size':22,'font-weight':800});
  });
  txt(s,120,706,'Graphic: Jun Wei Heung. China and Uzbekistan also produce, but output is not officially reported.',{fill:'#5d5a55','font-size':16});
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
  const big=txt(s,430,100,'',{fill:'#fff','font-size':54,'font-weight':800});
  const nm=txt(s,430,130,'',{fill:'#cfcbc3','font-size':16,'font-weight':700});
  const sm=txt(s,430,152,'',{fill:'#8d8a84','font-size':13});
  txt(s,430,300,'1 square ≈ 1% of 2024 sales',{fill:'#8d8a84','font-size':12});
  txt(s,430,318,'Rounded; see note below',{fill:'#8d8a84','font-size':12});
  const sub=['One company, about a third.','Together with SQM: about 60%.','Brine from gas fields.','Brine in Oklahoma.','Not itemised in the filing.'];
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
