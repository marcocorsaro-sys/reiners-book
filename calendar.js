/* Reiner's Book - Calendario gare (dati: tabella qha_events, aggiornata ogni notte dal cron /api/sync-events).
   Fonte: Showliste pubblica di showmanager.info. Nessun contatto personale degli organizzatori viene mostrato.
   Modulo autonomo (come videos.js): inietta da solo voce di menu, sezione e stili. */
(function(){
 const nav=document.getElementById('nav'), pat=document.getElementById('v-pat');
 if(!nav||!pat)return;

 const st=document.createElement('style');
 st.textContent=`
 .cal-top{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:18px 0}
 .cal-top .card{padding:14px 16px}
 .cal-filters{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin:6px 0 14px;padding:12px;border:1px solid var(--line);background:var(--panel)}
 .cal-filters label{display:flex;flex-direction:column;gap:4px;font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin:0}
 .cal-filters select,.cal-filters input[type=search]{background:var(--ink2);border:1px solid var(--line2);color:var(--cream);padding:8px 10px;font:14px var(--sans);min-width:150px;width:auto;margin:0}
 .cal-filters .chk{flex-direction:row;align-items:center;gap:6px;text-transform:none;letter-spacing:0;font:13px var(--sans);color:var(--muted);padding:8px 10px}
 .cal-month{font-family:var(--serif);font-size:26px;color:var(--brass2);margin:26px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--line);text-transform:capitalize}
 .ev{display:grid;grid-template-columns:104px 1fr auto;gap:14px;padding:12px 4px;border-bottom:1px solid var(--line);align-items:start}
 .ev.past{opacity:.5}.ev.cancelled .ev-n{text-decoration:line-through;color:var(--dim)}
 .ev.live{background:var(--brass-dim);outline:1px solid var(--brass);padding-left:10px}
 .ev-d{font-family:var(--mono);font-size:12px;color:var(--brass2);line-height:1.35}
 .ev-d b{display:block;font-size:20px;font-weight:700;color:var(--cream)}
 .ev-n{font-family:var(--serif);font-size:21px;line-height:1.2;color:var(--cream)}
 .ev-m{font-size:13px;color:var(--muted);margin-top:3px}
 .ev-t{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
 .tg{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border:1px solid var(--line2);color:var(--muted)}
 .tg.k{border-color:var(--brass);color:var(--brass2)}.tg.bad{border-color:var(--burgundy);color:var(--red)}.tg.warn{border-color:#8a6a1f;color:#d9b24a}.tg.it{background:var(--brass);color:var(--ink);border-color:var(--brass);font-weight:700}
 .ev-a{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
 .ev-a a,.ev-a button{font-family:var(--mono);font-size:11px;color:var(--muted);text-decoration:none;background:none;border:0;cursor:pointer;padding:2px 0}
 .ev-a a:hover,.ev-a button:hover{color:var(--brass2)}
 .ev-a .star{font-size:18px;color:var(--dim)}.ev-a .star.on{color:var(--brass2)}
 .ev-note{font-size:12.5px;color:var(--dim);margin-top:4px;word-break:break-word}
 @media(max-width:640px){.ev{grid-template-columns:1fr;gap:6px}.ev-a{flex-direction:row;flex-wrap:wrap;align-items:center;gap:14px}}`;
 document.head.appendChild(st);

 const sec=document.createElement('section');sec.className='view';sec.id='v-cal';
 sec.innerHTML=`
  <div class="eyebrow">Capitolo I · Stagione 2026</div>
  <h2 class="vt">Calendario gare</h2>
  <p class="lead">Tutte le gare di reining in calendario su Showmanager, aggiornate automaticamente ogni notte. Filtra per paese, tipo e periodo, segui le tue con la stella e aggiungile al tuo calendario.</p>
  <div class="cal-top" id="c-top"></div>
  <div class="cal-filters">
    <label>Cerca <input type="search" id="c-q" placeholder="gara, città, organizzatore"></label>
    <label>Paese <select id="c-country"></select></label>
    <label>Tipo <select id="c-kind"></select></label>
    <label>Mese <select id="c-month"></select></label>
    <label>Disciplina <select id="c-disc"><option value="reining">Reining</option><option value="all">Tutte (cutting, cow horse)</option></select></label>
    <label>Periodo <select id="c-when"><option value="up">Da oggi</option><option value="all">Tutta la stagione</option></select></label>
    <label class="chk"><input type="checkbox" id="c-can" style="width:auto;margin:0"> Mostra annullate</label>
    <label class="chk"><input type="checkbox" id="c-fav" style="width:auto;margin:0"> Solo seguite ★</label>
  </div>
  <div class="note" id="c-count"></div>
  <div id="c-list"></div>
  <div class="note" style="margin-top:18px">Fonte: elenco pubblico di <a href="https://www.showmanager.info/Showliste.aspx?year=2026" target="_blank" rel="noopener">showmanager.info</a>. Date e stato (annullata/rinviata) possono cambiare: prima di partire controlla sempre con l'organizzatore. <span id="c-sync"></span></div>`;
 pat.parentNode.insertBefore(sec,pat);

 const $=id=>document.getElementById(id);
 const CN={US:'USA',MX:'Messico',FR:'Francia',NL:'Paesi Bassi',IT:'Italia',PL:'Polonia',AT:'Austria',DE:'Germania',CH:'Svizzera',BE:'Belgio',SE:'Svezia',NO:'Norvegia',DK:'Danimarca',GB:'Regno Unito',CZ:'Rep. Ceca',SK:'Slovacchia',ES:'Spagna',PT:'Portogallo',HU:'Ungheria',FI:'Finlandia',IE:'Irlanda',CA:'Canada',AU:'Australia',BR:'Brasile',AR:'Argentina'};
 const flag=c=>c&&c.length===2?String.fromCodePoint(...[...c.toUpperCase()].map(x=>127397+x.charCodeAt(0))):'🏳';
 const ymd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
 const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};
 const fd=(d,o)=>d.toLocaleDateString('it-IT',o);
 const p2=n=>String(n).padStart(2,'0');
 const compact=d=>`${d.getFullYear()}${p2(d.getMonth()+1)}${p2(d.getDate())}`;
 const endExcl=e=>{const d=ymd(e.end_date);d.setDate(d.getDate()+1);return compact(d)};
 const place=e=>[e.location,CN[e.country]||e.country].filter(Boolean).join(', ');
 const KIND_ALL=['Futurity','Derby','Maturity','Campionato','Slide','Youth/Scuola'];
 let EV=null,loaded=false,err=null,lastSync=null,fav=store.get('cal-fav',{});

 async function load(){
  if(loaded)return; loaded=true;
  if(!sb){err='Supabase non disponibile.';return}
  const r=await sb.from('qha_events').select('*').order('start_date').order('name');
  if(r.error){err=r.error.message;loaded=false;return}
  EV=r.data;
  const l=await sb.from('qha_sync_log').select('ran_at').order('ran_at',{ascending:false}).limit(1);
  lastSync=l.data&&l.data[0]?new Date(l.data[0].ran_at):null;
 }

 function ics(e){
  const BS=String.fromCharCode(92), t=x=>String(x||'').split(BS).join(BS+BS).split(',').join(BS+',').split(';').join(BS+';');
  const CRLF=String.fromCharCode(13,10);
  const s=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Reiners Book//Calendario//IT','BEGIN:VEVENT','UID:'+e.key+'@reiners-book','DTSTAMP:'+compact(new Date())+'T000000Z','DTSTART;VALUE=DATE:'+e.start_date.split('-').join(''),'DTEND;VALUE=DATE:'+endExcl(e),'SUMMARY:'+t(e.name),'LOCATION:'+t(place(e)),'DESCRIPTION:'+t('Organizzatore: '+(e.organizer||'n.d.')+' - Fonte: '+e.source_url),'END:VEVENT','END:VCALENDAR'].join(CRLF)+CRLF;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/calendar'}));a.download=e.name.replace(/[^A-Za-z0-9]+/g,'-').slice(0,50)+'.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
 }
 const gcal=e=>'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(e.name)+'&dates='+e.start_date.split('-').join('')+'/'+endExcl(e)+'&location='+encodeURIComponent(place(e))+'&details='+encodeURIComponent('Fonte: '+e.source_url);

 function opts(sel,items,first){sel.innerHTML=(first?`<option value="">${first}</option>`:'')+items.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('')}

 function build(){
  if(sec.dataset.built)return; sec.dataset.built=1;
  const cs=[...new Set(EV.map(e=>e.country).filter(Boolean))].sort((a,b)=>(CN[a]||a).localeCompare(CN[b]||b));
  opts($('c-country'),cs.map(c=>[c,`${flag(c)} ${CN[c]||c}`]),'Tutti i paesi');
  opts($('c-kind'),KIND_ALL.map(k=>[k,k]),'Tutti i tipi');
  const months=[...new Set(EV.map(e=>e.start_date.slice(0,7)))].sort();
  opts($('c-month'),months.map(m=>[m,fd(new Date(m+'-01T12:00'),{month:'long',year:'numeric'})]),'Tutti i mesi');
  ['c-country','c-kind','c-month','c-disc','c-when','c-q','c-can','c-fav'].forEach(i=>$(i).addEventListener(i==='c-q'?'input':'change',draw));
  $('c-list').addEventListener('click',ev=>{
   const b=ev.target.closest('[data-a]');if(!b)return;const e=EV.find(x=>x.key===b.dataset.k);if(!e)return;
   if(b.dataset.a==='ics')ics(e);
   if(b.dataset.a==='star'){if(fav[e.key])delete fav[e.key];else fav[e.key]=1;store.set('cal-fav',fav);draw()}
  });
 }

 function top(list){
  const t=today(), up=list.filter(e=>e.status!=='cancelled'&&ymd(e.end_date)>=t);
  const live=up.filter(e=>ymd(e.start_date)<=t), next=up.find(e=>ymd(e.start_date)>t);
  const it=up.find(e=>e.country==='IT'&&ymd(e.start_date)>=t)||up.find(e=>e.country==='IT');
  const days=e=>Math.round((ymd(e.start_date)-t)/864e5);
  const canc=list.filter(e=>e.status==='cancelled'&&ymd(e.end_date)>=t).length;
  const card=(l,n,s)=>`<div class="card"><div class="stat-l">${l}</div><div class="stat-n small">${n}</div><div class="ev-m">${s}</div></div>`;
  $('c-top').innerHTML=
   card('Gare da oggi',up.length,`${live.length?live.length+' in corso ora · ':''}${canc} annullate`)+
   (next?card('Prossima gara',days(next)+' gg',esc(next.name)):'')+
   (it?card('Prossima in Italia',ymd(it.start_date)<=t?'in corso':days(it)+' gg',esc(it.name)+' · '+esc(it.location||'')):'');
 }

 function draw(){
  const t=today(), c=$('c-country').value,k=$('c-kind').value,m=$('c-month').value,d=$('c-disc').value,w=$('c-when').value,q=$('c-q').value.trim().toLowerCase(),hideC=!$('c-can').checked,fv=$('c-fav').checked;
  const all=EV.filter(e=>d==='all'||e.discipline===d);
  top(all);
  let l=all.filter(e=>(!c||e.country===c)&&(!k||(e.kinds||[]).includes(k))&&(!m||e.start_date.startsWith(m))&&(!hideC||e.status!=='cancelled')&&(!fv||fav[e.key])&&(!q||(e.name+' '+(e.location||'')+' '+(e.organizer||'')).toLowerCase().includes(q)));
  if(w==='up'&&!m)l=l.filter(e=>ymd(e.end_date)>=t);
  $('c-count').textContent=l.length+' eventi';
  if(!l.length){$('c-list').innerHTML='<p class="note">Nessun evento con questi filtri.</p>';return}
  let cur='',h='';
  for(const e of l){
   const mm=e.start_date.slice(0,7);
   if(mm!==cur){cur=mm;h+=`<div class="cal-month">${fd(new Date(mm+'-01T12:00'),{month:'long',year:'numeric'})}</div>`}
   const s=ymd(e.start_date),en=ymd(e.end_date),same=e.start_date===e.end_date;
   const past=en<t,live=s<=t&&en>=t&&e.status!=='cancelled';
   const tags=[e.country==='IT'?'<span class="tg it">Italia</span>':'',e.status==='cancelled'?'<span class="tg bad">Annullata</span>':'',e.status==='postponed'?'<span class="tg warn">Rinviata</span>':'',e.status==='full'?'<span class="tg warn">Al completo</span>':'',live?'<span class="tg k">In corso</span>':'',...(e.kinds||[]).map(x=>`<span class="tg k">${esc(x)}</span>`),e.discipline!=='reining'?`<span class="tg">${e.discipline==='cutting'?'Cutting':'Cow horse'}</span>`:''].join('');
   const note=e.notes?esc(e.notes).replace(/(https?:[/][/][^ <]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'):'';
   h+=`<div class="ev ${past?'past':''} ${e.status==='cancelled'?'cancelled':''} ${live?'live':''}">
    <div class="ev-d"><b>${same?s.getDate():s.getDate()+'–'+en.getDate()}</b>${same?fd(s,{weekday:'short',month:'short'}):(s.getMonth()===en.getMonth()?fd(s,{month:'short'}):fd(s,{day:'numeric',month:'short'})+' → '+fd(en,{day:'numeric',month:'short'}))}</div>
    <div><div class="ev-n">${esc(e.name)}</div>
     <div class="ev-m">${flag(e.country)} ${esc(e.location||'—')}${e.country?' · '+esc(CN[e.country]||e.country):''}${e.organizer?' · '+esc(e.organizer):''}</div>
     <div class="ev-t">${tags}</div>${note?`<div class="ev-note">${note}</div>`:''}</div>
    <div class="ev-a"><button class="star ${fav[e.key]?'on':''}" data-a="star" data-k="${e.key}" title="Segui" aria-label="Segui">${fav[e.key]?'★':'☆'}</button>
     <button data-a="ics" data-k="${e.key}">＋ .ics</button><a href="${gcal(e)}" target="_blank" rel="noopener">Google Cal</a>
     <a href="${esc(e.source_url)}" target="_blank" rel="noopener">Showmanager ↗</a></div></div>`;
  }
  $('c-list').innerHTML=h;
 }

 async function renderCal(){
  const box=$('c-list'); if(!EV){box.innerHTML='<p class="note">Carico il calendario…</p>';await load()}
  if(err||!EV){box.innerHTML=`<p class="note">Calendario non disponibile: ${esc(err||'errore')}. Riprova più tardi.</p>`;loaded=false;return}
  build();draw();
  $('c-sync').textContent=lastSync?'Ultimo aggiornamento automatico: '+fd(lastSync,{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'';
 }

 // aggancio alla navigazione di app.js
 VIEWS.push('cal');
 const _show=show;
 show=function(v){_show(v);if(v==='cal')renderCal()};
 if((location.hash||'').slice(1)==='cal')show('cal');
})();
