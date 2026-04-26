import { isValidEthAddress, isValidChain, rejectMethod, secureHeaders } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  secureHeaders(res);

  const { address } = req.query;
  if (!isValidEthAddress(address)) return res.status(400).json({ error: 'Invalid Ethereum address' });

  const chain = isValidChain(req.query.chain) ? req.query.chain : 'eth';

  try {
    const r = await fetch(
      `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chain}`,
      { headers: { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: `Moralis error ${r.status}` });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
}
