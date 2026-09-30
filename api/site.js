// Reiner's Book - pagine indicizzabili (SSR con cache CDN): /pattern, /manovre, /giudizio, /morso, /calendario, sitemap.xml
// Legge i contenuti da data.js / videos.js / index.html (una sola fonte di verità con l'app) e li rende come HTML statico con JSON-LD.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = 'https://reiningitalia.com';
const SB = 'https://zjpoquehofvkmdvsrvpb.supabase.co/rest/v1';
const SBK = 'sb_publishable_0OA_stzRwrznLCdB4RmUWg__tzYcUoE';
const NAME = "Reiner's Book";

const rd = f => fs.readFileSync(path.join(process.cwd(), f), 'utf8');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

let DATA = null;
function data() {
  if (DATA) return DATA;
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(rd('data.js') + '\nthis.MAN=MAN;this.P=P;', ctx);
  let v = rd('videos.js');
  // solo le costanti: taglio le IIFE che toccano il DOM
  const cut = v.split('\n').filter(l => !/^\(function\(\)\{/.test(l));
  const src = [];
  let depth = 0, skipping = false;
  for (const l of v.split('\n')) {
    if (/^\(function\(\)\{/.test(l)) { skipping = true; continue; }
    if (skipping) { if (/^\}\)\(\);?\s*$/.test(l)) skipping = false; continue; }
    src.push(l);
  }
  vm.runInContext(src.join('\n') + '\nthis.VIDEOS=VIDEOS;this.MVIDEOS=MVIDEOS;this.CAV=CAV;', ctx);
  const idx = rd('index.html');
  const sec = id => (idx.match(new RegExp(`<section class="view" id="v-${id}">([\\s\\S]*?)</section>`)) || [])[1] || '';
  DATA = { MAN: ctx.MAN, P: ctx.P, VIDEOS: ctx.VIDEOS, MVIDEOS: ctx.MVIDEOS, CAV: ctx.CAV, rein: sec('rein'), bit: sec('bit') };
  return DATA;
}

const CSS = `
:root{--ink:#0e0b09;--ink2:#14100d;--brass:#c9a24d;--brass2:#e2c473;--cream:#efe4cf;--mut:#a89c86}
*{box-sizing:border-box}body{margin:0;background:var(--ink);color:var(--cream);font:16px/1.65 Inter,system-ui,sans-serif}
a{color:var(--brass2)}a:hover{color:#fff}
header.top{border-bottom:1px solid #2a221b;background:var(--ink2);position:sticky;top:0;z-index:5}
.wrap{max-width:920px;margin:0 auto;padding:0 20px}
header.top .wrap{display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:12px 20px}
.logo{font:600 22px 'Cormorant Garamond',Georgia,serif;color:var(--cream);text-decoration:none}.logo em{color:var(--brass)}
nav.m{display:flex;gap:14px;flex-wrap:wrap;font:500 13px 'JetBrains Mono',monospace}nav.m a{text-decoration:none;color:var(--mut)}nav.m a:hover,nav.m a.on{color:var(--brass2)}
main{padding:34px 0 60px}
h1{font:600 clamp(32px,6vw,52px)/1.1 'Cormorant Garamond',Georgia,serif;margin:.2em 0 .3em}
h2{font:600 28px 'Cormorant Garamond',Georgia,serif;color:var(--brass2);margin:1.6em 0 .4em}
h3{font:600 12px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);margin:1.2em 0 .3em}
.eyebrow{font:500 12px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--brass)}
.lead{font-size:18px;color:#d9ccb3}
.crumbs{font:12px 'JetBrains Mono',monospace;color:var(--mut)}.crumbs a{color:var(--mut)}
.cta{display:inline-block;margin:6px 8px 6px 0;padding:10px 18px;border:1px solid var(--brass);border-radius:8px;color:var(--cream);text-decoration:none;font-weight:600}
.cta.p{background:var(--brass);color:var(--ink)}
ol.steps{padding-left:0;list-style:none;counter-reset:s}ol.steps li{counter-increment:s;background:var(--ink2);border:1px solid #2a221b;border-radius:10px;padding:12px 14px 12px 52px;margin:8px 0;position:relative}
ol.steps li:before{content:counter(s);position:absolute;left:14px;top:10px;font:700 18px 'JetBrains Mono',monospace;color:var(--brass)}
.en{display:block;color:var(--mut);font-size:14px;font-style:italic;margin-top:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.card{display:block;background:var(--ink2);border:1px solid #2a221b;border-radius:10px;padding:14px;text-decoration:none;color:var(--cream)}.card:hover{border-color:var(--brass)}
.card b{display:block;font:600 20px 'Cormorant Garamond',serif;color:var(--brass2)}.card span{font-size:13px;color:var(--mut)}
.vid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.vid a{text-decoration:none;color:var(--cream);font-size:14px}.vid img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;border:1px solid #2a221b;display:block}
.vid small{color:var(--mut)}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #2a221b;padding:8px 10px;text-align:left;vertical-align:top}th{background:var(--ink2);color:var(--brass2)}
.note,.judge,blockquote{border-left:3px solid var(--brass);padding:6px 14px;background:var(--ink2);border-radius:0 8px 8px 0;color:#d9ccb3}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.stat{background:var(--ink2);border:1px solid #2a221b;border-radius:10px;padding:12px}.stat-n{font:700 26px 'JetBrains Mono',monospace;color:var(--brass2)}.stat-l{font-size:12px;color:var(--mut)}
.ev{background:var(--ink2);border:1px solid #2a221b;border-radius:10px;padding:12px 14px;margin:8px 0}.ev a.t{font:600 19px 'Cormorant Garamond',serif;text-decoration:none}.ev .m{font-size:13px;color:var(--mut)}
.tag{display:inline-block;font:11px 'JetBrains Mono',monospace;border:1px solid #3a2f24;border-radius:20px;padding:1px 8px;margin-right:4px;color:var(--brass)}
footer{border-top:1px solid #2a221b;padding:26px 0 50px;color:var(--mut);font-size:13px}footer a{color:var(--mut)}
ul.f{columns:2;padding-left:18px}@media(max-width:640px){ul.f{columns:1}}
`;

function layout({ title, desc, url, body, ld = [], active = '', og = 'website', noindex = false }) {
  const canon = BASE + url;
  const nav = [['/calendario', 'Calendario'], ['/pattern', 'Pattern'], ['/manovre', 'Manovre'], ['/giudizio', 'Giudizio'], ['/morso', 'Morso']]
    .map(([h, t]) => `<a href="${h}"${active === h ? ' class="on"' : ''}>${t}</a>`).join('');
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">'}
<meta property="og:type" content="${og}"><meta property="og:site_name" content="${NAME}"><meta property="og:locale" content="it_IT">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}">
<meta name="twitter:card" content="summary"><meta name="theme-color" content="#0e0b09">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap">
<style>${CSS}</style>
${ld.map(jld).join('\n')}
</head><body>
<header class="top"><div class="wrap"><a class="logo" href="/">Reiner's <em>Book</em></a><nav class="m">${nav}<a href="/">App</a></nav></div></header>
<main><div class="wrap">${body}</div></main>
<footer><div class="wrap">
<p><b>${NAME}</b> — guida indipendente al Reining in italiano: pattern NRHA 2026, manovre, giudizio, regole del morso e calendario gare. Non affiliato a NRHA, IRHA, OPES o ISHA: fa fede sempre il regolamento ufficiale in vigore.</p>
<ul class="f"><li><a href="/calendario">Calendario gare di reining</a></li><li><a href="/pattern">I 20 pattern NRHA</a></li><li><a href="/manovre">Le 8 manovre del reining</a></li><li><a href="/giudizio">Come giudica il giudice</a></li><li><a href="/morso">Morso ammesso in gara?</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
</div></footer></body></html>`;
}

const breadcrumb = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: BASE + u }))
});
const org = { '@type': 'Organization', name: NAME, url: BASE + '/' };
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const crumbs = items => `<div class="crumbs">${items.map(([n, u], i) => i < items.length - 1 ? `<a href="${u}">${esc(n)}</a>` : esc(n)).join(' › ')}</div>`;
const ytLink = (id, t, c) => `<a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${esc(t)}" loading="lazy" width="480" height="360"><b>${esc(t)}</b><br><small>${esc(c || '')} · YouTube</small></a>`;

/* ---------- pagine ---------- */
function pPatternIndex() {
  const { P } = data();
  const body = `${crumbs([['Home', '/'], ['Pattern', '/pattern']])}
<div class="eyebrow">NRHA Pattern Book 2026</div><h1>I 20 pattern NRHA di reining, spiegati manovra per manovra</h1>
<p class="lead">I 18 pattern NRHA ufficiali e i 2 Short Stirrup (A e B), tradotti in italiano con il testo originale inglese: ordine delle manovre, spin, circle, lead change, stop e hesitate. Per ogni pattern trovi anche i video di run e spiegazioni.</p>
<div class="grid">${P.map(p => `<a class="card" href="/pattern/${esc(p.id)}"><b>${esc(p.name)}</b><span>${p.steps.length} manovre · ${esc(strip(p.start)).slice(0, 70)}</span></a>`).join('')}</div>
<p><a class="cta p" href="/#pat">Apri i pattern interattivi</a><a class="cta" href="/manovre">Studia le manovre</a></p>
<div class="note">Fonte: NRHA Handbook &amp; Pattern Book 2026. I pattern vanno eseguiti come scritti, non come disegnati: fa fede il testo.</div>`;
  return layout({
    title: 'Pattern NRHA Reining 2026: tutti i 20 pattern in italiano | Reiner\'s Book',
    desc: 'I 20 pattern NRHA di reining (1-18, A e B) in italiano: sequenza delle manovre, testo originale, video di run e spiegazioni.',
    url: '/pattern', body, active: '/pattern',
    ld: [breadcrumb([['Home', '/'], ['Pattern', '/pattern']]),
      { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Pattern NRHA Reining 2026', numberOfItems: P.length,
        itemListElement: P.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}/pattern/${p.id}`, name: p.name })) }]
  });
}

function pPattern(id) {
  const { P, VIDEOS } = data();
  const i = P.findIndex(p => String(p.id) === String(id));
  if (i < 0) return null;
  const p = P[i], vids = VIDEOS[p.id] || [];
  const title = `NRHA Reining ${p.name}: manovre in ordine e video | Reiner's Book`;
  const first = strip(p.steps[0][0]);
  const desc = `${p.name} NRHA 2026 in italiano: ${p.steps.length} manovre passo per passo (${strip(p.start).replace(/\.$/, '')}). Testo originale, penalità e video.`.slice(0, 300);
  const url = `/pattern/${p.id}`;
  const prev = P[i - 1], next = P[i + 1];
  const body = `${crumbs([['Home', '/'], ['Pattern', '/pattern'], [p.name, url]])}
<div class="eyebrow">NRHA Pattern Book 2026</div><h1>${esc(p.name)} di reining</h1>
<p class="lead">${esc(p.start)} Il pattern è composto da ${p.steps.length} manovre; sotto trovi la sequenza in italiano con il testo originale NRHA.</p>
<h2>Sequenza delle manovre</h2>
<ol class="steps">${p.steps.map(s => `<li>${esc(s[0])}<span class="en" lang="en">${esc(s[1])}</span></li>`).join('')}</ol>
${vids.length ? `<h2>Video del ${esc(p.name)}</h2><div class="vid">${vids.map(v => ytLink(v.id, v.t, v.c)).join('')}</div>` : ''}
<p><a class="cta p" href="/#pat">Vedi il ${esc(p.name)} disegnato nell'arena</a><a class="cta" href="/giudizio">Penalità e punteggi</a></p>
<p>${prev ? `<a href="/pattern/${prev.id}">← ${esc(prev.name)}</a>` : ''}${prev && next ? ' · ' : ''}${next ? `<a href="/pattern/${next.id}">${esc(next.name)} →</a>` : ''}</p>
<div class="note">Fonte: NRHA Pattern Book 2026. Il testo prevale sul disegno. Guida indipendente, non ufficiale.</div>`;
  return layout({
    title, desc, url, body, active: '/pattern', og: 'article',
    ld: [breadcrumb([['Home', '/'], ['Pattern', '/pattern'], [p.name, url]]),
      { '@context': 'https://schema.org', '@type': 'HowTo', name: `Come si esegue il ${p.name} NRHA di reining`, description: desc, inLanguage: 'it',
        step: p.steps.map((s, k) => ({ '@type': 'HowToStep', position: k + 1, text: s[0] })) },
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, inLanguage: 'it', mainEntityOfPage: BASE + url, publisher: org, about: 'NRHA reining pattern' }]
  });
}

function pManIndex() {
  const { MAN } = data();
  const body = `${crumbs([['Home', '/'], ['Manovre', '/manovre']])}
<div class="eyebrow">Capitolo IV</div><h1>Le 8 manovre del reining</h1>
<p class="lead">Sliding stop, backup, rollback, spin, circle, flying lead change, rundown e hesitate: per ciascuna la meccanica, gli aiuti, la progressione di addestramento e cosa guarda il giudice.</p>
<div class="grid">${MAN.map(m => `<a class="card" href="/manovre/${m.k}"><b>${esc(m.it)}</b><span>${esc(m.en)}</span></a>`).join('')}</div>
<p><a class="cta p" href="/#man">Segna le manovre studiate nell'app</a></p>`;
  return layout({
    title: 'Le manovre del reining: stop, spin, rollback, lead change | Reiner\'s Book',
    desc: 'Le 8 manovre del reining spiegate in italiano: meccanica, aiuti, progressione di addestramento e criteri di giudizio NRHA.',
    url: '/manovre', body, active: '/manovre',
    ld: [breadcrumb([['Home', '/'], ['Manovre', '/manovre']]),
      { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Manovre del reining', itemListElement: MAN.map((m, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}/manovre/${m.k}`, name: m.it })) }]
  });
}

function pMan(k) {
  const { MAN, MVIDEOS, CAV } = data();
  const i = MAN.findIndex(m => m.k === k);
  if (i < 0) return null;
  const m = MAN[i], vids = MVIDEOS[k] || [], cav = CAV[k] || [];
  const url = `/manovre/${k}`;
  const desc = `${m.it} (${m.en}) nel reining: ${strip(m.mech)}`.slice(0, 300);
  const faq = [
    [`Come funziona ${m.it.toLowerCase()} nel reining?`, strip(m.mech)],
    [`Cosa valuta il giudice in ${m.it.toLowerCase()}?`, strip(m.judge)],
    [`Come si insegna ${m.it.toLowerCase()} al cavallo?`, m.prog.map(strip).join(' ')]
  ];
  const body = `${crumbs([['Home', '/'], ['Manovre', '/manovre'], [m.it, url]])}
<div class="eyebrow">${esc(m.en)}</div><h1>${esc(m.it)} nel reining</h1>
<h2>Meccanica</h2><p>${m.mech}</p>
<h2>Aiuti</h2><ul>${m.aids.map(a => `<li>${a}</li>`).join('')}</ul>
<h2>Progressione di addestramento</h2><ol>${m.prog.map(a => `<li>${a}</li>`).join('')}</ol>
<h2>Cosa giudica il giudice</h2><p class="judge">${m.judge}</p>
${vids.length ? `<h2>Video di trainer professionisti</h2><div class="vid">${vids.map(v => ytLink(v.id, v.t, v.c)).join('')}</div>` : ''}
${cav.length ? `<h2>Metodo Clinton Anderson</h2><p class="en">Approccio da cow horse / performance horse, non regolamento NRHA.</p><div class="vid">${cav.slice(0, 6).map(v => ytLink(v[0], v[1], 'Clinton Anderson')).join('')}</div>` : ''}
<p><a class="cta p" href="/#man">Apri nell'app</a><a class="cta" href="/pattern">Vedi i pattern</a></p>
<p>${MAN[i - 1] ? `<a href="/manovre/${MAN[i - 1].k}">← ${esc(MAN[i - 1].it)}</a>` : ''}${MAN[i - 1] && MAN[i + 1] ? ' · ' : ''}${MAN[i + 1] ? `<a href="/manovre/${MAN[i + 1].k}">${esc(MAN[i + 1].it)} →</a>` : ''}</p>`;
  return layout({
    title: `${m.it} nel reining (${m.en}): meccanica, aiuti, giudizio | Reiner's Book`,
    desc, url, body, active: '/manovre', og: 'article',
    ld: [breadcrumb([['Home', '/'], ['Manovre', '/manovre'], [m.it, url]]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: `${m.it} nel reining`, inLanguage: 'it', mainEntityOfPage: BASE + url, publisher: org },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]
  });
}

function pRein() {
  const { rein } = data();
  const inner = rein.replace(/<div class="eyebrow">[\s\S]*?<\/div>\s*<h1>[\s\S]*?<\/h1>/, '').replace(/data-go="[^"]*"/g, '').replace(/href="#(\w+)"/g, (_, x) => `href="/${{ bit: 'morso' }[x] || x}"`);
  const body = `${crumbs([['Home', '/'], ['Giudizio', '/giudizio']])}
<div class="eyebrow">Capitolo V</div><h1>Come giudica il giudice di reining: punteggi e penalità NRHA</h1>${inner}
<p><a class="cta p" href="/#quiz">Fai il quiz sulle penalità</a><a class="cta" href="/pattern">I pattern</a></p>`;
  const faq = [
    ['Qual è il punteggio base nel reining NRHA?', 'Il punteggio base è 70 (average); ogni manovra viene valutata da −1½ a +1½.'],
    ['Cosa significa off pattern?', 'Un pattern non eseguito come scritto (off pattern) vale zero.'],
    ['Come si giudicano stop e backup?', 'Stop e backup si giudicano come una manovra sola.']
  ];
  return layout({
    title: 'Giudizio reining NRHA: scala −1½/+1½, penalità e punteggio 70 | Reiner\'s Book',
    desc: 'Come si giudica il reining: punteggio base 70, scala di manovra da −1½ a +1½, tabella penalità (0, 5, 2, 1, ½ punti) ed equipaggiamento ammesso NRHA.',
    url: '/giudizio', body, active: '/giudizio',
    ld: [breadcrumb([['Home', '/'], ['Giudizio', '/giudizio']]),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]
  });
}

function pBit() {
  const { bit } = data();
  let inner = bit.replace(/<div class="eyebrow">[\s\S]*?<\/div>\s*<h1>[\s\S]*?<\/h1>/, '');
  // tolgo form e foto (interattivi): resta il testo regolamentare
  inner = inner.replace(/<div class="two"[\s\S]*?<h2>Regole a confronto<\/h2>/, '<h2>Regole a confronto</h2>');
  const body = `${crumbs([['Home', '/'], ['Morso', '/morso']])}
<div class="eyebrow">Capitolo III</div><h1>Morso nel reining: misure ammesse NRHA/IRHA e OPES/ISHA</h1>${inner}
<p><a class="cta p" href="/#bit">Verifica il tuo morso (calcolatore + parere da foto)</a></p>`;
  const faq = [
    ['Quanto può essere lunga la leva del morso in una gara NRHA?', 'Massimo 8½" (21,6 cm) dal bridle ring al rein ring.'],
    ['Qual è il diametro minimo del cannone?', 'Minimo 5/16" (8 mm), misurato a 1" (25 mm) dalla guancia.'],
    ['Quanto può essere alto il ponte?', 'Massimo 3½" (8,9 cm).'],
    ['Cosa succede con un morso irregolare?', 'Un morso irregolare dopo il run comporta no score.']
  ];
  return layout({
    title: 'Morso reining ammesso in gara? Misure NRHA/IRHA e OPES/ISHA | Reiner\'s Book',
    desc: 'Leva max 21,6 cm, cannone min 8 mm, ponte max 8,9 cm: le regole del morso per il reining NRHA/IRHA e OPES/ISHA a confronto, con verificatore online.',
    url: '/morso', body, active: '/morso',
    ld: [breadcrumb([['Home', '/'], ['Morso', '/morso']]),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]
  });
}

/* ---------- calendario ---------- */
const CN = { US: 'USA', MX: 'Messico', FR: 'Francia', NL: 'Paesi Bassi', IT: 'Italia', PL: 'Polonia', AT: 'Austria', DE: 'Germania', CH: 'Svizzera', BE: 'Belgio', SE: 'Svezia', NO: 'Norvegia', DK: 'Danimarca', GB: 'Regno Unito', CZ: 'Rep. Ceca', SK: 'Slovacchia', ES: 'Spagna', PT: 'Portogallo', HU: 'Ungheria', FI: 'Finlandia', IE: 'Irlanda', CA: 'Canada', AU: 'Australia', BR: 'Brasile' };
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const evSlug = e => `${slug(e.name)}-${e.key}`;
const evKey = s => (String(s).match(/([0-9a-f]{16})$/) || [])[1];
const fdate = (s, o) => new Date(s + 'T12:00:00Z').toLocaleDateString('it-IT', Object.assign({ timeZone: 'UTC' }, o));
const range = e => e.start_date === e.end_date ? fdate(e.start_date, { day: 'numeric', month: 'long', year: 'numeric' }) : `${fdate(e.start_date, { day: 'numeric', month: 'long' })} – ${fdate(e.end_date, { day: 'numeric', month: 'long', year: 'numeric' })}`;
const place = e => [e.location, CN[e.country] || e.country].filter(Boolean).join(', ');

async function events(extra = '') {
  const r = await fetch(`${SB}/qha_events?select=key,name,start_date,end_date,country,location,status,kinds,info_url,updated_at&order=start_date.asc,name.asc${extra}`, { headers: { apikey: SBK } });
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}
const evLD = e => ({
  '@context': 'https://schema.org', '@type': 'SportsEvent', name: e.name, sport: 'Reining',
  startDate: e.start_date, endDate: e.end_date,
  eventStatus: e.status === 'cancelled' ? 'https://schema.org/EventCancelled' : e.status === 'postponed' ? 'https://schema.org/EventPostponed' : 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: { '@type': 'Place', name: e.location || CN[e.country] || e.country, address: { '@type': 'PostalAddress', addressLocality: e.location || undefined, addressCountry: e.country } },
  url: `${BASE}/calendario/${evSlug(e)}`
});
const evLi = e => `<div class="ev"><a class="t" href="/calendario/${evSlug(e)}">${esc(e.name)}</a>${e.status !== 'scheduled' ? ` <span class="tag">${esc(e.status)}</span>` : ''}<div class="m">${esc(range(e))} · ${esc(place(e))}</div>${(e.kinds || []).map(k => `<span class="tag">${esc(k)}</span>`).join('')}</div>`;

async function pCal() {
  const all = await events();
  const today = new Date().toISOString().slice(0, 10);
  const up = all.filter(e => e.end_date >= today && e.status !== 'cancelled');
  const it = up.filter(e => e.country === 'IT');
  const year = new Date().getUTCFullYear();
  const body = `${crumbs([['Home', '/'], ['Calendario', '/calendario']])}
<div class="eyebrow">Aggiornato ogni notte</div><h1>Calendario gare di reining ${year}: Italia ed Europa</h1>
<p class="lead">${up.length} gare di reining in programma (${it.length} in Italia): futurity, derby, maturity, campionati e slide. Dati raccolti dalla lista pubblica delle gare e aggiornati ogni notte.</p>
${it.length ? `<h2>Prossime gare in Italia</h2>${it.slice(0, 30).map(evLi).join('')}` : ''}
<h2>Prossime gare in Europa e nel mondo</h2>${up.filter(e => e.country !== 'IT').slice(0, 60).map(evLi).join('')}
<p><a class="cta p" href="/#cal">Filtra per paese e aggiungi al tuo calendario</a></p>
<div class="note">Le date possono cambiare: verifica sempre con l'organizzatore. Sito indipendente.</div>`;
  return layout({
    title: `Calendario gare di reining ${year}: Italia ed Europa | Reiner's Book`,
    desc: `Tutte le prossime gare di reining ${year} in Italia e in Europa: futurity, derby, maturity, campionati e slide. Aggiornato ogni notte.`,
    url: '/calendario', body, active: '/calendario',
    ld: [breadcrumb([['Home', '/'], ['Calendario', '/calendario']]),
      { '@context': 'https://schema.org', '@type': 'ItemList', name: `Gare di reining ${year}`, itemListElement: up.slice(0, 50).map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}/calendario/${evSlug(e)}`, name: e.name })) }]
  });
}

async function pEvent(s) {
  const key = evKey(s);
  if (!key) return null;
  const r = await events(`&key=eq.${key}`);
  const e = r[0];
  if (!e) return null;
  const url = `/calendario/${evSlug(e)}`;
  const desc = `${e.name}: gara di reining ${range(e)} a ${place(e)}. ${(e.kinds || []).join(', ')}`.trim().slice(0, 300);
  const body = `${crumbs([['Home', '/'], ['Calendario', '/calendario'], [e.name, url]])}
<div class="eyebrow">Gara di reining${e.status !== 'scheduled' ? ' · ' + esc(e.status) : ''}</div><h1>${esc(e.name)}</h1>
<div class="stats"><div class="stat"><div class="stat-n" style="font-size:18px">${esc(range(e))}</div><div class="stat-l">date</div></div><div class="stat"><div class="stat-n" style="font-size:18px">${esc(place(e))}</div><div class="stat-l">luogo</div></div></div>
<p>${(e.kinds || []).map(k => `<span class="tag">${esc(k)}</span>`).join('')}</p>
${e.info_url ? `<p><a href="${esc(e.info_url)}" rel="nofollow noopener" target="_blank">Sito dell'evento</a></p>` : ''}
<p><a class="cta p" href="/#cal">Aggiungi al calendario</a><a class="cta" href="/calendario">Tutte le gare</a></p>
<div class="note">Fonte: lista pubblica delle gare; le date possono variare, verifica con l'organizzatore.</div>`;
  return layout({ title: `${e.name} — reining ${fdate(e.start_date, { month: 'long', year: 'numeric' })}, ${place(e)} | Reiner's Book`, desc, url, body, active: '/calendario', og: 'article',
    noindex: e.status === 'cancelled',
    ld: [breadcrumb([['Home', '/'], ['Calendario', '/calendario'], [e.name, url]]), evLD(e)] });
}

async function sitemap() {
  const { P, MAN } = data();
  let ev = [];
  try { ev = await events(); } catch (e) { }
  const u = (loc, lm, pr) => `<url><loc>${BASE}${loc}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ''}${pr ? `<priority>${pr}</priority>` : ''}</url>`;
  const today = new Date().toISOString().slice(0, 10);
  const urls = [u('/', today, '1.0'), u('/calendario', today, '0.9'), u('/pattern', null, '0.9'), u('/manovre', null, '0.9'), u('/giudizio', null, '0.8'), u('/morso', null, '0.8'),
    ...P.map(p => u('/pattern/' + p.id, null, '0.7')), ...MAN.map(m => u('/manovre/' + m.k, null, '0.7')),
    ...ev.filter(e => e.status !== 'cancelled').map(e => u('/calendario/' + evSlug(e), (e.updated_at || '').slice(0, 10), '0.5'))];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
}

module.exports = async (req, res) => {
  const p = String((req.query && req.query.p) || '').replace(/^\/+|\/+$/g, '');
  const [a, b] = p.split('/');
  try {
    let html = null, type = 'text/html; charset=utf-8', cache = 'public, s-maxage=86400, stale-while-revalidate=604800';
    if (a === 'sitemap.xml') { html = await sitemap(); type = 'application/xml; charset=utf-8'; cache = 'public, s-maxage=3600, stale-while-revalidate=86400'; }
    else if (a === 'pattern') html = b ? pPattern(b) : pPatternIndex();
    else if (a === 'manovre') html = b ? pMan(b) : pManIndex();
    else if (a === 'giudizio') html = pRein();
    else if (a === 'morso') html = pBit();
    else if (a === 'calendario') { html = b ? await pEvent(b) : await pCal(); cache = 'public, s-maxage=3600, stale-while-revalidate=86400'; }
    if (!html) { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(layout({ title: 'Pagina non trovata | Reiner\'s Book', desc: 'Pagina non trovata', url: '/' + p, noindex: true, body: '<h1>Pagina non trovata</h1><p><a href="/">Torna alla home</a></p>' })); }
    res.statusCode = 200; res.setHeader('Content-Type', type); res.setHeader('Cache-Control', cache);
    res.end(html);
  } catch (err) {
    res.statusCode = 500; res.setHeader('Content-Type', 'text/plain'); res.end('Errore: ' + err.message);
  }
};
