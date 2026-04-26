export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  try {
    const r = await fetch(
      `https://api.opensea.io/api/v2/collections?limit=${limit}&order_by=one_day_volume`,
      { headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: 'OpenSea error' });
    const data = await r.json();
    res.json(data.collections ?? []);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
