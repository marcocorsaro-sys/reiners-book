// Parser della Showliste pubblica di showmanager.info (robots.txt: /Showliste.aspx consentito, crawl-delay 10s).
// Non estrae né pubblica contatti personali (telefoni/email): solo dati dell'evento.
const crypto = require('crypto');

const SRC = 'https://www.showmanager.info/Showliste.aspx?year=';
const CC = { USA:'US', MEX:'MX', FRA:'FR', NED:'NL', ITA:'IT', POL:'PL', AUT:'AT', GER:'DE', SUI:'CH', BEL:'BE', SWE:'SE', NOR:'NO', DEN:'DK', GBR:'GB', CZE:'CZ', SVK:'SK', ESP:'ES', POR:'PT', HUN:'HU', FIN:'FI', IRL:'IE', CAN:'CA', AUS:'AU', BRA:'BR', ARG:'AR', UAE:'AE', UKR:'UA', SLO:'SI', CRO:'HR', ROU:'RO', LUX:'LU', LTU:'LT', LAT:'LV', EST:'EE', BUL:'BG', GRE:'GR', TUR:'TR', RSA:'ZA', NZL:'NZ' };

const dec = s => (s || '')
  .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

function parseDates(raw, fallbackYear) {
  const m = raw.match(/(\d{2})\.(\d{2})\.(?:\s*-\s*(\d{2})\.(\d{2})\.)?\s*(\d{4})?/);
  if (!m) return null;
  const y = +(m[5] || fallbackYear);
  const s = `${y}-${m[2]}-${m[1]}`;
  const e = m[3] ? `${m[5] ? y : y}-${m[4]}-${m[3]}` : s;
  return { start: s, end: e };
}

const STATUS_RX = [
  ['cancelled', /cancel|annul|abgesagt|cancelled|annullat/i],
  ['postponed', /postpone|rinvia|verschoben|reporté|report[eé]/i],
  ['full', /\bfull\b|booked full|waitinglist/i],
];
function status(name, notes) {
  const t = `${name} ${notes || ''}`;
  for (const [k, rx] of STATUS_RX) if (rx.test(t)) return k;
  return 'scheduled';
}
function cleanName(n) {
  return n.replace(/^\s*(POSTPONED|CANCELLED|CANCELED|ANNUL[EÉ]?)\s*[-–:]\s*/i, '')
          .replace(/\s*[\/(]?\s*(ANNULE\/CANCELLED|CANCELLED|CANCELED|ANNUL[EÉ]\/CANCELED)\s*\)?\s*$/i, '')
          .replace(/\s*\((FULL)\)\s*$/i, '').replace(/\s+/g, ' ').trim();
}
function kinds(name) {
  const n = name.toLowerCase(), k = [];
  if (/futurity/.test(n)) k.push('Futurity');
  if (/derby/.test(n)) k.push('Derby');
  if (/maturity/.test(n)) k.push('Maturity');
  if (/champion|meisterschaft|mistrzostwa|campionato|masters?\b|world reining/.test(n)) k.push('Campionato');
  if (/slide|spin|rundown/.test(n)) k.push('Slide');
  if (/cutting/.test(n)) k.push('Cutting');
  if (/cow ?horse|reined cow|\bcow\b/.test(n)) k.push('Cow horse');
  if (/youth|rookie|green|schooling|clinic/.test(n)) k.push('Youth/Scuola');
  return k;
}
function discipline(name) {
  const n = name.toLowerCase();
  if (/cutting/.test(n)) return 'cutting';
  if (/cow ?horse|reined cow|s cow classic/.test(n)) return 'cowhorse';
  return 'reining';
}
function key(name, start, cc) {
  return crypto.createHash('sha1').update(`${cleanName(name).toLowerCase().replace(/[^a-z0-9]+/g, '')}|${start}|${cc || ''}`).digest('hex').slice(0, 16);
}

function parse(html, year) {
  const out = [];
  const rx = /<tr id="ctl00_ContentPlaceHolder1_PR_ctl(\d+)_tr3"[\s\S]*?(?=<tr id="ctl00_ContentPlaceHolder1_PR_ctl\d+_tr3"|<\/table>\s*<\/td>\s*<\/tr>\s*<\/table>|$)/g;
  let m;
  while ((m = rx.exec(html))) {
    const b = m[0], idx = +m[1];
    const lab = n => { const r = b.match(new RegExp(`PR_ctl${m[1]}_Label${n}"[^>]*>([\\s\\S]*?)</span>`)); return r ? r[1] : ''; };
    const name = dec(lab(2));
    const dr = parseDates(dec(lab(3)), year);
    if (!name || !dr) continue;
    const flag = (b.match(/Images\/Flags\/16N\/([A-Z]{3})\.png/) || [])[1] || '';
    const notes = dec(lab(5)) || null;
    const org = dec(lab(4)) || null;
    const loc = dec(lab(7)) || null;
    const cc = CC[flag] || (flag ? flag.slice(0, 2) : null);
    const url = (notes && (notes.match(/https?:\/\/\S+/) || [])[0]) || null;
    out.push({
      key: key(name, dr.start, cc),
      name: cleanName(name), name_raw: name,
      start_date: dr.start, end_date: dr.end,
      country: cc, country_src: flag || null,
      location: loc, organizer: org, notes,
      status: status(name, notes),
      discipline: discipline(name), kinds: kinds(name),
      info_url: url,
      source_url: SRC + year,
      row_index: idx,
    });
  }
  return out;
}

module.exports = { parse, SRC };
