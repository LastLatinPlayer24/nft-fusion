const TOKENS = [
  { symbol: 'ETH',  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { symbol: 'BTC',  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }, // WBTC
  { symbol: 'BNB',  address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52' },
  { symbol: 'SOL',  address: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c' },
  { symbol: 'MATIC',address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0' },
  { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  { symbol: 'UNI',  address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  { symbol: 'AAVE', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const symbols = req.query.symbols
    ? req.query.symbols.split(',').map(s => s.toUpperCase())
    : TOKENS.map(t => t.symbol);

  const targets = TOKENS.filter(t => symbols.includes(t.symbol));

  try {
    const results = await Promise.all(
      targets.map(async ({ symbol, address }) => {
        const r = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${address}/price?chain=eth&include=percent_change`,
          { headers: { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' } }
        );
        if (!r.ok) return { symbol, error: r.status };
        const d = await r.json();
        return {
          symbol,
          price_usd: d.usdPrice,
          price_24h_change: d['24hrPercentChange'],
          logo: d.tokenLogo,
          name: d.tokenName,
        };
      })
    );
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
