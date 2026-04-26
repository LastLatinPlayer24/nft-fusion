export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const limit = Number(req.query.limit ?? 20);
  try {
    const r = await fetch(
      `https://api.opensea.io/api/v2/collections?chain=ethereum&limit=${limit}&order_by=seven_day_volume`,
      { headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' } }
    );
    const data = await r.json();
    res.json(data.collections ?? []);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
