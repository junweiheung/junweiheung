/*
 * Anthropic IPO explainer: hero, ownership waffle, holder table, price calculator, lock-up chart.
 * Share figures: amended S-1 (10 Nov 2026) principal-stockholder table, updated for the 18 Nov pricing release.
 */
const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};

/* ---------------- the numbers ---------------- */
const PRICE=83;
const PRIMARY=956351354, SECONDARY=23648646;
const A_PRE=6626640437, N_PRE=5307329452;
const PLACEMENT=26e9/PRICE;                    // Class N shares sold in the $26B placement
const A_POST=A_PRE+PRIMARY, N_POST=N_PRE+PLACEMENT, OUT=A_POST+N_POST;   // ≈13.20B
const FD=1.5e12/PRICE;                          // ≈18.07B fully diluted, from the ~$1.5T reported value
const AMZ=1920511218, GOOG=1654463134+10e9/PRICE, PBF=846840960;
const CF={'Dario Amodei':237259602,'Daniela Amodei':238030562,'Tom Brown':240794662,'Jack Clark':238893462,
  'Jared Kaplan':238972792,'Sam McCandlish':240005472,'Christopher Olah':239504042};
const CF_ALL=Object.values(CF).reduce((a,b)=>a+b,0);
const IPO=PRIMARY+SECONDARY;
const CHIPS=16e9/PRICE;                          // Nvidia $10B + AMD/Broadcom/Micron/Microsoft/TSMC $6B
const pct=v=>v/OUT*100;
const votePct=v=>v/A_POST*49.9;                  // Class A holders share 49.9% of votes
const fmtB=v=>v>=1e12?'$'+(v/1e12).toFixed(2)+'T':'$'+(v/1e9).toFixed(v>=1e11?0:1)+'B';
const fmtN=v=>Math.round(v).toLocaleString('en-US');

/* ---------------- hero: owning vs voting ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  txt(s,120,96,'Who owns Anthropic, and who runs it?',{fill:'#fff','font-size':38,'font-weight':700});
  txt(s,120,136,'After the IPO, at $83 a share',{fill:'#8d8a84','font-size':22});
  const X=120, W=1360;
  const own=[
    ['Amazon',pct(AMZ),'#ff9f43'],['Google',pct(GOOG),'#4d8bff'],['7 co-founders',pct(CF_ALL),'#e0b65a'],
    ['Benefit fund',pct(PBF),'#7fbf8a'],['IPO buyers',pct(IPO),'#cfcbc3'],['Everyone else',0,'#3a3833']];
  own[5][1]=100-own.slice(0,5).reduce((a,b)=>a+b[1],0);
  const vote=[['Founder share (Class F)',50.1,'#e0b65a'],['7 co-founders\' Class A',votePct(CF_ALL),'#b8892b'],
    ['IPO buyers',votePct(IPO),'#cfcbc3'],['Other Class A holders',49.9-votePct(CF_ALL)-votePct(IPO),'#3a3833']];
  const bar=(y,label,segs,delay0)=>{
    txt(s,X,y-18,label,{fill:'#8d8a84','font-size':17,'font-weight':700,'letter-spacing':3});
    let x=X;
    segs.forEach(([n,v,c],i)=>{
      const w=W*v/100;
      const r=el('rect',{class:'seg',x,y,width:Math.max(w-3,1),height:96,fill:c},s); r.style.animationDelay=(delay0+i*.18)+'s';
      if(w>120){
        txt(s,x+14,y+40,n,{fill:c==='#3a3833'?'#cfcbc3':'#111','font-size':19,'font-weight':700});
        txt(s,x+14,y+74,v.toFixed(1)+'%',{fill:c==='#3a3833'?'#fff':'#111','font-size':28,'font-weight':800});
      }
      x+=w;
    });
  };
  bar(230,'SHARES OWNED',own,.2);
  bar(450,'VOTES',vote,1.4);
  txt(s,X,600,'Amazon and Google: 28% of the shares, 0% of the votes.',{fill:'#fff','font-size':26,'font-weight':700});
  txt(s,X,638,'Their Class N shares pay out like ordinary shares but cannot vote. A trust elects most of the board.',{fill:'#8d8a84','font-size':20});
})();

/* ---------------- waffle ---------------- */
(function(){
  const box=document.getElementById('waffle'), leg=document.getElementById('wlegend'), note=document.getElementById('waffleNote');
  if(!box) return;
  const btns=[...document.querySelectorAll('#waffleFig .seg-ctrl button')];
  const groups=[
    {k:'amz',n:'Amazon',sub:'Class N, no votes',c:'#e8892b',own:pct(AMZ),vote:0},
    {k:'goog',n:'Google',sub:'Class N, no votes',c:'#2463d6',own:pct(GOOG),vote:0},
    {k:'cf',n:'Seven co-founders',sub:'Class A shares',c:'#e0b65a',own:pct(CF_ALL),vote:votePct(CF_ALL)},
    {k:'f',n:'Founder LLC (one Class F share)',sub:'Held by the co-founders',c:'#b8892b',own:0,vote:50.1},
    {k:'pbf',n:'Anthropic Public Benefit Fund',sub:'Class N, no votes',c:'#5f9e6e',own:pct(PBF),vote:0},
    {k:'ipo',n:'IPO buyers',sub:'Class A, 980M shares',c:'#c2412d',own:pct(IPO),vote:votePct(IPO)},
    {k:'chips',n:'Nvidia, AMD, Broadcom, Micron, Microsoft, TSMC',sub:'$16B of the placement, Class N',c:'#7b6fb0',own:pct(CHIPS),vote:0},
    {k:'rest',n:'Everyone else',sub:'Staff, early investors, VCs',c:'#a9a59c',own:0,vote:0},
  ];
  const restOwn=100-groups.reduce((a,g)=>a+g.own,0), restVote=100-groups.reduce((a,g)=>a+g.vote,0);
  groups[7].own=restOwn; groups[7].vote=restVote;
  // largest-remainder rounding to 100 squares
  const toSquares=(key)=>{const raw=groups.map(g=>g[key]);const fl=raw.map(Math.floor);let left=100-fl.reduce((a,b)=>a+b,0);
    raw.map((v,i)=>[v-fl[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){fl[i]++;left--;}});return fl;};
  const cells=[];for(let i=0;i<100;i++){const c=document.createElement('i');c.style.setProperty('--k',i);box.appendChild(c);cells.push(c);}
  const rows=groups.map(g=>{const d=document.createElement('div');d.innerHTML=`<s style="background:${g.c}"></s><span>${g.n}<small>${g.sub}</small></span><b></b>`;leg.appendChild(d);return d;});
  const notes={
    own:'Amazon and Google together own about 28% of Anthropic, more than the seven co-founders combined (about 12.7%). IPO buyers own about 7%.',
    vote:'Amazon, Google, the benefit fund and the chip makers drop out completely. One founder share holds 50.1% of the votes, and the co-founders\' own Class A shares add roughly 11% more.'
  };
  function show(m){
    const sq=toSquares(m);let i=0;
    groups.forEach((g,gi)=>{for(let k=0;k<sq[gi];k++)cells[i++].style.background=g.c;
      rows[gi].querySelector('b').textContent=g[m]<.05?'0%':g[m].toFixed(1)+'%';rows[gi].classList.toggle('zero',g[m]<.05);});
    note.textContent=notes[m];
    btns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
  }
  btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.m)));
  show('own');
})();

/* ---------------- holder table ---------------- */
(function(){
  const tb=document.getElementById('holdersBody'); if(!tb) return;
  const row=(name,cls,sh,vote,sub,klass='')=>{
    const tr=document.createElement('tr'); if(klass) tr.className=klass;
    tr.innerHTML=`<td>${name}${sub?`<small>${sub}</small>`:''}</td><td>${cls}</td><td>${sh==null?'1 share':fmtN(sh)}</td><td>${sh==null?'—':pct(sh).toFixed(1)+'%'}</td><td>${sh==null?'—':fmtB(sh*PRICE)}</td><td class="${vote===0?'v0':''}">${typeof vote==='string'?vote:vote.toFixed(1)+'%'}</td>`;
    tb.appendChild(tr);
  };
  row('Amazon','N',AMZ,0,'Plus 1.56B more shares from notes it can\'t yet convert');
  row('Google (Alphabet)','N',GOOG,0,'Includes ~120M shares from the $10B placement');
  row('Seven co-founders, combined','A',CF_ALL,votePct(CF_ALL),'Each sold 3,378,378 shares in the IPO');
  Object.entries(CF).forEach(([n,v])=>row('&nbsp;&nbsp;'+n,'A',v,votePct(v),'','sub'));
  row('Founder LLC','F',null,'50.1%','One share, owned by the seven co-founders');
  row('Long-Term Benefit Trust','T',null,'Board majority','One share; elects most directors');
  row('Anthropic Public Benefit Fund','N',PBF,0,'5% of fully diluted shares, contributed by Anthropic');
  row('Nvidia','N',10e9/PRICE,0,'$10B in the placement');
  row('AMD, Broadcom, Micron, Microsoft, TSMC','N',6e9/PRICE,0,'$6B in the placement, split not disclosed');
  row('IPO buyers','A',IPO,votePct(IPO),'Up to 20% set aside for retail');
})();

/* ---------------- price calculator ---------------- */
(function(){
  const inp=document.getElementById('pxIn'), s=document.getElementById('ladderSvg'); if(!inp||!s) return;
  const L=20,R=620,min=+inp.min,max=+inp.max,X=v=>L+(v-min)/(max-min)*(R-L);
  el('line',{x1:L,y1:52,x2:R,y2:52,stroke:'#d9d5cc','stroke-width':2},s);
  el('rect',{x:X(70),y:46,width:X(78)-X(70),height:12,fill:'#e0b65a',opacity:.5},s);
  const marks=[[380e9/FD,'Series G','Feb 2026 · ~$'+Math.round(380e9/FD),1],[965e9/FD,'May round','$965B · ~$'+Math.round(965e9/FD),0],[74,'IPO range','$70–78',1],[83,'IPO price','$83',0],[2e12/FD,'"$2T" talk','~$'+Math.round(2e12/FD),1]];
  marks.forEach(([v,a,b,up])=>{
    const x=X(v);el('line',{x1:x,y1:44,x2:x,y2:60,stroke:'#111','stroke-width':2},s);
    const y=up?30:80;
    txt(s,x,y,a,{'text-anchor':'middle','font-size':11,'font-weight':700,fill:'#111'});
    txt(s,x,y+(up?-13:13),b,{'text-anchor':'middle','font-size':10,fill:'#76736c'});
  });
  const knob=el('circle',{cx:X(83),cy:52,r:8,fill:'#111'},s);
  const $=id=>document.getElementById(id);
  const tag=v=>v===83?'IPO price':v<70?'below the IPO range':v<=78?'inside the original range':v<83?'between the range and the IPO price':'above the IPO price';
  function upd(){
    const p=+inp.value;
    knob.setAttribute('cx',X(p));
    $('pxOut').textContent='$'+p; $('pxTag').textContent=tag(p)+(p!==83?` · ${p>83?'+':''}${((p/83-1)*100).toFixed(0)}% vs $83`:'');
    $('cFd').textContent=fmtB(FD*p); $('cBasic').textContent=fmtB(OUT*p);
    $('cPs').textContent=Math.round(FD*p/46.24e9)+'×';
    $('cAmz').textContent=fmtB(AMZ*p); $('cGoog').textContent=fmtB(GOOG*p);
    $('cCf').textContent='~'+fmtB(CF_ALL/7*p);
  }
  inp.addEventListener('input',upd); upd();
})();

/* ---------------- lock-up calendar ---------------- */
(function(){
  const s=document.getElementById('lockSvg'); if(!s) return;
  // [day, millions]; earnings-linked days are estimates (FY26 ≈ day 100, Q1 ≈ 175, Q2 ≈ 265, Q3/365 ≈ 355)
  const W=[[1,316],[27,299],[48,299],[62,349],[76,349],[100,1700],[113,474],[127,474],[141,474],[155,474],[169,474],
    [175,3000],[209,449],[223,449],[237,449],[251,449],[265,562],[292,505],[306,505],[320,505],[334,505],[348,505],[358,1900]];
  const L=58,R=640,T=24,B=270,X=d=>L+d/365*(R-L),Y=m=>B-m/3000*(B-T);
  const total=W.reduce((a,b)=>a+b[1],0); const YC=c=>B-c/total*(B-T);
  [0,1000,2000,3000].forEach(m=>{el('line',{x1:L,y1:Y(m),x2:R,y2:Y(m),stroke:'#eee'},s);txt(s,L-8,Y(m)+4,m?(m/1000)+'B':'0',{'text-anchor':'end','font-size':11,fill:'#76736c'});});
  // IPO size reference
  el('line',{x1:L,y1:Y(980),x2:R,y2:Y(980),stroke:'#c2412d','stroke-dasharray':'5 4','stroke-width':1.5},s);
  txt(s,L+90,Y(980)-6,'IPO: 980M shares',{'text-anchor':'start','font-size':11,'font-weight':700,fill:'#c2412d'});
  W.forEach(([d,m],i)=>{const b=el('rect',{class:'bar',x:X(d)-5,y:Y(m),width:10,height:B-Y(m),fill:m>=1700?'#111':'#a9a59c'},s);b.style.transitionDelay=(i*.05)+'s';});
  // cumulative line on its own scale (right axis)
  let c=0;const pts=W.map(([d,m])=>{c+=m;return `${X(d)},${YC(c)}`;});
  el('polyline',{class:'cum',points:`${X(0)},${B} `+pts.join(' '),fill:'none',stroke:'#e0b65a','stroke-width':3},s);
  txt(s,X(358)-6,YC(total)+16,'Total ≈ '+(total/1000).toFixed(1)+'B',{'text-anchor':'end','font-size':12,'font-weight':800,fill:'#b8892b'});
  [[100,'FY26 results'],[180,'Day 180'],[365,'Day 365']].forEach(([d,l])=>txt(s,X(d),B+18,l,{'text-anchor':'middle','font-size':11,fill:'#3d3d3d','font-weight':600}));
  txt(s,X(0),B+18,'Day 1',{'text-anchor':'start','font-size':11,fill:'#3d3d3d','font-weight':600});
  txt(s,L,B+44,'Grey and black bars: shares unlocked in each wave (left scale). Gold line: running total (to scale of its own).',{'font-size':11,fill:'#76736c'});
  [[1,316],[175,3000],[358,1900],[100,1700]].forEach(([d,m])=>txt(s,X(d)+(d===1?8:0),Y(m)-6,m>=1000?(m/1000)+'B':m+'M',{'text-anchor':d===1?'start':'middle','font-size':11,'font-weight':700,fill:'#111'}));
})();

/* ---------------- reveal ---------------- */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add('in-view');rio.unobserve(e.target);
  e.target.querySelectorAll('.ltrack i').forEach(b=>b.style.width=b.dataset.w+'%');
}),{threshold:.2});
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
