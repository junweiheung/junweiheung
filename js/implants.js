const NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const txt=(p,x,y,s,a={})=>{const t=el('text',Object.assign({x,y,'font-family':'Inter'},a),p);t.textContent=s;return t;};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fadeIn=(node,delay)=>{node.setAttribute('opacity',0);if(reduced){node.setAttribute('opacity',1);return;}
  setTimeout(()=>{node.style.transition='opacity .9s ease';node.setAttribute('opacity',1);},delay);};

/* ---------------- hero: how deep does work go? ---------------- */
(function(){
  const s=document.getElementById('heroSvg'); if(!s) return;
  txt(s,120,88,'How deep does work go?',{fill:'#fff','font-size':36,'font-weight':700});
  txt(s,120,126,'Three depths of workplace brain and body tech, and how far each has spread',{fill:'#8d8a84','font-size':21});
  const bands=[
    {y:170,fill:'#1a1a1d',tag:'ON THE HEAD',name:'EEG caps and headbands',a:'In use at mines and in trucking',b:'~US$1–2 per worker per day',col:'#e0b65a'},
    {y:340,fill:'#231c1a',tag:'UNDER THE SKIN',name:'RFID chips in the hand',a:'Thousands of people worldwide (est.)',b:'About 80 of 250 staff at one firm, 2018',col:'#e0b65a'},
    {y:510,fill:'#2c1714',tag:'INSIDE THE SKULL',name:'Brain-computer interfaces',a:'21 people in Neuralink trials, Jan 2026',b:'0 approved for healthy people',col:'#ff7a63'},
  ];
  bands.forEach((b,i)=>{
    const g=el('g',{},s);
    el('rect',{x:0,y:b.y,width:1600,height:160,fill:b.fill},g);
    el('line',{x1:0,y1:b.y,x2:1600,y2:b.y,stroke:'#3a3833','stroke-width':2,'stroke-dasharray':'8 8'},g);
    txt(g,120,b.y+44,b.tag,{fill:'#8d8a84','font-size':16,'font-weight':700,'letter-spacing':3});
    txt(g,120,b.y+86,b.name,{fill:'#fff','font-size':32,'font-weight':700});
    // icon
    const ix=760, iy=b.y+80;
    if(i===0){ // cap with sensor dots
      el('path',{d:`M${ix-60} ${iy+20} Q${ix-60} ${iy-50} ${ix} ${iy-50} Q${ix+60} ${iy-50} ${ix+60} ${iy+20} Z`,fill:'#3a3833'},g);
      el('rect',{x:ix+40,y:iy+12,width:50,height:10,rx:5,fill:'#3a3833'},g);
      [[-30,-10],[0,-30],[30,-10],[-10,8],[20,8]].forEach(([dx,dy])=>{el('circle',{cx:ix+dx,cy:iy+dy,r:5,fill:b.col},g);});
    }else if(i===1){ // grain-sized chip under skin
      el('path',{d:`M${ix-90} ${iy-20} Q${ix} ${iy-50} ${ix+90} ${iy-20}`,stroke:'#c99a7a','stroke-width':6,fill:'none'},g);
      el('rect',{x:ix-22,y:iy-6,width:44,height:14,rx:7,fill:b.col},g);
      el('circle',{class:'heroPulse',cx:ix,cy:iy+1,r:30,fill:'none',stroke:b.col,'stroke-width':2},g);
    }else{ // brain implant with threads
      el('ellipse',{cx:ix,cy:iy+10,rx:90,ry:48,fill:'#4a2a26'},g);
      el('rect',{x:ix-18,y:iy-46,width:36,height:16,rx:4,fill:'#cfcbc3'},g);
      for(let k=-3;k<=3;k++)el('path',{d:`M${ix+k*4} ${iy-30} q${k*6} 30 ${k*12} 58`,stroke:b.col,'stroke-width':2,fill:'none'},g);
    }
    txt(g,960,b.y+76,b.a,{fill:b.col,'font-size':28,'font-weight':700});
    txt(g,960,b.y+112,b.b,{fill:'#cfcbc3','font-size':21});
    fadeIn(g,300+i*900);
  });
  txt(s,120,700,'Deeper means rarer, riskier and more tightly regulated.',{fill:'#77746e','font-size':20});
  if(!reduced){const p=s.querySelector('.heroPulse');let t0=performance.now();(function f(t){const k=((t-t0)%1600)/1600;p.setAttribute('r',14+k*40);p.setAttribute('opacity',1-k);requestAnimationFrame(f);})(t0);}
})();

/* ---------------- hand-chip demo ---------------- */
(function(){
  const s=document.getElementById('chipSvg'); if(!s) return;
  const note=document.getElementById('chipNote'), btns=[...document.querySelectorAll('#chipFig button')];
  const hand=el('g',{class:'hand'},s);
  // simple hand: palm, thumb, fingers
  el('rect',{x:70,y:110,width:120,height:110,rx:30,fill:'#efc8a2'},hand);
  el('rect',{x:175,y:118,width:70,height:24,rx:12,fill:'#efc8a2'},hand);
  [0,1,2,3].forEach(k=>el('rect',{x:78+k*28,y:50,width:24,height:80,rx:12,fill:'#efc8a2'},hand));
  el('rect',{x:70,y:200,width:120,height:50,fill:'#2b3f73'},hand);
  el('rect',{x:186,y:132,width:20,height:8,rx:4,fill:'#b8892b'},hand);
  const waves=el('g',{class:'wave',opacity:0},s);
  [0,1,2].forEach(k=>el('path',{d:`M${356+k*20} 100 q14 36 0 72`,stroke:'#2463d6','stroke-width':3,fill:'none',opacity:1-k*.25},waves));
  const ring=el('circle',{class:'pulse',cx:196,cy:136,r:16,fill:'none',stroke:'#b8892b','stroke-width':2,opacity:0},s);
  // reader
  const rd=el('g',{},s);
  el('rect',{x:420,y:60,width:130,height:150,rx:10,fill:'#0d0d0f'},rd);
  const screen=el('rect',{x:438,y:80,width:94,height:56,rx:4,fill:'#2a2926'},rd);
  const label=txt(rd,485,114,'',{fill:'#fff','font-size':15,'font-weight':700,'text-anchor':'middle'});
  const title=txt(rd,485,190,'',{fill:'#8d8a84','font-size':12,'text-anchor':'middle'});
  const notes={
    door:['DOOR READER','UNLOCKED','#2f7d4f','The reader on the door sends out a weak radio field. It powers the chip for an instant, reads its ID number, and unlocks the door.'],
    pay:['KIOSK','PAID','#2f7d4f','At a break-room kiosk, the reader matches the chip\'s ID to your account. It works like tapping a card, from a few centimetres away.'],
    track:['NO READER','NO SIGNAL','#5d5a55','Away from a reader, the chip is silent. It has no battery and no GPS, so it can\'t report where you are. It only says "here I am" when something powers it up close.'],
  };
  function show(k){
    const [t,l,c,n]=notes[k];
    title.textContent=t; label.textContent=l; screen.setAttribute('fill',c); note.textContent=n;
    const near=k!=='track';
    hand.style.transform=near?'translateX(100px)':'translateX(0)';
    waves.setAttribute('opacity',near?1:0); ring.setAttribute('opacity',near?1:0);
    ring.setAttribute('cx',near?296:196);
    btns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.act===k));
  }
  btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.act)));
  show('door');
})();

/* ---------------- scrolly: the road from lab to workplace ---------------- */
(function(){
  const s=document.getElementById('roadChart'); if(!s) return;
  const stages=['Lab and animal tests','Human trials','Limited FDA clearance','Approved for patients','Used by healthy people','Required by employers'];
  const Y0=40, H=58, LX=20;
  const rows=stages.map((n,i)=>{
    const y=Y0+i*H;
    const bg=el('rect',{x:LX,y:y,width:600,height:H-8,rx:3,fill:'#1a1a1d'},s);
    txt(s,LX+14,y+31,n,{fill:'#cfcbc3','font-size':14,'font-weight':600});
    return {y,bg};
  });
  const cos=[
    {k:'Neuralink',stage:1,step:1,col:'#e0b65a'},
    {k:'Synchron',stage:1,step:2,col:'#e0b65a'},
    {k:'Precision',stage:2,step:3,col:'#4d8bff'},
    {k:'Paradromics',stage:1,step:4,col:'#e0b65a'},
  ];
  const slot={};
  const marks=cos.map(c=>{
    const n=slot[c.stage]=(slot[c.stage]||0)+1;
    const x=LX+220+(n-1)*125, y=rows[c.stage].y+(H-8)/2;
    const g=el('g',{class:'mk',opacity:0},s);
    el('circle',{cx:x,cy:y,r:7,fill:c.col},g);
    txt(g,x+12,y+5,c.k,{fill:'#fff','font-size':13,'font-weight':700});
    return {c,g};
  });
  function setState(i){
    marks.forEach(m=>m.g.setAttribute('opacity',i>=m.c.step?1:0));
    rows.forEach((r,k)=>{
      let f='#1a1a1d';
      if(i===0) f='#24231f';
      if(i===5&&k>=4) f='#3a1d18';
      r.bg.setAttribute('fill',f);
      r.bg.setAttribute('stroke',i===5&&k>=4?'#c2412d':'none');
      r.bg.setAttribute('stroke-dasharray',i===5&&k>=4?'6 5':'');
    });
  }
  setState(-1);
  const steps=[...document.querySelectorAll('.step')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach(x=>x.classList.remove('on'));e.target.classList.add('on');setState(+e.target.dataset.s);}}),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(x=>io.observe(x));
})();

/* ---------------- states that ban employer-required implants ---------------- */
(function(){
  const box=document.getElementById('states'); if(!box) return;
  const note=document.getElementById('stateNote');
  const list=[['Alabama'],['Arkansas'],['California'],['Indiana'],['Missouri'],['Montana'],
    ['Nevada','Strictest','Nevada went furthest: in 2019 it banned even voluntary workplace chip programmes.'],
    ['New Hampshire'],['North Dakota'],['Oklahoma'],['Utah'],
    ['Washington','Newest, 2026','Washington\'s HB 2303 (2026) bans requiring an implant as a condition of a job. An employee can still choose one on their own initiative.'],
    ['Wisconsin']];
  list.forEach(([n,tag,info],i)=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=n; b.style.transitionDelay=(i*0.05)+'s';
    if(tag){const sm=document.createElement('small');sm.textContent=tag;b.appendChild(sm);b.classList.add('hot');
      b.addEventListener('click',()=>{box.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');note.textContent=info;});}
    else b.disabled=true;
    box.appendChild(b);
  });
})();

/* ---------------- realism meter ---------------- */
(function(){
  const s=document.getElementById('meterSvg'); if(!s) return;
  const note=document.getElementById('meterNote'), btns=[...document.querySelectorAll('#meterFig .scen button')];
  const CX=320, CY=200, R=160;
  const arc=(a0,a1)=>{const p=a=>[CX+R*Math.cos(Math.PI*(1-a)),CY-R*Math.sin(Math.PI*(1-a))];const [x0,y0]=p(a0),[x1,y1]=p(a1);return `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`;};
  [['#c9c4b8',0,.33],['#e0b65a',.33,.66],['#c2412d',.66,1]].forEach(([c,a,b])=>el('path',{d:arc(a,b),stroke:c,'stroke-width':26,fill:'none'},s));
  txt(s,CX-R,CY+28,'Science fiction',{'font-size':13,fill:'#76736c','text-anchor':'middle'});
  txt(s,CX,CY-R-26,'Possible',{'font-size':13,fill:'#76736c','text-anchor':'middle'});
  txt(s,CX+R,CY+28,'Already happening',{'font-size':13,fill:'#76736c','text-anchor':'middle'});
  const needle=el('g',{class:'needle'},s); needle.style.transformOrigin=`${CX}px ${CY}px`; needle.style.transformBox='view-box';
  el('line',{x1:CX,y1:CY,x2:CX-R+30,y2:CY,stroke:'#111','stroke-width':5,'stroke-linecap':'round'},needle);
  el('circle',{cx:CX,cy:CY,r:11,fill:'#111'},s);
  const verdict=txt(s,CX,CY-40,'',{'font-size':20,'font-weight':800,fill:'#111','text-anchor':'middle'});
  const sc=[
    [.9,'Already happening','Fatigue caps are in use at mines and in trucking. The open question is what else the brain data gets used for, and who sees it.'],
    [.68,'Has happened','Three Square Market did it in 2017. A voluntary chip is legal in most places, but it\'s rare: a badge or phone does the same job.'],
    [.24,'Unlikely','Requiring a chip is banned in a growing list of US states, and there\'s no business need a badge can\'t meet.'],
    [.04,'Science fiction, for now','No brain implant is approved for healthy people, it needs brain surgery, and it would run straight into implant and neural-data laws.'],
  ];
  function show(k){
    const [v,t,n]=sc[k];
    needle.style.transform=`rotate(${v*180}deg)`; verdict.textContent=t; note.textContent=n;
    btns.forEach(b=>b.setAttribute('aria-pressed',+b.dataset.k===k));
  }
  btns.forEach(b=>b.addEventListener('click',()=>show(+b.dataset.k)));
  show(0);
})();

/* ---------------- reveal ---------------- */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add('in-view');rio.unobserve(e.target);
  e.target.querySelectorAll('.ltrack i, .stack i').forEach(b=>b.style.width=b.dataset.w+'%');
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
