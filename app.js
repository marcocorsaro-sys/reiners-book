/* Reiner's Book — app */
const SB_URL='https://zjpoquehofvkmdvsrvpb.supabase.co';
const SB_KEY='sb_publishable_0OA_stzRwrznLCdB4RmUWg__tzYcUoE';
const sb=window.supabase?window.supabase.createClient(SB_URL,SB_KEY):null;

/* ---------- local cache + state ---------- */
const store={get(k,d){try{const v=localStorage.getItem('rb:'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('rb:'+k,JSON.stringify(v))}catch(e){}}};
let manDone=store.get('man',{}),patRead=store.get('pat',{}),best=store.get('best',null),profile=store.get('profile',null);
let synced={man:{},pat:{}};

/* ---------- DB layer ---------- */
const DB={
 async hash(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('rb·'+s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')},
 async login(name,pin,horse){if(!sb)throw new Error('DB non disponibile');const pin_hash=await this.hash(pin);const {data,error}=await sb.rpc('qha_login',{p_name:name,p_pin_hash:pin_hash,p_horse:horse||null});if(error)throw error;return data[0]},
 async load(){if(!sb||!profile)return;const [{data:pr},{data:qz}]=await Promise.all([sb.from('qha_progress').select('kind,key').eq('profile_id',profile.id),sb.from('qha_quiz').select('score').eq('profile_id',profile.id).order('score',{ascending:false}).limit(1)]);
  const m={},p={};(pr||[]).forEach(r=>{if(r.kind==='man')m[r.key]=true;if(r.kind==='pat')p[r.key]=true});
  // merge: cloud ∪ local (so first login uploads local progress)
  manDone={...m,...manDone};patRead={...p,...patRead};synced={man:m,pat:p};
  const cloudBest=qz&&qz[0]?qz[0].score:null;if(cloudBest!==null&&(best===null||cloudBest>best))best=cloudBest;
  await this.push();},
 async push(){if(!sb||!profile)return;const ups=[],dels=[];
  for(const kind of ['man','pat']){const cur=kind==='man'?manDone:patRead;for(const k in cur)if(!synced[kind][k])ups.push({profile_id:profile.id,kind,key:k});for(const k in synced[kind])if(!cur[k])dels.push({kind,key:k});}
  if(ups.length)await sb.from('qha_progress').upsert(ups);
  for(const d of dels)await sb.from('qha_progress').delete().match({profile_id:profile.id,kind:d.kind,key:d.key});
  synced={man:{...manDone},pat:{...patRead}};},
 async quiz(score){if(!sb||!profile)return;await sb.from('qha_quiz').insert({profile_id:profile.id,score,total:12})},
 async board(){if(!sb)return[];const {data}=await sb.from('qha_leaderboard').select('*');return (data||[]).sort((a,b)=>(b.best_quiz||0)-(a.best_quiz||0)||b.pats-a.pats||b.mans-a.mans)}
};
function save(){store.set('man',manDone);store.set('pat',patRead);store.set('best',best);kpis();DB.push().catch(()=>{})}

/* ---------- nav ---------- */
const nav=document.getElementById('nav');
const VIEWS=['home','man','rein','pat','quiz','board'];
function show(v){document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));window.scrollTo({top:0});try{history.replaceState(null,'','#'+v)}catch(e){}if(v==='board')renderBoard()}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(b.dataset.v)});
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
const h0=(location.hash||'').slice(1);if(VIEWS.includes(h0))show(h0);

/* ---------- SVG helpers ---------- */
const NS='http://www.w3.org/2000/svg';
function el(t,a,txt){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e}

/* ---------- maneuvers ---------- */
function buildMan(){const box=document.getElementById('man-list');box.innerHTML=MAN.map(m=>`<div class="man" id="man-${m.k}">
 <div class="man-head"><div><div class="man-en">${m.en}</div><div class="man-it">${m.it}</div></div><button class="learn ${manDone[m.k]?'done':''}" data-k="${m.k}">${manDone[m.k]?'✓ studiata':'segna studiata'}</button></div>
 <div class="two">
  <div><h3>Meccanica</h3><p>${m.mech}</p><h3>Aiuti</h3><ul>${m.aids.map(a=>`<li>${a}</li>`).join('')}</ul></div>
  <div><h3>Progressione</h3><ul>${m.prog.map(a=>`<li>${a}</li>`).join('')}</ul><h3>Cosa giudica il giudice</h3><p class="judge">${m.judge}</p></div>
 </div></div>`).join('')}
document.getElementById('man-list').addEventListener('click',e=>{const b=e.target.closest('.learn');if(!b)return;manDone[b.dataset.k]=!manDone[b.dataset.k];if(!manDone[b.dataset.k])delete manDone[b.dataset.k];b.classList.toggle('done',!!manDone[b.dataset.k]);b.textContent=manDone[b.dataset.k]?'✓ studiata':'segna studiata';save()});

/* ---------- pattern renderer ---------- */
const AR={x:20,y:20,w:280,h:480,cx:160,cy:260};const LR=68,SR=40;
let curP=0,curS=-1;
function arenaBase(s){
 s.innerHTML='';
 const d=el('defs',{});d.innerHTML='<marker id="mh" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#c9a24d"/></marker><marker id="md" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#7d7263"/></marker>';s.appendChild(d);
 s.appendChild(el('rect',{x:AR.x,y:AR.y,width:AR.w,height:AR.h,rx:8,fill:'#14100d',stroke:'#4a3a2a','stroke-width':2}));
 // markers
 [[AR.cy,'center'],[AR.y+52,'end'],[AR.y+AR.h-52,'end']].forEach(m=>{s.appendChild(el('path',{fill:'none',stroke:'#4a3a2a','stroke-width':1,'stroke-dasharray':'3 4',d:`M${AR.x} ${m[0]} L${AR.x+AR.w} ${m[0]}`}));s.appendChild(el('rect',{x:AR.x-6,y:m[0]-5,width:6,height:10,fill:'#d8b25a'}));s.appendChild(el('rect',{x:AR.x+AR.w,y:m[0]-5,width:6,height:10,fill:'#d8b25a'}));s.appendChild(el('text',{x:AR.x+AR.w+8,y:m[0]+3,fill:'#7d7263','font-size':'7'},m[1]))});
 s.appendChild(el('circle',{cx:AR.cx,cy:AR.cy,r:2.5,fill:'#d8b25a'}));
 s.appendChild(el('text',{x:AR.cx,y:AR.y+AR.h+14,'text-anchor':'middle',fill:'#7d7263','font-size':'8'},'▲ IN-GATE (ingresso)'));
 s.appendChild(el('text',{x:AR.x+4,y:AR.y-6,fill:'#7d7263','font-size':'7'},'muro sinistro'));
 s.appendChild(el('text',{x:AR.x+AR.w-4,y:AR.y-6,'text-anchor':'end',fill:'#7d7263','font-size':'7'},'muro destro'));
}
function laneX(l){return l==='C'?AR.cx:l==='L'?AR.x+58:AR.x+AR.w-58}
function drawStep(s,st,idx,on){
 const g=el('g',{opacity:on?1:.42});const col=on?'#c9a24d':'#7d7263';const mk=on?'url(#mh)':'url(#md)';const w=on?2.4:1.4;
 const label=(x,y)=>{g.appendChild(el('circle',{cx:x,cy:y,r:8,fill:on?'#c9a24d':'#1f1814',stroke:col,'stroke-width':1.2}));g.appendChild(el('text',{x:x,y:y+3,'text-anchor':'middle',fill:on?'#0e0b09':col,'font-size':'9','font-weight':'700'},idx+1))};
 const circ=(dir,size,arrow)=>{const r=size==='LF'?LR:SR;const cx=dir==='L'?AR.cx-r:AR.cx+r;const path=el('circle',{cx,cy:AR.cy,r,fill:'none',stroke:col,'stroke-width':w,'stroke-dasharray':size==='SS'?'5 4':'none'});g.appendChild(path);
   // direction arrow at top: left circle counter-clockwise (heading left at top), right circle clockwise (heading right at top)
   const ax=cx,ay=AR.cy-r;const dx=dir==='L'?-10:10;g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w,'marker-end':mk,d:`M${ax-dx} ${ay} L${ax+dx} ${ay}`}))};
 if(st.t==='C'){const sizes=st.s.split(',');const uniq=[...new Set(sizes)];uniq.forEach(z=>circ(st.dir,z));
   const r=LR;const cx=st.dir==='L'?AR.cx-r:AR.cx+r;label(cx,AR.cy);
   g.appendChild(el('text',{x:cx,y:AR.cy+20,'text-anchor':'middle',fill:col,'font-size':'7.5'},sizes.join(' · ')));
   if(st.stop){g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w,d:`M${AR.cx-6} ${AR.cy-10} L${AR.cx-6} ${AR.cy+10} M${AR.cx+6} ${AR.cy-10} L${AR.cx+6} ${AR.cy+10}`}))}
   else{g.appendChild(el('text',{x:AR.cx,y:AR.cy-4,'text-anchor':'middle',fill:col,'font-size':'7'},'×'))}}
 if(st.t==='F8'){circ('L','LF');circ('R','LF');label(AR.cx,AR.cy-LR-14);g.appendChild(el('text',{x:AR.cx,y:AR.cy-4,'text-anchor':'middle',fill:col,'font-size':'7'},'× ×'));g.appendChild(el('text',{x:AR.cx,y:AR.cy+LR+16,'text-anchor':'middle',fill:col,'font-size':'7.5'},'figure 8 · parte a '+(st.dir==='L'?'sinistra':'destra')))}
 if(st.t==='SP'){const r=14;g.appendChild(el('circle',{cx:AR.cx,cy:AR.cy,r,fill:'none',stroke:col,'stroke-width':w,'stroke-dasharray':'2 3'}));
   const sweep=st.dir==='R'?1:0;g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w,'marker-end':mk,d:`M${AR.cx} ${AR.cy-r-6} A${r+6} ${r+6} 0 0 ${sweep} ${st.dir==='R'?AR.cx+r+6:AR.cx-r-6} ${AR.cy}`}));
   label(AR.cx+(st.dir==='R'?-30:30),AR.cy-30);g.appendChild(el('text',{x:AR.cx,y:AR.cy+r+18,'text-anchor':'middle',fill:col,'font-size':'8'},st.n+' spin '+(st.dir==='R'?'DX ↻':'SX ↺')))}
 if(st.t==='RU'){const x=laneX(st.lane);const top=AR.y+22,bot=AR.y+AR.h-22;const up=st.from==='B';
   let d='';const y0=up?bot:top;
   // approach from open circle or around the end
   if(st.open){const r=LR;const cx=st.open==='L'?AR.cx-r:AR.cx+r;g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w,'stroke-dasharray':'1 4',d:`M${cx} ${AR.cy+(up?r:-r)} Q${(cx+x)/2} ${up?AR.cy+r+40:AR.cy-r-40} ${x} ${up?AR.cy+r+50:AR.cy-r-50}`}))}
   if(st.around){const ox=laneX(st.around);g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w,'stroke-dasharray':'1 4',d:`M${ox} ${bot} L${ox} ${top+10} Q${ox} ${top-8} ${AR.cx} ${top-8} Q${x} ${top-8} ${x} ${top+10}`}))}
   // end position: past marker
   let yEnd;if(st.end==='ST'||st.end==='STB'){yEnd=up?AR.cy-70:AR.cy+70}else if(st.lane!=='C'){yEnd=up?AR.cy-95:AR.cy+95}else{yEnd=up?AR.y+30:AR.y+AR.h-30}
   const yStart=st.open?(up?AR.cy+LR+50:AR.cy-LR-50):(st.around?top+10:y0);
   g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w+.6,'marker-end':mk,d:`M${x} ${yStart} L${x} ${yEnd}`}));
   label(x+(st.lane==='R'?18:-18),(yStart+yEnd)/2);
   if(st.end==='ST'||st.end==='STB'){// slide marks
     const dir=up?-1:1;for(let i=0;i<3;i++)g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':1.2,d:`M${x-8+i*8} ${yEnd-dir*4} L${x-8+i*8} ${yEnd+dir*14}`}));
     g.appendChild(el('text',{x:x,y:yEnd+dir*26+(up?0:6),'text-anchor':'middle',fill:col,'font-size':'7.5'},'STOP'));
     if(st.end==='STB'){g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':1.2,'stroke-dasharray':'2 2','marker-end':mk,d:`M${x} ${yEnd+dir*14} L${x} ${yEnd-dir*20}`}));g.appendChild(el('text',{x:x+(st.lane==='R'?-16:16),y:yEnd-dir*8,'text-anchor':'middle',fill:col,'font-size':'7'},'back'))}}
   else{// rollback: horse's left when heading up = page left; heading down = page right
     const left=st.end==='RBL';const side=up?(left?-1:1):(left?1:-1);const r=14;const dir=up?-1:1;
     g.appendChild(el('path',{fill:'none',stroke:col,'stroke-width':w,'marker-end':mk,d:`M${x} ${yEnd} A${r} ${r} 0 0 ${(side>0)===up?1:0} ${x+side*2*r} ${yEnd} L${x+side*2*r} ${yEnd-dir*30}`}));
     g.appendChild(el('text',{x:x+side*2*r,y:yEnd+dir*20+(up?0:6),'text-anchor':'middle',fill:col,'font-size':'7.5'},'RB '+(left?'SX':'DX')))}}
 s.appendChild(g);
}
function renderPat(){const p=P[curP];const s=document.getElementById('svg-pat');arenaBase(s);
 p.steps.forEach((st,i)=>{if(curS===-1||i!==curS)drawStep(s,st[2],i,curS===-1)});
 if(curS>=0)drawStep(s,p.steps[curS][2],curS,true);
 document.getElementById('p-num').textContent=p.id;
 document.getElementById('p-title').innerHTML=`NRHA ${p.name} · ${p.steps.length} manovre`;
 document.getElementById('p-start').innerHTML=p.start;
 document.getElementById('p-steps').innerHTML=p.steps.map((st,i)=>`<div class="${i===curS?'on':''}" data-i="${i}"><span class="n">${i+1}</span><div>${st[0]}<span class="en">${st[1]}</span></div></div>`).join('');
 document.getElementById('p-read').textContent=patRead[p.id]?'✓ a memoria':'Lo so a memoria';
 document.querySelectorAll('#pchips button').forEach(b=>{b.classList.toggle('on',b.dataset.i==curP);b.classList.toggle('read',!!patRead[P[b.dataset.i].id])});}
document.getElementById('pchips').innerHTML=P.map((p,i)=>`<button data-i="${i}">${p.id}</button>`).join('');
document.getElementById('pchips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;curP=+b.dataset.i;curS=-1;renderPat()});
document.getElementById('p-steps').addEventListener('click',e=>{const r=e.target.closest('[data-i]');if(!r)return;curS=+r.dataset.i;renderPat()});
document.getElementById('p-prev').onclick=()=>{curS=curS<=0?P[curP].steps.length-1:curS-1;renderPat()};
document.getElementById('p-next').onclick=()=>{curS=(curS+1)%P[curP].steps.length;renderPat()};
document.getElementById('p-all').onclick=()=>{curS=-1;renderPat()};
document.getElementById('p-read').onclick=()=>{const id=P[curP].id;if(patRead[id])delete patRead[id];else patRead[id]=true;save();renderPat()};

/* hero art: pattern 1 silhouette */
(function(){const s=document.getElementById('svg-hero');if(!s)return;arenaBase(s);P[0].steps.forEach((st,i)=>drawStep(s,st[2],i,true));s.querySelectorAll('text').forEach(t=>{if(/muro|IN-GATE|end|center/.test(t.textContent))t.remove()})})();

/* ---------- quiz ---------- */
const Q=[
 ['Il punteggio base di un run di reining è:',['70','100','0','50'],0],
 ['Range del punteggio per singola manovra:',['da −1½ a +1½','da 0 a 10','da −5 a +5','da 1 a 3'],0],
 ['Un over-spin superiore a ¼ di giro comporta:',['Score 0 (off pattern)','Penalità 1','Penalità ½','Nessuna penalità'],0],
 ['Speronare davanti al cinch vale:',['Penalità 5','Penalità 2','Penalità 1','Score 0'],0],
 ['Un "break of gait" vale:',['Penalità 2','Penalità 5','Penalità ½','Score 0'],0],
 ['Un cambio di galoppo ritardato di un passo vale:',['Penalità ½','Penalità 1','Penalità 2','Score 0'],0],
 ['Fuori lead per un quarto di circle vale:',['Penalità 1','Penalità ½','Penalità 2','Score 0'],0],
 ['Un freeze up nello spin o nel rollback vale:',['Penalità 2','Penalità 1','Penalità ½','Score 0'],0],
 ['Toccare la sella con la mano libera vale:',['Penalità 5','Penalità 2','Penalità 1','Score 0'],0],
 ['Usare due mani con un curb bit comporta:',['Score 0','Penalità 5','Penalità 2','Penalità 1'],0],
 ['I marker di fine arena sono posti ad almeno:',['15 m dal fondo','5 m dal fondo','30 m dal fondo','Al centro'],0],
 ['Nei run-around lungo il lato il rollback va fatto ad almeno:',['6 m dal muro','2 m dal muro','15 m dal muro','Sul muro'],0],
 ['Il backup deve essere di almeno:',['3 m (10 ft) o fino al centro','1 m','10 m','Metà arena'],0],
 ['Nel Pattern 1 il pattern inizia con:',['Rundown al centro e rollback a sinistra','4 spin a destra','Cerchi a sinistra','Stop al centro'],0],
 ['Quale pattern è l\'inverso del 6?',['14','15','16','13'],0],
 ['Quale pattern è l\'inverso dell\'8?',['15','14','16','12'],0],
 ['Quale pattern è l\'inverso del 12?',['16','15','14','11'],0],
 ['Nei pattern 17 e 18 il cavallo entra:',['Sul galoppo sinistro senza fermarsi al centro','Al passo','Al jog obbligatorio','Con rundown'],0],
 ['Nel Pattern 11 l\'ingresso al centro è:',['Al jog obbligatorio','Al passo o jog','Al galoppo','Con rundown'],0],
 ['I pattern A e B sono riservati a:',['Youth 10 & Under Short Stirrup e Para-Reining','Open','Non Pro','Green'],0],
 ['Nel rollback il cavallo ruota di:',['180° sui posteriori, ripartendo al galoppo','90°','360° sui posteriori','180° sugli anteriori'],0],
 ['Il "drape" delle redini indica:',['L\'ansa di redine lasca che dimostra leggerezza','Le redini attorcigliate','La lunghezza del romal','Il contatto costante'],0],
 ['La differenza tra large fast e small slow circle deve essere:',['Evidente in velocità e dimensione','Solo in dimensione','Impercettibile','Solo in velocità'],0],
 ['Nello spin il cavallo ruota su:',['Il posteriore interno piantato','L\'anteriore esterno','Entrambi gli anteriori','Il posteriore esterno'],0],
 ['Nello sliding stop gli anteriori devono:',['Continuare a muoversi liberi (pedalare)','Bloccarsi','Alzarsi','Incrociare'],0],
 ['"Hesitate" dopo gli spin serve a:',['Dimostrare il controllo','Riposare il cavallo','Contare i giri','Cambiare mano'],0],
 ['Stop e backup vengono giudicati come:',['Una manovra sola','Due manovre','Tre manovre','Non vengono giudicati'],0],
 ['In NRHA il curb bit a una mano è obbligatorio per cavalli di:',['6 anni e oltre','3 anni e oltre','Tutte le età','Solo Open'],0],
 ['Un jog fino a 2 passi vale:',['Penalità ½','Penalità 2','Penalità 1','Nessuna'],0],
 ['Cambiare mano sulle redini vale:',['Penalità 1','Penalità ½','Penalità 5','Score 0'],0],
 ['Nei rundown la velocità deve essere:',['In aumento progressivo e controllato','Massima da subito','Costante','Decrescente'],0],
 ['Un cerchio "small slow" va eseguito:',['Raccolto e lento, con differenza evidente','Alla stessa velocità del large','Al jog','Al passo'],0],
];
let qset=[],qi=0,qscore=0;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(){qset=shuffle(Q.slice()).slice(0,12);qi=0;qscore=0;renderQ()}
function renderQ(){const body=document.getElementById('q-body');document.getElementById('q-count').textContent=`Domanda ${Math.min(qi+1,12)} / 12`;document.getElementById('q-score').textContent=qscore+' pt';document.getElementById('q-bar').style.width=(qi/12*100)+'%';
 if(qi>=12){if(best===null||qscore>best){best=qscore}save();DB.quiz(qscore).catch(()=>{});body.innerHTML=`<div class="stat-n">${qscore} / 12</div><p style="margin-top:10px">${qscore>=11?'Livello giudice. Ora vai in arena.':qscore>=8?'Solido. Ripassa le penalità che hai sbagliato.':'Ripassa Giudizio e Pattern, poi riprova.'}</p><button class="btn primary" id="q-again">Rifai il quiz</button>`;document.getElementById('q-again').onclick=startQuiz;return}
 const q=qset[qi];const opts=q[1].map((o,i)=>({o,i}));shuffle(opts);
 body.innerHTML=`<div class="question">${q[0]}</div><div class="opts">${opts.map(x=>`<button data-i="${x.i}">${x.o}</button>`).join('')}</div><div id="q-fb" class="pill"></div>`;
 body.querySelectorAll('.opts button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===q[2];body.querySelectorAll('.opts button').forEach(x=>{x.disabled=true;if(+x.dataset.i===q[2])x.classList.add('ok')});if(!ok)b.classList.add('ko');else qscore++;document.getElementById('q-fb').innerHTML=(ok?'<span style="color:var(--brass2)">Corretto.</span>':'<span style="color:var(--red)">Sbagliato.</span>')+' <button class="btn small" id="q-nx" style="margin-left:8px">Avanti ▶</button>';document.getElementById('q-nx').onclick=()=>{qi++;renderQ()}})}
document.getElementById('q-start').onclick=startQuiz;

/* ---------- board ---------- */
async function renderBoard(){const t=document.getElementById('board');const note=document.getElementById('board-note');
 if(!sb){note.textContent='Classifica non disponibile offline.';return}
 note.textContent='Caricamento…';const rows=await DB.board().catch(()=>[]);
 t.querySelectorAll('tr:not(:first-child)').forEach(r=>r.remove());
 rows.forEach((r,i)=>{const tr=document.createElement('tr');if(profile&&r.id===profile.id)tr.className='me';tr.innerHTML=`<td>${i+1}</td><td>${esc(r.name)}</td><td>${esc(r.horse||'—')}</td><td>${r.best_quiz??'—'}</td><td>${r.pats}/${P.length}</td><td>${r.mans}/${MAN.length}</td><td>${r.quizzes}</td>`;t.appendChild(tr)});
 note.textContent=rows.length?`${rows.length} cavalieri registrati.`:'Nessun cavaliere ancora. Accedi per essere il primo.';
 if(profile){const i=rows.findIndex(r=>r.id===profile.id);document.getElementById('k-rank').textContent=i>=0?(i+1)+'ª':'—'}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

/* ---------- login ---------- */
const modal=document.getElementById('modal');
function riderUI(){document.getElementById('rider-name').textContent=profile?profile.name:'Ospite';document.getElementById('rider-horse').textContent=profile?(profile.horse||'progressi sincronizzati'):'progressi solo su questo dispositivo';document.getElementById('rider-btn').textContent=profile?'Profilo':'Accedi';document.getElementById('l-logout').hidden=!profile}
document.getElementById('rider-btn').onclick=()=>{modal.hidden=false;document.getElementById('l-err').textContent='';if(profile){document.getElementById('l-name').value=profile.name;document.getElementById('l-horse').value=profile.horse||''}setTimeout(()=>document.getElementById(profile?'l-pin':'l-name').focus(),50)};
document.getElementById('l-cancel').onclick=()=>modal.hidden=true;
document.getElementById('l-logout').onclick=()=>{profile=null;store.set('profile',null);synced={man:{},pat:{}};riderUI();modal.hidden=true;kpis()};
document.getElementById('login-form').onsubmit=async e=>{e.preventDefault();const err=document.getElementById('l-err');err.textContent='';const name=document.getElementById('l-name').value.trim(),pin=document.getElementById('l-pin').value.trim(),horse=document.getElementById('l-horse').value.trim();
 if(!/^\d{4}$/.test(pin)){err.textContent='Il PIN deve avere 4 cifre.';return}
 try{const r=await DB.login(name,pin,horse);profile={id:r.id,name:r.name,horse:r.horse};store.set('profile',profile);await DB.load();save();buildMan();renderPat();riderUI();modal.hidden=true;document.getElementById('l-pin').value='';renderBoard()}
 catch(ex){err.textContent=/PIN errato/.test(ex.message||'')?'PIN errato per questo nome.':'Errore: '+(ex.message||'riprova')}};

/* ---------- kpis ---------- */
function kpis(){const m=Object.keys(manDone).length,p=Object.keys(patRead).length;
 document.getElementById('k-man').textContent=m+'/'+MAN.length;document.getElementById('k-pat').textContent=p;document.getElementById('k-quiz').textContent=best===null?'—':best;
 document.getElementById('q-best').textContent=best===null?'—':best+' / 12';
 document.getElementById('q-prog').innerHTML=[['Manovre',m,MAN.length],['Pattern',p,P.length]].map(r=>`<div class="prog-row"><div class="pill"><span>${r[0]}</span><span>${r[1]}/${r[2]}</span></div><div class="bar" style="margin:6px 0 0"><i style="width:${r[1]/r[2]*100}%"></i></div></div>`).join('')}

/* ---------- boot ---------- */
buildMan();renderPat();riderUI();kpis();
if(profile)DB.load().then(()=>{save();buildMan();renderPat();renderBoard()}).catch(()=>{});
