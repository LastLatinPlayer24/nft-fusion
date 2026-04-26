import { sanitizeString, clampInt, rejectMethod, secureHeaders } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  secureHeaders(res);

  const q = sanitizeString(req.query.q ?? '', 60);
  if (!q) return res.json([]);

  const limit = clampInt(req.query.limit, 1, 20);

  try {
    const r = await fetch(
      'https://api.opensea.io/api/v2/collections?chain=ethereum&limit=50&order_by=seven_day_volume',
      { headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: 'OpenSea error' });
    const data = await r.json();
    const results = (data.collections ?? [])
      .filter(c => (c.name ?? '').toLowerCase().includes(q.toLowerCase()))
      .slice(0, limit);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
}
