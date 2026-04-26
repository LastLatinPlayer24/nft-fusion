export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = String(req.query.q ?? '');
  const limit = Number(req.query.limit ?? 10);
  if (!q) return res.json([]);
  try {
    const r = await fetch(
      'https://api.opensea.io/api/v2/collections?chain=ethereum&limit=50&order_by=seven_day_volume',
      { headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' } }
    );
    const data = await r.json();
    const filtered = (data.collections ?? [])
      .filter(c => (c.name ?? '').toLowerCase().includes(q.toLowerCase()))
      .slice(0, limit);
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
