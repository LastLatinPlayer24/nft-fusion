export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch(
      'https://api.opensea.io/api/v2/collections?limit=20&order_by=one_day_volume',
      { headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: 'OpenSea error' });
    const data = await r.json();
    const collections = data.collections ?? [];

    res.json({
      total_collections: collections.length,
      total_volume_24h: collections.reduce((s, c) => s + (c.stats?.one_day_volume ?? 0), 0),
      total_sales_24h: collections.reduce((s, c) => s + (c.stats?.one_day_sales ?? 0), 0),
      avg_floor_price: collections.length
        ? collections.reduce((s, c) => s + (c.stats?.floor_price ?? 0), 0) / collections.length
        : 0,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
