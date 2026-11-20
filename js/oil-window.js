const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- hero: one timestamp ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  for(let i=0;i<=18;i++) el('line',{x1:0,y1:i*40,x2:1600,y2:i*40,stroke:'#1b1b1e','stroke-width':2},s);
  txt(s,120,92,'Who sets the price of oil?',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,132,'A price reporting agency, once a day, at one timestamp',{fill:'#8d8a84','font-size':21});
  // ring and clock
  const cx=400,cy=410,r=190,C=2*Math.PI*r;
  el('circle',{cx,cy,r,fill:'none',stroke:'#26262a','stroke-width':16},s);
  const arc=el('circle',{cx,cy,r,fill:'none',stroke:'#e0b65a','stroke-width':16,'stroke-linecap':'round','stroke-dasharray':C,'stroke-dashoffset':reduced?0:C,transform:`rotate(-90 ${cx} ${cy})`},s);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;el('line',{x1:cx+Math.sin(a)*(r-34),y1:cy-Math.cos(a)*(r-34),x2:cx+Math.sin(a)*(r-20),y2:cy-Math.cos(a)*(r-20),stroke:'#5d5a55','stroke-width':3},s);}
  txt(s,cx,cy+34,'16:30',{fill:'#fff','font-size':110,'font-weight':800,'text-anchor':'middle'});
  txt(s,cx,cy+80,'London · Singapore',{fill:'#8d8a84','font-size':26,'text-anchor':'middle'});
  // right: three numbers
  txt(s,800,300,'~78%',{fill:'#e0b65a','font-size':140,'font-weight':800});
  txt(s,800,350,'of exported crude is priced off Brent,',{fill:'#fff','font-size':30,'font-weight':700});
  txt(s,800,388,'directly or indirectly',{fill:'#fff','font-size':30,'font-weight':700});
  txt(s,800,424,'Energy Intelligence, via ICE. Other estimates: about two-thirds.',{fill:'#8d8a84','font-size':20});
  txt(s,800,540,'25,000 barrels',{fill:'#cfcbc3','font-size':64,'font-weight':800});
  txt(s,800,582,'the size of one Dubai trade ("partial"). Twenty make a cargo.',{fill:'#fff','font-size':24,'font-weight':600});
  txt(s,800,618,'Dated Brent is assessed at 16:30 London time,',{fill:'#8d8a84','font-size':20});
  txt(s,800,644,'Platts Dubai at 16:30 Singapore time.',{fill:'#8d8a84','font-size':20});
  if(reduced) return;
  const t0=performance.now()+300,dur=2600;
  (function step(now){const p=Math.max(0,Math.min(1,(now-t0)/dur));const e=1-Math.pow(1-p,3);arc.setAttribute('stroke-dashoffset',C*(1-e));if(p<1)requestAnimationFrame(step);})(performance.now());
})();

/* ---------------- scrolly: the shrinking basket (thousand barrels a day) ---------------- */
(function(){
  const s=document.getElementById('basketChart'); if(!s) return;
  // [label, value, shown text, colour, first step it appears at]
  const ROWS=[
    ['Brent field, 1982 peak',504,'504','#e0b65a',0],
    ['BFOE loadings, 2006',1400,'over 1,400','#e0b65a',1],
    ['BFOE loadings, 2016',948,'948','#c2412d',2],
    ['…with Troll added, 2016',1200,'~1,200','#4d8bff',3],
    ['Five grades, Dec 2020',850,'850','#cfcbc3',4],
    ['Five grades, early 2023',700,'under 700','#c2412d',4],
    ['WTI Midland to Europe, 2022',800,'over 800','#4d8bff',5]
  ];
  const L=212,W=330,MAX=1500,Y0=34,H=44; const rows=[];
  ROWS.forEach((r,i)=>{
    const g=el('g',{class:'row',opacity:0},s), y=Y0+i*H;
    txt(g,L-10,y+19,r[0],{fill:'#cfcbc3','font-size':13,'text-anchor':'end'});
    el('rect',{x:L,y:y,width:W,height:26,fill:'#17171a'},g);
    const bar=el('rect',{class:'bar',x:L,y:y,width:W*r[1]/MAX,height:26,fill:r[3]},g);
    if(!reduced) bar.style.transform='scaleX(0)';
    txt(g,L+W*r[1]/MAX+8,y+19,r[2],{fill:'#fff','font-size':13,'font-weight':700});
    rows.push({g,bar,at:r[4]});
  });
  txt(s,L,Y0+ROWS.length*H+14,'Thousand barrels a day. Bars with "over" or "under" are drawn at the stated figure.',{fill:'#8d8a84','font-size':11});
  const state=i=>rows.forEach(r=>{const on=i>=r.at;r.g.setAttribute('opacity',on?1:0);r.bar.style.transform=on||reduced?'scaleX(1)':'scaleX(0)';});
  state(reduced?99:-1);
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
