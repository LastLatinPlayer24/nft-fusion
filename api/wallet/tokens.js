export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });
  const chain = req.query.chain ?? 'eth';
  try {
    const r = await fetch(
      `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain}`,
      { headers: { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
