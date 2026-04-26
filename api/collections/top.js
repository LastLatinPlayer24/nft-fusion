import { clampInt, rejectMethod, secureHeaders } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  secureHeaders(res);

  const limit = clampInt(req.query.limit, 1, 50);

  try {
    const r = await fetch(
      `https://api.opensea.io/api/v2/collections?chain=ethereum&limit=${limit}&order_by=seven_day_volume`,
      { headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: 'OpenSea error' });
    const data = await r.json();
    res.json(data.collections ?? []);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
}
