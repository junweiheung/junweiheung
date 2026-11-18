const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut=t=>1-Math.pow(1-t,3);

/* ---------------- hero: pledge vs plan vs running, squares drawn to scale by GW ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  txt(s,120,92,'Pledged, planned, running',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,132,'Stargate power capacity, gigawatts · areas drawn to scale',{fill:'#8d8a84','font-size':21});
  const BASE=640, LEFT=120, MAX=470;                       // squares share a bottom-left corner
  const side=gw=>MAX*Math.sqrt(gw/10);
  const tiers=[
    {gw:10, fill:'none', stroke:'#77746e', dash:'10 8', label:'10 GW', sub:'Target, end of 2025', col:'#cfcbc3'},
    {gw:7,  fill:'#2a2926', stroke:'#5d5a55', dash:'',   label:'~7 GW', sub:'Planned across six US sites, Sep 2025', col:'#cfcbc3'},
    {gw:0.6,fill:'#e0b65a', stroke:'none',   dash:'',    label:'~0.6 GW', sub:'Running at Abilene, Sep 2026 (tracker estimate)', col:'#e0b65a'},
  ];
  const parts=tiers.map((t,i)=>{
    const a=side(t.gw);
    const r=el('rect',{x:LEFT,y:BASE-a,width:a,height:a,fill:t.fill,stroke:t.stroke,'stroke-width':3,'stroke-dasharray':t.dash,opacity:0},s);
    const ly=[230,330,560][i];
    const g=el('g',{opacity:0},s);
    el('line',{x1:LEFT+a,y1:Math.max(BASE-a+30,ly-10),x2:820,y2:ly-10,stroke:t.col,'stroke-width':1.5,opacity:.6},g);
    txt(g,840,ly,t.label,{fill:t.col,'font-size':44,'font-weight':700});
    txt(g,840,ly+34,t.sub,{fill:'#8d8a84','font-size':21});
    return {r,g};
  });
  txt(s,840,470,'US$500B promised  ·  joint venture staff in Feb 2026: reportedly none',{fill:'#77746e','font-size':20});
  if(reduced){parts.forEach(p=>{p.r.setAttribute('opacity',1);p.g.setAttribute('opacity',1);});return;}
  parts.forEach((p,i)=>{
    setTimeout(()=>{p.r.style.transition='opacity .9s ease';p.g.style.transition='opacity .9s ease .3s';p.r.setAttribute('opacity',1);p.g.setAttribute('opacity',1);},400+i*1100);
  });
})();

/* ---------------- Part 1 illustration: four men at the Roosevelt Room podium ---------------- */
(function(){
  const s=document.getElementById('stageSvg'); if(!s) return;
  const FLOOR=402;
  // room: wall, wainscot, door, framed picture, flags, carpet
  el('rect',{x:0,y:0,width:800,height:460,fill:'#ebe5d8'},s);
  el('rect',{x:0,y:330,width:800,height:72,fill:'#e2dbcb'},s);
  el('line',{x1:0,y1:330,x2:800,y2:330,stroke:'#d2c9b5','stroke-width':3},s);
  el('rect',{x:300,y:40,width:150,height:362,fill:'#5a3a26'},s);
  el('rect',{x:288,y:30,width:174,height:12,fill:'#f4efe4'},s);
  [[312,58,58,130],[380,58,58,130],[312,206,58,180],[380,206,58,180]].forEach(([x,y,w,h])=>el('rect',{x,y,width:w,height:h,fill:'none',stroke:'#3f2819','stroke-width':3},s));
  el('rect',{x:600,y:70,width:84,height:70,fill:'#f4efe4',stroke:'#8a6d3b','stroke-width':4},s);
  el('path',{d:'M618 106 h48 M632 98 l10 8 l10 -8',stroke:'#3a5a9a','stroke-width':4,fill:'none'},s);
  const flag=(x)=>{el('line',{x1:x,y1:20,x2:x,y2:FLOOR,stroke:'#b8892b','stroke-width':4},s);
    const g=el('g',{class:'flag'},s); g.style.transformOrigin=`${x}px 40px`;
    for(let i=0;i<7;i++)el('rect',{x:x+2,y:40+i*14,width:46,height:14,fill:i%2?'#f4efe4':'#b23a2e'},g);
    el('rect',{x:x+2,y:40,width:22,height:42,fill:'#2b3f73'},g);};
  flag(22); flag(752);
  el('rect',{x:0,y:FLOOR,width:800,height:58,fill:'#cbbd9c'},s);
  for(let x=10;x<800;x+=26)el('circle',{cx:x,cy:FLOOR+20,r:2,fill:'#b7a885'},s);

  const SKIN='#efc8a2';
  function person(x,o){
    const sh=o.sh, hip=sh+108, hy=sh-34;
    const g=el('g',{class:'who'},s); g.style.animationDelay=o.delay+'s';
    // legs and shoes
    el('rect',{x:x-17,y:hip-4,width:15,height:FLOOR-hip,fill:o.pants},g);
    el('rect',{x:x+2,y:hip-4,width:15,height:FLOOR-hip,fill:o.pants},g);
    el('ellipse',{cx:x-11,cy:FLOOR-2,rx:13,ry:6,fill:o.shoes},g);
    el('ellipse',{cx:x+11,cy:FLOOR-2,rx:13,ry:6,fill:o.shoes},g);
    // neck, jacket, shirt, tie, lapels
    el('rect',{x:x-8,y:hy+16,width:16,height:24,fill:SKIN},g);
    el('path',{d:`M${x-36} ${sh+14} Q${x-36} ${sh} ${x-22} ${sh-2} L${x+22} ${sh-2} Q${x+36} ${sh} ${x+36} ${sh+14} L${x+31} ${hip+6} L${x-31} ${hip+6} Z`,fill:o.suit},g);
    el('path',{d:`M${x-13} ${sh-2} L${x+13} ${sh-2} L${x} ${sh+48} Z`,fill:'#f7f5f0'},g);
    el('path',{d:`M${x} ${sh+4} l-5 6 l3 34 l2 6 l2 -6 l3 -34 z`,fill:o.tie},g);
    el('path',{d:`M${x-13} ${sh-2} L${x-4} ${sh+52} M${x+13} ${sh-2} L${x+4} ${sh+52}`,stroke:'rgba(0,0,0,.35)','stroke-width':2,fill:'none'},g);
    // arms
    if(o.podium){
      el('path',{d:`M${x-33} ${sh+10} L${x-40} ${sh+62} L${x-20} ${sh+92}`,stroke:o.suit,'stroke-width':17,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},g);
      const arm=el('g',{class:'gesture'},g); arm.style.transformOrigin=`${x+33}px ${sh+10}px`;
      el('path',{d:`M${x+33} ${sh+10} L${x+52} ${sh+52} L${x+76} ${sh+38}`,stroke:o.suit,'stroke-width':17,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},arm);
      el('circle',{cx:x+82,cy:sh+35,r:9,fill:SKIN},arm);
    }else{
      el('path',{d:`M${x-33} ${sh+10} L${x-37} ${sh+64} L${x-7} ${sh+94}`,stroke:o.suit,'stroke-width':16,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},g);
      el('path',{d:`M${x+33} ${sh+10} L${x+37} ${sh+64} L${x+7} ${sh+94}`,stroke:o.suit,'stroke-width':16,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},g);
      el('ellipse',{cx:x,cy:sh+96,rx:13,ry:9,fill:SKIN},g);
    }
    // head
    el('circle',{cx:x-20,cy:hy+2,r:5,fill:SKIN},g);
    el('circle',{cx:x+20,cy:hy+2,r:5,fill:SKIN},g);
    el('ellipse',{cx:x,cy:hy,rx:20,ry:24,fill:SKIN},g);
    o.hair(g,x,hy);
    const eyes=el('g',{class:'eyes'},g); eyes.style.transformOrigin=`${x}px ${hy-2}px`; eyes.style.animationDelay=(o.delay*1.7)+'s';
    el('circle',{cx:x-7,cy:hy-2,r:2.2,fill:'#222'},eyes); el('circle',{cx:x+7,cy:hy-2,r:2.2,fill:'#222'},eyes);
    if(o.podium){const m=el('ellipse',{class:'talk',cx:x,cy:hy+12,rx:5,ry:3,fill:'#7a3b2e'},g);m.style.transformOrigin=`${x}px ${hy+12}px`;}
    else el('path',{d:`M${x-5} ${hy+12} q5 ${o.smile} 10 0`,stroke:'#7a3b2e','stroke-width':2,fill:'none','stroke-linecap':'round'},g);
    // name tag on the carpet
    txt(s,x,FLOOR+42,o.name,{'text-anchor':'middle','font-size':13,'font-weight':700,fill:'#111'});
    txt(s,x,FLOOR+56,o.org,{'text-anchor':'middle','font-size':11,fill:'#5d5a55'});
  }
  const hair={
    swoop:(g,x,y)=>el('path',{d:`M${x-21} ${y-4} Q${x-24} ${y-32} ${x+2} ${y-29} Q${x+30} ${y-28} ${x+22} ${y-2} Q${x+14} ${y-18} ${x-6} ${y-17} Q${x-16} ${y-14} ${x-21} ${y-4} Z`,fill:'#e7c66e'},g),
    bald:(g,x,y)=>{el('path',{d:`M${x-20} ${y+2} Q${x-21} ${y-10} ${x-15} ${y-14}`,stroke:'#555','stroke-width':4,fill:'none'},g);el('path',{d:`M${x+20} ${y+2} Q${x+21} ${y-10} ${x+15} ${y-14}`,stroke:'#555','stroke-width':4,fill:'none'},g);},
    grey:(g,x,y)=>el('path',{d:`M${x-20} ${y-2} Q${x-20} ${y-27} ${x} ${y-26} Q${x+20} ${y-27} ${x+20} ${y-2} Q${x+12} ${y-17} ${x} ${y-17} Q${x-12} ${y-17} ${x-20} ${y-2} Z`,fill:'#c4c0b8'},g),
    brown:(g,x,y)=>el('path',{d:`M${x-21} ${y-1} Q${x-24} ${y-31} ${x-2} ${y-30} Q${x+6} ${y-35} ${x+14} ${y-28} Q${x+25} ${y-22} ${x+21} ${y-1} Q${x+14} ${y-16} ${x+2} ${y-18} Q${x-12} ${y-17} ${x-21} ${y-1} Z`,fill:'#6b4a2f'},g),
  };
  person(170,{sh:168,suit:'#1f2a4d',pants:'#1f2a4d',tie:'#c2412d',shoes:'#111',hair:hair.swoop,podium:true,delay:0,name:'Donald Trump',org:'US President'});
  // podium in front of the speaker, with a generic gold emblem
  el('path',{d:'M100 262 L262 262 L252 300 L110 300 Z',fill:'#4a4f59'},s);
  el('path',{d:'M116 300 L246 300 L236 402 L126 402 Z',fill:'#5b4232'},s);
  el('circle',{cx:181,cy:281,r:15,fill:'#e0b65a'},s); el('circle',{cx:181,cy:281,r:9,fill:'#4a4f59'},s);
  el('path',{d:'M214 262 l20 -30',stroke:'#222','stroke-width':3},s); el('circle',{cx:235,cy:230,r:5,fill:'#222'},s);
  person(375,{sh:196,suit:'#2b2b30',pants:'#2b2b30',tie:'#d58f9c',shoes:'#111',hair:hair.bald,delay:.6,smile:2,name:'Masayoshi Son',org:'SoftBank'});
  person(505,{sh:162,suit:'#2f2f33',pants:'#2f2f33',tie:'#7d2333',shoes:'#111',hair:hair.grey,delay:1.2,smile:1,name:'Larry Ellison',org:'Oracle'});
  person(650,{sh:186,suit:'#26272b',pants:'#26272b',tie:'#2b3f73',shoes:'#8a5a2b',hair:hair.brown,delay:.3,smile:3,name:'Sam Altman',org:'OpenAI'});
  // speech bubble and camera flashes
  const b=el('g',{class:'bubble'},s); b.style.transformOrigin='196px 118px';
  el('rect',{x:196,y:52,width:210,height:56,rx:10,fill:'#fff',stroke:'#111','stroke-width':2},b);
  el('path',{d:'M206 106 L196 124 L222 106',fill:'#fff',stroke:'#111','stroke-width':2,'stroke-linejoin':'round'},b);
  el('rect',{x:203,y:104,width:22,height:4,fill:'#fff'},b);
  txt(b,301,88,'US$500 billion!',{'text-anchor':'middle','font-size':22,'font-weight':800,fill:'#111'});
  [[90,200,0],[560,260,1.3],[720,190,2.6],[440,120,3.7]].forEach(([cx,cy,d])=>{const f=el('circle',{class:'flash',cx,cy,r:70,fill:'url(#flashGrad)'},s);f.style.animationDelay=d+'s';});
  const defs=el('defs',{},s), rg=el('radialGradient',{id:'flashGrad'},defs);
  el('stop',{offset:'0','stop-color':'#fff','stop-opacity':.95},rg); el('stop',{offset:'1','stop-color':'#fff','stop-opacity':0},rg);
})();

/* ---------------- scrolly: money and power gauges fill as announcements land ---------------- */
(function(){
  const s=document.getElementById('growChart'); if(!s) return;
  const X=40, W=560;
  const gauges=[
    {y:70,  name:'Money', max:500, unit:'US$', fmt:v=>'US$'+v+'B', goal:'US$500B pledged'},
    {y:200, name:'Power', max:10,  unit:'GW',  fmt:v=>(v<1?'~':'')+v+' GW', goal:'10 GW target'},
  ];
  // [money announced, power announced, sites lit]
  const states=[[100,0,1],[300,4.5,1],[300,7,6],[400,7,6],[400,7,6]];
  const g=gauges.map(o=>{
    txt(s,X,o.y-14,o.name,{fill:'#fff','font-size':15,'font-weight':700});
    txt(s,X+W,o.y-14,o.goal,{fill:'#8d8a84','font-size':12,'text-anchor':'end'});
    el('rect',{x:X,y:o.y,width:W,height:46,fill:'none',stroke:'#5d5a55','stroke-width':1.5,'stroke-dasharray':'6 5'},s);
    const f=el('rect',{class:'fill',x:X,y:o.y,width:0,height:46,fill:'#e0b65a'},s);
    f.style.width='0px';
    const v=txt(s,X+12,o.y+30,'',{fill:'#0d0d0f','font-size':17,'font-weight':700});
    return {o,f,v};
  });
  const sites=['Abilene, TX','Shackelford, TX','Doña Ana, NM','Midwest','Lordstown, OH','Milam, TX'];
  txt(s,X,300,'Named US sites',{fill:'#fff','font-size':15,'font-weight':700});
  const dots=sites.map((n,i)=>{
    const c=i%3, r=Math.floor(i/3), gx=X+c*190, gy=330+r*36;
    const grp=el('g',{class:'site',opacity:.18},s);
    el('circle',{cx:gx+8,cy:gy,r:7,fill:i===0?'#e0b65a':'#cfcbc3'},grp);
    txt(grp,gx+24,gy+5,n,{fill:'#eee','font-size':14});
    return grp;
  });
  const moneyLabel=['US$100B "immediately"','~US$300B Oracle deal','~US$300B Oracle deal','US$400B+ planned','US$400B+ planned'];
  function setState(i){
    const st=states[Math.max(0,i)];
    g.forEach((x,k)=>{
      const val=st[k], w=W*val/x.o.max;
      x.f.style.width=(i<0?0:w)+'px';
      x.v.textContent=i<0||val===0?'':(k===0?moneyLabel[i]:x.o.fmt(val)+(i>=2?' planned':' from Oracle'));
      x.v.setAttribute('fill',w>260?'#0d0d0f':'#fff');
      x.v.setAttribute('x',w>260?X+12:X+w+10);
    });
    dots.forEach((d,k)=>d.setAttribute('opacity',i>=0&&k<st[2]?1:.18));
  }
  setState(-1);
  const steps=[...document.querySelectorAll('.step')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach(s=>s.classList.remove('on'));e.target.classList.add('on');setState(+e.target.dataset.s);}}),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(s=>io.observe(s));
})();

/* ---------------- site table filter ---------------- */
(function(){
  const box=document.getElementById('siteFilter'); if(!box) return;
  const btns=[...box.querySelectorAll('button')], rows=[...document.querySelectorAll('table.sites tbody tr')];
  btns.forEach(b=>b.addEventListener('click',()=>{
    btns.forEach(x=>x.setAttribute('aria-pressed',x===b));
    rows.forEach(r=>r.classList.toggle('hide',b.dataset.f!=='all'&&r.dataset.g!==b.dataset.f));
  }));
})();

/* ---------------- reveal + counters ---------------- */
function countBp(n){
  const to=+n.dataset.bp,t0=performance.now(),d=1400;
  (function f(t){const p=Math.min(1,Math.max(0,(t-t0)/d));n.textContent=(to<100&&p===1?'~':'')+Math.round(to*easeOut(p))+' bp';if(p<1)requestAnimationFrame(f);})(t0);
}
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add('in-view');rio.unobserve(e.target);
  e.target.querySelectorAll('.mbar').forEach(b=>b.style.height=b.dataset.h+'%');
  e.target.querySelectorAll('[data-bp]').forEach(countBp);
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
tocLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});}));

document.getElementById('copyLink').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);e.target.textContent='Copied';}catch(_){e.target.textContent='Copy from address bar';}});
