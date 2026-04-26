import { isValidEthAddress, sanitizeString } from './_lib/validate.js';

const GROQ    = 'https://api.groq.com/openai/v1/chat/completions';
const MORALIS = 'https://deep-index.moralis.io/api/v2.2';
const OPENSEA = 'https://api.opensea.io/api/v2';

const MAX_MESSAGES   = 20;
const MAX_MSG_LENGTH = 1000;

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_top_collections',
      description: 'Get top NFT collections by volume from OpenSea',
      parameters: { type: 'object', properties: { limit: { type: 'number' } }, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_collection',
      description: 'Search for an NFT collection by name',
      parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_collection_stats',
      description: 'Get floor price and stats for an NFT collection by contract address',
      parameters: {
        type: 'object',
        properties: {
          contract: { type: 'string' },
          chain: { type: 'string' },
        },
        required: ['contract'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_wallet_nfts',
      description: 'Get all NFTs owned by a wallet address (read-only)',
      parameters: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_wallet_tokens',
      description: 'Get ERC-20 token balances for a wallet (read-only)',
      parameters: {
        type: 'object',
        properties: { address: { type: 'string' }, chain: { type: 'string' } },
        required: ['address'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_stats',
      description: 'Get overall NFT market statistics from top collections',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

async function executeTool(name, args) {
  const moralisHeaders = { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' };
  const openseaHeaders = { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' };

  switch (name) {
    case 'get_top_collections': {
      const limit = Math.min(Math.max(parseInt(args.limit) || 10, 1), 20);
      const r = await fetch(`${OPENSEA}/collections?chain=ethereum&limit=${limit}&order_by=seven_day_volume`, { headers: openseaHeaders });
      if (!r.ok) return JSON.stringify({ error: 'OpenSea unavailable' });
      const data = await r.json();
      return JSON.stringify((data.collections ?? []).map(c => ({
        name: c.name, slug: c.collection,
        floor_price: c.stats?.floor_price,
        seven_day_volume: c.stats?.seven_day_volume,
      })));
    }

    case 'search_collection': {
      const q = sanitizeString(args.query ?? '', 60).toLowerCase();
      if (!q) return JSON.stringify([]);
      const r = await fetch(`${OPENSEA}/collections?chain=ethereum&limit=50&order_by=seven_day_volume`, { headers: openseaHeaders });
      if (!r.ok) return JSON.stringify({ error: 'OpenSea unavailable' });
      const data = await r.json();
      return JSON.stringify(
        (data.collections ?? [])
          .filter(c => (c.name ?? '').toLowerCase().includes(q))
          .slice(0, 5)
          .map(c => ({ name: c.name, slug: c.collection, contracts: c.contracts }))
      );
    }

    case 'get_collection_stats': {
      const contract = args.contract ?? '';
      if (!isValidEthAddress(contract)) return JSON.stringify({ error: 'Invalid contract address' });
      const chain = ['eth', 'polygon', 'bsc'].includes(args.chain) ? args.chain : 'eth';
      const r = await fetch(`${MORALIS}/nft/${contract}/collections?chain=${chain}`, { headers: moralisHeaders });
      if (!r.ok) return JSON.stringify({ error: 'Moralis unavailable' });
      return JSON.stringify(await r.json());
    }

    case 'get_wallet_nfts': {
      const address = args.address ?? '';
      if (!isValidEthAddress(address)) return JSON.stringify({ error: 'Invalid wallet address' });
      const r = await fetch(`${MORALIS}/${address}/nft?chain=eth&limit=20&media_items=false`, { headers: moralisHeaders });
      if (!r.ok) return JSON.stringify({ error: 'Moralis unavailable' });
      const data = await r.json();
      const byCollection = {};
      (data.result ?? []).forEach(nft => {
        const col = nft.name ?? nft.token_address ?? 'Unknown';
        byCollection[col] = (byCollection[col] ?? 0) + 1;
      });
      return JSON.stringify({ total: data.total, collections: byCollection });
    }

    case 'get_wallet_tokens': {
      const address = args.address ?? '';
      if (!isValidEthAddress(address)) return JSON.stringify({ error: 'Invalid wallet address' });
      const chain = ['eth', 'polygon', 'bsc'].includes(args.chain) ? args.chain : 'eth';
      const r = await fetch(`${MORALIS}/wallets/${address}/tokens?chain=${chain}`, { headers: moralisHeaders });
      if (!r.ok) return JSON.stringify({ error: 'Moralis unavailable' });
      const data = await r.json();
      return JSON.stringify(
        (data.result ?? []).slice(0, 10).map(t => ({
          symbol: t.symbol, balance: t.balance_formatted, usd_value: t.usd_value,
        }))
      );
    }

    case 'get_market_stats': {
      const r = await fetch(`${OPENSEA}/collections?chain=ethereum&limit=20&order_by=seven_day_volume`, { headers: openseaHeaders });
      if (!r.ok) return JSON.stringify({ error: 'OpenSea unavailable' });
      const data = await r.json();
      const collections = data.collections ?? [];
      return JSON.stringify({
        top_collections: collections.length,
        total_7d_volume: collections.reduce((s, c) => s + (c.stats?.seven_day_volume ?? 0), 0),
        avg_floor_price: collections.length
          ? collections.reduce((s, c) => s + (c.stats?.floor_price ?? 0), 0) / collections.length
          : 0,
      });
    }

    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages required' });
  if (messages.length > MAX_MESSAGES)
    return res.status(400).json({ error: 'Too many messages' });

  // Sanitize and validate messages — only allow role:user and role:assistant
  const safeMessages = messages
    .filter(m => m && ['user', 'assistant'].includes(m.role))
    .map(m => ({
      role: m.role,
      content: typeof m.content === 'string'
        ? m.content.slice(0, MAX_MSG_LENGTH)
        : '',
    }))
    .filter(m => m.content.length > 0);

  if (safeMessages.length === 0) return res.status(400).json({ error: 'No valid messages' });

  const systemMessage = {
    role: 'system',
    content: `You are a read-only NFT market analyst. You can view NFT holdings and market data but CANNOT send transactions, sign messages, or move funds. Always use tools to fetch real data before answering. Be concise. Format prices in ETH and USD.`,
  };

  try {
    let currentMessages = [systemMessage, ...safeMessages];

    for (let i = 0; i < 3; i++) {
      const r = await fetch(GROQ, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: currentMessages,
          tools,
          tool_choice: 'auto',
          max_tokens: 1024,
        }),
      });

      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.error?.message ?? 'AI error' });

      const choice = data.choices?.[0];
      const msg = choice?.message;

      if (choice?.finish_reason === 'tool_calls' && msg?.tool_calls?.length) {
        currentMessages.push(msg);
        for (const call of msg.tool_calls) {
          let args = {};
          try { args = JSON.parse(call.function.arguments ?? '{}'); } catch {}
          const result = await executeTool(call.function.name, args);
          currentMessages.push({ role: 'tool', tool_call_id: call.id, content: result });
        }
        continue;
      }

      return res.json({ reply: msg?.content ?? '' });
    }

    return res.json({ reply: 'Analysis incomplete. Please try again.' });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' });
  }
}
