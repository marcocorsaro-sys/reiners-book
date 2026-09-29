/* Reiner's Book — video YouTube per pattern.
   Ogni ID è stato verificato via YouTube oEmbed il 29/09/2026 (esiste, titolo coerente col pattern).
   type: 'run' = cavaliere in gara/allenamento · 'walk' = spiegazione del pattern (animata o di un trainer). */
const VIDEOS = {
 '1': [{id:'gaBhRwVsxyQ',type:'walk',t:'Matt Mills - Walking Through Reining Pattern #1',c:'Matt Mills'},{id:'-vXWSewDPx0',type:'walk',t:'How to prepare for NRHA Pattern #1',c:'Matt Mills'}],
 '2': [{id:'JAgtYs_GTUI',type:'run',t:"Leah Martin and Gonna Makeit Bigtime NRHA Pattern #2",c:'Jimmy Smith'},{id:'m96gLwVkmVo',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 2',c:'Horse Show Pattern Pro'}],
 '3': [{id:'hGMGa8ip4xU',type:'run',t:'NRHA Pattern 3 with a score of a 71',c:'MK Hardin Class of 2027'},{id:'U8XXEknKyzM',type:'run',t:'Outta Dough Reining by the Bay Pattern 3',c:'Stacy Adams'},{id:'TEMeoeHEGaA',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 3',c:'Horse Show Pattern Pro'}],
 '4': [{id:'jGF60XcVf3Y',type:'run',t:'Busy Chex N Lena - Pattern 4 (marked 71)',c:'7michele7'},{id:'af3Q0lmCBM0',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 4',c:'Horse Show Pattern Pro'}],
 '5': [{id:'TwmhZPCa11w',type:'run',t:'Riding reining pattern # 5 (con commento del trainer)',c:'Warwick Schiller'},{id:'hdaoDZWGdOk',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 5',c:'Horse Show Pattern Pro'}],
 '6': [{id:'qtpJE15MA-0',type:'run',t:'Wimpys Little Lucky MJ Pattern 6',c:'Nicole Brown'},{id:'CIs-ALecios',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 6',c:'Horse Show Pattern Pro'}],
 '7': [{id:'ww9fxZQbk6Y',type:'run',t:'Wyatt SWRHA show pattern 7',c:'Deary Performance Horses'},{id:'5IJmEcI7BlY',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 7',c:'Horse Show Pattern Pro'}],
 '8': [{id:'YySkwdh5kn0',type:'run',t:'Rein N Time, Bub Poplin, marking a 72 - NRHA Pattern 8',c:'John Walsdorf'},{id:'JEjEMQQE37Q',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 8',c:'Horse Show Pattern Pro'}],
 '9': [{id:'gkVFoXqo5NE',type:'walk',t:'NRHA Pattern 9 (Sep 2015)',c:'RHV2000'},{id:'wshIZr1aYyM',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 9',c:'Horse Show Pattern Pro'}],
 '10': [{id:'mVtMm1ZKsaM',type:'run',t:'DuNit N Starlight Reining pattern 10',c:'Stephanie Briggs'},{id:'d6lmqxfJamA',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 10',c:'Horse Show Pattern Pro'}],
 '11': [{id:'vhQVuKl4ReE',type:'run',t:'NRHA Derby 2025 Youth, 4th of 69, Pattern 11 (140.5)',c:'Pip Brown Riding'},{id:'hzDsfSnf5hI',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 11',c:'Horse Show Pattern Pro'}],
 '12': [{id:'ftSBP5Z7PRE',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 12',c:'Horse Show Pattern Pro'}],
 '13': [{id:'azkiBdp93Yo',type:'run',t:'SWRHA Futurity - NRHA Green Reiner Pattern 13',c:'reininginthemoonlight'},{id:'bvdi9BixiGI',type:'walk',t:'Horse Show Pattern Pro: Reining Pattern 13',c:'Horse Show Pattern Pro'}],
 '14': [{id:'YZV8EmnV-3o',type:'run',t:'Cruising through NRHA Pattern 14 in the Youth (70.5, 2nd)',c:'MK Hardin Class of 2027'}],
 '15': [{id:'_tu2a8kvKtE',type:'run',t:'Magnum Motion pattern 15',c:'MK Hardin Class of 2027'},{id:'r8qtQIkXrNc',type:'run',t:'Rowen Harvey, Hollywood Blue Chip, pattern 15',c:'rojosh winsor'}],
 '16': [{id:'KkImuLMv2g0',type:'run',t:'Leah Martin and Gonna Makeit Bigtime NRHA Pattern #16',c:'Jimmy Smith'},{id:'yy50jMrSCT4',type:'run',t:"Jessica Martin & Commandalena's Legacy NRHA Pattern #16",c:'Jessica Martin'}],
 '17': [{id:'LzV_NhwyuGY',type:'run',t:'NRHA Pattern 17, Sidney Hawk, 1st place (CORHA 2024)',c:'SidneyHawkEquine'},{id:'C3RQwxCkoFk',type:'run',t:'IRHA Youth Champs, 72 - Magnum Motion - Pattern 17',c:'MK Hardin Class of 2027'}],
 '18': [{id:'So26IdDFgQQ',type:'run',t:'NRHA Pattern 18 at CORHA, Sidney Hawk (2024)',c:'SidneyHawkEquine'}],
 'A': [{id:'f9Bh0ZMTFHc',type:'run',t:'Brighton Brown Short Stirrup pattern A',c:'Brandice Brown'}],
 'B': []
};
const VTYPE = {run:'Run', walk:'Spiegazione'};

(function(){
 const st=document.createElement('style');
 st.textContent=`
 .vbox{margin:0 0 16px;border:1px solid var(--line);background:var(--panel)}
 .vhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid var(--line)}
 .vhead .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin-right:4px}
 .vtab{font-family:var(--mono);font-size:11px;padding:5px 10px;background:transparent;border:1px solid var(--line2);color:var(--muted);cursor:pointer}
 .vtab.on{background:var(--brass);color:var(--ink);border-color:var(--brass);font-weight:700}
 .vstage{position:relative;aspect-ratio:16/9;background:#000;max-width:100%}
 .vstage iframe,.vstage img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}
 .vplay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(14,11,9,.35);border:0;cursor:pointer;padding:0}
 .vplay span{width:68px;height:68px;border-radius:50%;background:var(--brass);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:26px;padding-left:5px}
 .vplay:hover span{background:var(--brass2)}
 .vmeta{padding:10px 12px;font-size:13px;color:var(--muted)}
 .vmeta b{color:var(--cream);font-weight:500}
 .vmeta a{font-family:var(--mono);font-size:11px}
 .vnone{padding:14px 12px;font-size:14px;color:var(--muted)}`;
 document.head.appendChild(st);
 const list=document.getElementById('p-steps'); if(!list) return;
 const box=document.createElement('div'); box.className='vbox'; box.id='p-video'; list.parentNode.insertBefore(box,list);
 let vi=0,lastP=null,shown=null;
 function search(pid){return 'https://www.youtube.com/results?search_query='+encodeURIComponent('NRHA reining pattern '+pid)}
 function render(){
  const p=P[curP]; if(lastP!==p.id){vi=0;lastP=p.id}
  shown=p.id;
  const vs=VIDEOS[p.id]||[]; const v=vs[vi];
  if(!v){box.innerHTML=`<div class="vhead"><span class="lbl">Video</span></div><div class="vnone">Nessun video affidabile trovato per il Pattern ${p.id}. <a href="${search(p.id)}" target="_blank" rel="noopener">Cerca su YouTube</a></div>`;return}
  box.innerHTML=`<div class="vhead"><span class="lbl">Video</span>${vs.map((x,i)=>`<button class="vtab ${i===vi?'on':''}" data-i="${i}">${VTYPE[x.type]} ${vs.filter(y=>y.type===x.type).indexOf(x)+1}</button>`).join('')}</div>
  <div class="vstage" id="vstage"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt=""><button class="vplay" aria-label="Riproduci video"><span>▶</span></button></div>
  <div class="vmeta"><b>${esc(v.t)}</b> · ${esc(v.c)} · <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">apri su YouTube</a> · <a href="${search(p.id)}" target="_blank" rel="noopener">altri video</a></div>`;
  box.querySelector('.vplay').onclick=()=>{document.getElementById('vstage').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0" title="${esc(v.t)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`};
 }
 box.addEventListener('click',e=>{const b=e.target.closest('.vtab');if(!b)return;vi=+b.dataset.i;render()});
 // aggancio a renderPat: ogni cambio di pattern aggiorna anche il video
 const _renderPat=renderPat;
 renderPat=function(){_renderPat();if(shown!==P[curP].id)render()};
 render();
})();


/* ===== Video professionali per le manovre (scheda "Manovre") =====
   Ogni ID e' stato verificato via YouTube oEmbed il 29/09/2026: esiste ed e' incorporabile.
   Scelti per canale/trainer riconosciuto (Luca Fappani, Matt Mills, Larry Trocha, Pete Kyle...); titolo e canale sono quelli pubblici su YouTube. */
const MVIDEOS = {
 stop:[{id:'ELvr80RkVJo',t:'Horse Training Tips for the Stop - Reining Horse Stop',c:'Larry Trocha'},{id:'-jSfSXK6R9Q',t:'Secrets to the STOP! Full-length lesson with professional reiner',c:'Zacharias Horsemanship'}],
 back:[{id:'2XqfTbplIdo',t:'How to Train a Horse to Stop & Back Up - Basics of sliding stop for reining',c:'Larry Trocha'},{id:'qH1moIBE4fg',t:'Mastering the Horse Backup: A Step-by-Step Training Guide',c:'Tim Anderson Ranch and Horse Training'}],
 roll:[{id:'MZwv9zMPwFY',t:'Perfect a Rollback in less than 90 seconds',c:'Matt Mills'},{id:'f4JY3BqRiVU',t:'Western - Reining - Roll Back',c:'myhorsetv'}],
 spin:[{id:'WM5RLXyPibI',t:'How to Teach Your Horse How to Spin - Step 1',c:'Matt Mills'},{id:'Fp9tHXQQeAE',t:'Luca Fappani teaches the spin',c:'Luca Fappani'},{id:'r3gFlOh2l_4',t:'Improving Your Spins with Pete Kyle',c:'Virtual Horse Help'}],
 circle:[{id:'FLTuN5b126c',t:'Transitioning From A Large Fast To Small Slow Circle',c:'Virtual Horse Help'}],
 lead:[{id:'LkRNUQjATZo',t:'First Time Changing Leads on a Reining Horse - NRHA Million Dollar Rider, Luca Fappani',c:'Luca Fappani'},{id:'0tu1M4abZMU',t:'Horse Training Tips for Flying Lead Changes',c:'Larry Trocha'}],
 run:[{id:'TeQZvlpRhv0',t:'Properly Setting Up the Rundown with Luca Fappani',c:'Luca Fappani'}],
 hes:[{id:'RJS-pv4-G0w',t:'Teaching your horse to shut off in a spin',c:'Matt Mills'},{id:'q0Ml2bQiSOY',t:'Keeping my horse focused on me',c:'Luca Fappani'}]
};
(function(){
 const st=document.createElement('style');
 st.textContent=`
 .mv{margin:0 0 14px;border:1px solid var(--line);background:var(--ink2)}
 .mv-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 10px;border-bottom:1px solid var(--line)}
 .mv-h .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-right:4px}
 .mv-tab{font-family:var(--mono);font-size:11px;padding:4px 9px;background:transparent;border:1px solid var(--line2);color:var(--muted);cursor:pointer}
 .mv-tab.on{background:var(--brass);color:var(--ink);border-color:var(--brass);font-weight:700}
 .mv-stage{position:relative;aspect-ratio:16/9;background:#000;max-width:100%}
 .mv-stage iframe,.mv-stage img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}
 .mv-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(14,11,9,.35);border:0;cursor:pointer;padding:0}
 .mv-play span{width:60px;height:60px;border-radius:50%;background:var(--brass);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:22px;padding-left:4px}
 .mv-play:hover span{background:var(--brass2)}
 .mv-m{padding:8px 10px;font-size:12.5px;color:var(--muted)}
 .mv-m b{color:var(--cream);font-weight:500}
 .mv-m a{font-family:var(--mono);font-size:11px}`;
 document.head.appendChild(st);
 const list=document.getElementById('man-list'); if(!list||typeof MAN==='undefined')return;
 const idx={};
 function draw(k){
  const box=document.getElementById('mv-'+k); if(!box)return;
  const vs=MVIDEOS[k]||[]; const i=idx[k]||0; const v=vs[i]; if(!v){box.remove();return}
  box.innerHTML=`<div class="mv-h"><span class="lbl">Video · trainer professionisti</span>${vs.length>1?vs.map((x,j)=>`<button class="mv-tab ${j===i?'on':''}" data-k="${k}" data-i="${j}">${j+1}</button>`).join(''):''}</div>
  <div class="mv-stage"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy"><button class="mv-play" aria-label="Riproduci video"><span>▶</span></button></div>
  <div class="mv-m"><b>${esc(v.t)}</b> · ${esc(v.c)} · <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">apri su YouTube</a></div>`;
  box.querySelector('.mv-play').onclick=()=>{box.querySelector('.mv-stage').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0" title="${esc(v.t)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`};
 }
 function inject(){
  MAN.forEach(m=>{
   const card=document.getElementById('man-'+m.k); if(!card||document.getElementById('mv-'+m.k))return;
   if(!(MVIDEOS[m.k]||[]).length)return;
   const box=document.createElement('div'); box.className='mv'; box.id='mv-'+m.k;
   const head=card.querySelector('.man-head'); head.parentNode.insertBefore(box,head.nextSibling);
   draw(m.k);
  });
 }
 list.addEventListener('click',e=>{const b=e.target.closest('.mv-tab');if(!b)return;idx[b.dataset.k]=+b.dataset.i;draw(b.dataset.k)});
 // buildMan (app.js) ricostruisce le schede al login: reinserisco i video dopo ogni rebuild
 const _buildMan=buildMan;
 buildMan=function(){_buildMan();inject()};
 inject();
})();
const CAV = {
 stop:[["4sAs78B_dz4","Putting a Good Stop on a Horse - Q&A","7:41"],["g0Qh-6VoCPc","Getting a Horse to Stop","3:54"],["B1KM7Huc_KA","Lessons Learned: A Horse's Walk Determines How Well They Stop","4:32"],["XPyH6Zy-P0c","Reining Mare is Stopping Hard on Her Front End - Q&A","4:21"],["n-uU-fw77qM","The better a horse backs up, the better he'll stop and collect","Short"],["hAsM5sMf0P0","One Rein Stops are your emergency brakes on your horse","Short"],["wU1pkwqvfeA","Give your horse a chance to read your seat before doing a One Rein Stop","Short"],["jHyKBtHWChM","You Must Teach the One Rein Stop to Your Horse in Order for it to Work","5:00"],["tBv2iXs8Zys","Ginger - Big Stopping Prospect","Short"]],
 back:[["cj4vnwTfwVQ","Backing Up With Tulsi","17:34"],["ylxfzFOaaA0","Backing Up With Elon","14:17"],["WK9_6f5TNZg","Get your horse's steering going backward as good as it is going forward","3:20"],["PKfH0nKL2f8","Backing your horse up fixes problems like biting and pushy behavior","Short"],["OTXplcKkZ70","Practicing backing your horse in a circle will help him back a straight line better","Short"],["QSmaN9CBQPE","Backing Squares","Short"],["RPMUbbxTWZA","You always want your cow horses thinking: back and over","Short"]],
 roll:[["szsqfo5NSxE","Training Tip: How Rollbacks on the Fence Can Improve Your Horse","15:30"],["j634g-bZsAA","Rollbacks on the Fence is one of the most beneficial exercises you can do with your horse","Short"],["Y6nhoUXhIrA","Professional Clinician Jeff Davis shares a rollback drill we use during training","Short"],["pVsOMQFmwfE","Rollbacks in the desert with Brownie","5:18"]],
 spin:[["Dxlpnzp0Neo","The foundation of the turnaround","Short"],["jQCiHWBrJaA","Teaching the turnaround","Short"],["pCtpFtO5yi8","Teaching a horse to do a turnaround is about cadence, not speed","3:10"],["xWyAjXkcJX8","Focus on correctness before speed when teaching your horse to turn around","Short"],["Y9Qw9c-29sE","Use Turnarounds to Engage Your Horse on the Trail","2:12"],["D5P8BoDCjmY","Yield the Hindquarters Stage 1 - a key groundwork exercise for all horses","Short"],["88eTw0bNFqY","Yield the Hindquarters With Candace","21:48"],["jy_jXx-h0Gs","Refining Yield the Hindquarters With Elon","18:12"]],
 circle:[["A4IoVoj5-ug","Training Tip: Teach Your Hot Horse to Lope Slowly","2:49"],["AhkSG27Os60","Loping Drills With Prada","10:26"],["aJxxuU9Ftug","Horse Bucks When Asked to Collect at the Canter","5:33"],["z8DKKxAKmH4","Flower Power is a great loping exercise to improve a horse's steering","Short"],["rjtxkiOHEI0","Practice loping to teach your horse to lope with cadence","Short"],["9Qt3QM5FBp0","Loping will improve your horse's walk","Short"],["szcuOeRucy0","Chaocco P cantering on a loose rein","Short"],["cBu5Hu2APzE","Counterbending is a great warm-up exercise to practice with your horse","Short"]],
 lead:[["29byp89yQVc","Why we teach horses to do lead changes out of a countercanter","Short"],["zqOjLfaFrHA","If a horse can't do a correct lead departure, they won't be able to do a flying lead change either","Short"],["Iri8ySD-eYY","Doing a lead change should become second-nature to your horse","Short"],["8ykiC4X6Em4","The key to lead changes is body control","Short"],["ndugXhHZ5AA","Lead changes with Prada","Short"],["lDIK_5sRH8Q","Lessons Learned: Pay Attention to How Well a Horse Stays on the Correct Lead","2:06"],["8Vbm_0J7FLQ","The key to getting a horse to pick up the correct lead is being able to position their body","Short"]],
 run:[["EwZQFDnaETo","Fencing and Rundowns With Prada","3:11"],["mlaFe8BofZg","Hustle the horse out of the turn onto the straight line","Short"],["oaL4qdVYytU","Chaocco P starting to rate himself approaching jumps at No Excuses Nation","Short"]],
 hes:[["h7ASIc71b90","Ignore the distractions. Focus on you","Short"],["QqjevdaDUro","You can't train a horse that isn't paying attention to you","Short"],["bwnLaY7Qmds","Horse Won't Flex to the Halter","2:20"],["xDZnoRKKnoM","Hinging works on softening and suppling the horse's head and neck","Short"]],
 found:[["D5P8BoDCjmY","Yield the Hindquarters Stage 1 - a key groundwork exercise for all horses","Short"],["nOF_Zev2QVc","Yielding a horse's hindquarters gives you control","Short"],["opFTxlooqvU","Jeff works on refining Yield the Forequarters with Elon","Short"],["43d3zE0JRVQ","Serpentines are a great exercise to work on suppling your horse's entire body","Short"],["0MMrPFMCWBg","Oil your horse's five body paets with suppling exercises every ride","Short"],["hMdsisphZn4","Two-Tracking is an important suppling and body-control exercise","Short"],["t4k9Eu_vG_s","An exercise for ribcage control","Short"],["23beiwFdk2U","Lunging for Respect Stage Two with a colt","Short"],["YmmG3Jd2AB0","Lunging for Respect, Stage 1 With Donald","38:55"],["aThx2L6ybrg","Get off my leg, stay soft in my hands","Short"],["cBu5Hu2APzE","Counterbending is a great warm-up exercise to practice with your horse","Short"]]
};
(function(){
 const st=document.createElement('style');
 st.textContent=`
 .ca{margin:0 0 14px;border:1px solid var(--line);background:var(--ink2)}
 .ca-h{padding:9px 10px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--brass)}
 .ca-h small{display:block;margin-top:3px;letter-spacing:.04em;text-transform:none;color:var(--muted);font-family:var(--sans,inherit);font-size:12px}
 .ca-stage{position:relative;aspect-ratio:16/9;background:#000;max-width:100%}
 .ca-stage iframe,.ca-stage img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}
 .ca-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(14,11,9,.35);border:0;cursor:pointer;padding:0}
 .ca-play span{width:60px;height:60px;border-radius:50%;background:var(--brass);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:22px;padding-left:4px}
 .ca-play:hover span{background:var(--brass2)}
 .ca-now{padding:8px 10px;font-size:12.5px;color:var(--muted)}
 .ca-now b{color:var(--cream);font-weight:500}
 .ca-now a{font-family:var(--mono);font-size:11px}
 .ca-list{display:flex;flex-direction:column;border-top:1px solid var(--line);max-height:260px;overflow:auto}
 .ca-it{display:flex;gap:10px;align-items:center;text-align:left;padding:7px 10px;background:transparent;border:0;border-bottom:1px solid var(--line);color:var(--muted);cursor:pointer;font-size:12.5px}
 .ca-it:hover{background:rgba(201,162,77,.07)}
 .ca-it.on{color:var(--cream);background:rgba(201,162,77,.12)}
 .ca-it .d{flex:none;min-width:44px;text-align:center;font-family:var(--mono);font-size:10.5px;padding:2px 5px;border:1px solid var(--line2);color:var(--brass)}
 .ca-it .t{flex:1;min-width:0}`;
 document.head.appendChild(st);
 const list=document.getElementById('man-list'); if(!list||typeof MAN==='undefined')return;
 const idx={};
 const HEAD={found:['Fondamenta · Metodo Clinton Anderson','Esercizi a terra e in sella che preparano tutte le manovre: yield, suppling, lunge, controllo del corpo.']};
 function draw(k){
  const box=document.getElementById('ca-'+k); if(!box)return;
  const vs=CAV[k]||[]; const i=idx[k]||0; const v=vs[i]; if(!v){box.remove();return}
  const h=HEAD[k]||['Metodo Clinton Anderson','Dal canale Downunder Horsemanship: esercizi di base e lavoro per questa manovra. Approccio da cow horse/performance horse, non regolamento NRHA.'];
  box.innerHTML=`<div class="ca-h">${esc(h[0])}<small>${esc(h[1])}</small></div>
  <div class="ca-stage"><img src="https://i.ytimg.com/vi/${v[0]}/hqdefault.jpg" alt="" loading="lazy"><button class="ca-play" aria-label="Riproduci video"><span>▶</span></button></div>
  <div class="ca-now"><b>${esc(v[1])}</b> · DUHorseman · <a href="https://www.youtube.com/watch?v=${v[0]}" target="_blank" rel="noopener">apri su YouTube</a></div>
  <div class="ca-list">${vs.map((x,j)=>`<button class="ca-it ${j===i?'on':''}" data-k="${k}" data-i="${j}"><span class="d">${esc(x[2])}</span><span class="t">${esc(x[1])}</span></button>`).join('')}</div>`;
  box.querySelector('.ca-play').onclick=()=>{box.querySelector('.ca-stage').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${v[0]}?autoplay=1&rel=0" title="${esc(v[1])}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`};
 }
 function mk(k){const b=document.createElement('div');b.className='ca';b.id='ca-'+k;return b}
 function inject(){
  if((CAV.found||[]).length&&!document.getElementById('ca-found')){list.insertBefore(mk('found'),list.firstChild);draw('found')}
  MAN.forEach(m=>{
   const card=document.getElementById('man-'+m.k); if(!card||document.getElementById('ca-'+m.k))return;
   if(!(CAV[m.k]||[]).length)return;
   const box=mk(m.k); const prev=document.getElementById('mv-'+m.k)||card.querySelector('.man-head');
   prev.parentNode.insertBefore(box,prev.nextSibling); draw(m.k);
  });
 }
 list.addEventListener('click',e=>{const b=e.target.closest('.ca-it');if(!b)return;idx[b.dataset.k]=+b.dataset.i;draw(b.dataset.k)});
 const _bm=buildMan;
 buildMan=function(){_bm();inject()};
 inject();
})();
