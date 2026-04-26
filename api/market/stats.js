import { rejectMethod, secureHeaders } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  secureHeaders(res);

  const openseaHeaders = { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' };
  const cmcHeaders = {
    'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY ?? '',
    'Accept': 'application/json',
  };

  try {
    const [osRes, cmcRes] = await Promise.all([
      fetch('https://api.opensea.io/api/v2/collections?limit=20&order_by=one_day_volume', { headers: openseaHeaders }),
      fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', { headers: cmcHeaders }),
    ]);

    const collections = osRes.ok ? (await osRes.json()).collections ?? [] : [];
    const cmc = cmcRes.ok ? (await cmcRes.json()).data ?? {} : {};

    // OpenSea aggregate
    const total_volume_24h = collections.reduce((s, c) => s + (c.stats?.one_day_volume ?? 0), 0);
    const total_sales_24h  = collections.reduce((s, c) => s + (c.stats?.one_day_sales ?? 0), 0);
    const avg_floor_price  = collections.length
      ? collections.reduce((s, c) => s + (c.stats?.floor_price ?? 0), 0) / collections.length
      : 0;

    // CMC global metrics
    const quote = cmc.quote?.USD ?? {};
    const total_market_cap   = quote.total_market_cap ?? cmc.total_market_cap ?? null;
    const total_volume_crypto = quote.total_volume_24h ?? cmc.total_volume_24h ?? null;
    const btc_dominance      = cmc.btc_dominance ?? null;
    const eth_dominance      = cmc.eth_dominance ?? null;
    const defi_volume_24h    = cmc.defi_volume_24h ?? null;
    const defi_market_cap    = cmc.defi_market_cap ?? null;
    // nft_volume_24h available on Startup+ plan, falls back to null gracefully
    const nft_volume_24h     = cmc.nft_volume_24h ?? null;

    // Market sentiment: ETH dominance + DeFi activity as proxy
    const sentiment = btc_dominance !== null
      ? (btc_dominance < 50 ? 'BULLISH' : 'NEUTRAL')
      : null;

    res.json({
      // OpenSea NFT aggregate
      total_collections: collections.length,
      total_volume_24h,
      total_sales_24h,
      avg_floor_price,
      // CoinMarketCap global
      total_market_cap,
      total_volume_crypto,
      btc_dominance,
      eth_dominance,
      defi_volume_24h,
      defi_market_cap,
      nft_volume_24h,
      sentiment,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
