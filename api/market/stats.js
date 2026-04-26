export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch(
      'https://deep-index.moralis.io/api/v2.2/market-data/nfts/market-cap?days=1',
      { headers: { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
