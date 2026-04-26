import { clampInt, rejectMethod, secureHeaders } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  secureHeaders(res);

  const limit = clampInt(req.query.limit, 1, 20);
  const moralisHeaders = { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' };

  try {
    // Moralis market-data has buyers_count + sellers_count natively
    const moralisRes = await fetch(
      `https://deep-index.moralis.io/api/v2.2/market-data/nft/hottest-collections?days=1`,
      { headers: moralisHeaders }
    );

    if (moralisRes.ok) {
      const data = await moralisRes.json();
      const collections = (Array.isArray(data) ? data : data.result ?? []).slice(0, limit);
      return res.json(collections);
    }

    // Fallback: OpenSea collections + Moralis ETH price
    const openseaHeaders = { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' };

    const [collectionsRes, ethPriceRes] = await Promise.all([
      fetch(`https://api.opensea.io/api/v2/collections?chain=ethereum&limit=${limit}&order_by=seven_day_volume`, { headers: openseaHeaders }),
      fetch('https://deep-index.moralis.io/api/v2.2/erc20/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/price?chain=eth', { headers: moralisHeaders }),
    ]);

    const collectionsData = collectionsRes.ok ? await collectionsRes.json() : { collections: [] };
    const ethData = ethPriceRes.ok ? await ethPriceRes.json() : {};
    const ethPrice = parseFloat(ethData.usdPrice ?? '2000');

    const collections = (collectionsData.collections ?? []).slice(0, limit);

    const statsResults = await Promise.all(
      collections.map(c =>
        fetch(`https://api.opensea.io/api/v2/collections/${c.collection}/stats`, { headers: openseaHeaders })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    );

    const result = collections.map((c, i) => {
      const stats = statsResults[i];
      const total = stats?.total ?? {};
      const interval = stats?.intervals?.find(iv => iv.interval === 'one_day') ?? {};

      const floorEth = parseFloat(total.floor_price ?? 0);
      const volEth   = parseFloat(interval.volume ?? total.volume ?? 0);
      const avgEth   = parseFloat(interval.average_price ?? total.average_price ?? 0);

      return {
        collection_address: c.contracts?.[0]?.address ?? '',
        name:               c.name ?? c.collection,
        collection_image:   c.image_url ?? '',
        floor_price:        floorEth.toFixed(4),
        floor_price_usd:    (floorEth * ethPrice).toFixed(2),
        volume_usd:         (volEth * ethPrice).toFixed(2),
        average_price_usd:  (avgEth * ethPrice).toFixed(2),
        buyers_count:       interval.sales ?? total.sales ?? 0,
        sellers_count:      0,
        transactions_count: interval.sales ?? total.sales ?? 0,
      };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
}
