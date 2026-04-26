export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const limit = Number(req.query.limit ?? 20);
  const days = Number(req.query.days ?? 1);
  try {
    const r = await fetch(
      `https://deep-index.moralis.io/api/v2.2/market-data/nfts/hottest-collections?chain=eth&days=${days}&limit=${limit}`,
      { headers: { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' } }
    );
    const data = await r.json();
    res.json(data.result ?? []);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
