// Cron giornaliero (vedi vercel.json): legge la Showliste pubblica e aggiorna qha_events su Supabase.
// Vercel invia "Authorization: Bearer $CRON_SECRET". Lo stesso segreto autorizza la RPC qha_events_sync.
const { parse, SRC } = require('./_events');

const SB_URL = 'https://zjpoquehofvkmdvsrvpb.supabase.co';
const SB_KEY = 'sb_publishable_0OA_stzRwrznLCdB4RmUWg__tzYcUoE';

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'non autorizzato' });
  const now = new Date();
  const years = [now.getUTCFullYear()];
  if (now.getUTCMonth() >= 8) years.push(now.getUTCFullYear() + 1); // da settembre prova anche l'anno successivo
  const report = [];
  for (const [i, year] of years.entries()) {
    if (i > 0) await new Promise(r => setTimeout(r, 10500)); // robots.txt: crawl-delay 10s
    try {
      const r = await fetch(SRC + year, { headers: { 'user-agent': 'ReinersBook-CalendarSync/1.0 (+https://reiners-book-marco-corsaros-projects.vercel.app)' } });
      if (!r.ok) { report.push({ year, error: `showmanager HTTP ${r.status}` }); continue; }
      const rows = parse(await r.text(), year);
      if (rows.length < 20) { report.push({ year, skipped: `solo ${rows.length} eventi: salto per non cancellare dati buoni` }); continue; }
      const s = await fetch(`${SB_URL}/rest/v1/rpc/qha_events_sync`, {
        method: 'POST',
        headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ p_secret: secret, p_year: year, p_rows: rows }),
      });
      const j = await s.json();
      report.push(s.ok ? { year, ...j } : { year, error: j.message || 'errore Supabase' });
    } catch (e) { report.push({ year, error: e.message }); }
  }
  const failed = report.some(x => x.error);
  return res.status(failed ? 502 : 200).json({ ok: !failed, report });
};
