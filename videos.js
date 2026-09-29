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
