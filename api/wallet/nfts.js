export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });
  const pageSize = Number(req.query.pageSize ?? 20);
  try {
    const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=${pageSize}&excludeFilters[]=SPAM`;
    const r = await fetch(url);
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
