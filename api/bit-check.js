// Vercel serverless function: parere sul morso da foto (Claude vision).
// Richiede la variabile d'ambiente ANTHROPIC_API_KEY sul progetto Vercel.
const RULES = `Regole imboccature reining (NRHA/IRHA 2026; OPES/ISHA 2025 per gare nazionali):
- Morso a leve (curb): leva max 8.5" (21,6 cm) misurata dal bridle ring al rein ring, qualunque forma; nessun dispositivo meccanico o leva mobile; nulla deve sporgere sotto il cannone.
- Cannone: diametro minimo 5/16" (8 mm) misurato a 1" (25 mm) dalla guancia, liscio, tondo/ovale, assottigliato verso il centro; vietati torciglione, filo, spigoli, donut, pronged, spade.
- Ponte (port): altezza max 3.5" (8,9 cm).
- Snaffle: anelli diametro 2"-4" (51-102 mm), spessore anelli max 10 mm (OPES); solo cavalli fino a 5 anni in NRHA; curb strap solo in cuoio, sotto le redini; catena vietata sullo snaffle.
- Barbozzale (curb strap/chain): cuoio o catena, piatto sotto la barbozza, largo almeno 1/2", senza fili, nodi, corda o catena singola; non intrecciato.
- Bosal: flessibile, corda o cuoio, max 3/4" (19,5 mm) alla guancia, no crine; hackamore meccanico, gag, split bit, side pull, bitless: vietati in reining.
- Accessori: tie-down, martingale, draw reins, capezzine con il morso vietati in NRHA.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'Analisi foto non configurata: manca ANTHROPIC_API_KEY su Vercel.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { image, ctx = {} } = body || {};
  if (!image || !/^data:image\/(jpeg|png|webp);base64,/.test(image)) return res.status(400).json({ error: 'Immagine mancante o non valida.' });
  const mediaType = image.substring(5, image.indexOf(';'));
  const data = image.split(',')[1];
  const prompt = `Sei un giudice di reining esperto di controllo imboccature. Analizza la foto del morso.
Contesto dichiarato dal cavaliere: regolamento=${ctx.fed || 'nrha'}, tipo=${ctx.type || 'non indicato'}, età cavallo=${ctx.age || 'non indicata'}.
${RULES}
Rispondi in italiano, conciso, in questo formato:
VERDETTO: ok | ko | verifica
TIPO: cosa vedi (curb/snaffle/bosal/altro, forma delle leve, cannone, ponte, barbozzale)
MISURE STIMATE: stima leva, ponte, cannone se c'è un riferimento di scala nella foto (righello, moneta); altrimenti dì che non puoi stimare
PUNTI CRITICI: elenco puntato di ciò che potrebbe essere irregolare o va misurato col righello
CONSIGLIO: una riga.
Usa "ko" solo se vedi un elemento chiaramente vietato (torciglione, gag, dispositivo meccanico, prolungamento sotto il cannone, catena sullo snaffle, ecc.). Usa "ok" solo se tutto ciò che è visibile è conforme e le misure stimate sono entro i limiti con margine. Altrimenti "verifica".`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 700,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: prompt }
        ] }]
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: (j.error && j.error.message) || 'Errore API' });
    const text = (j.content || []).map(c => c.text || '').join('\n').trim();
    const m = text.match(/VERDETTO:\s*(ok|ko|verifica)/i);
    return res.status(200).json({ verdict: m ? m[1].toLowerCase() : 'verifica', text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
