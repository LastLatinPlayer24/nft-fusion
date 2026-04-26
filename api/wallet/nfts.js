export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });
  const chain = req.query.chain ?? 'eth';
  const limit = Math.min(Number(req.query.pageSize ?? 20), 100);
  try {
    const r = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain}&limit=${limit}&media_items=false`,
      { headers: { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: `Moralis error ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
