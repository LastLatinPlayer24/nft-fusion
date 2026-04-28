export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path param' });

  // Build query string (exclude 'path' itself)
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') params.append(k, v);
  }

  const url = `https://api.coingecko.com/api/v3/${path}${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const headers = { 'Accept': 'application/json' };
    if (process.env.COINGECKO_DEMO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_DEMO_API_KEY;
    }
    const r = await fetch(url, { headers });
    if (!r.ok) return res.status(r.status).json({ error: `CoinGecko ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
