const GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const MORALIS = 'https://deep-index.moralis.io/api/v2.2';
const OPENSEA = 'https://api.opensea.io/api/v2';

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_top_collections',
      description: 'Get top NFT collections by volume from OpenSea',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of collections (default 10)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_collection',
      description: 'Search for an NFT collection by name',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Collection name to search for' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_collection_stats',
      description: 'Get floor price, volume and stats for an NFT collection by contract address',
      parameters: {
        type: 'object',
        properties: {
          contract: { type: 'string', description: 'Contract address (0x...)' },
          chain: { type: 'string', description: 'Chain: eth, polygon (default eth)' },
        },
        required: ['contract'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_wallet_nfts',
      description: 'Get all NFTs owned by a wallet address',
      parameters: {
        type: 'object',
        properties: {
          address: { type: 'string', description: 'Wallet address (0x...)' },
        },
        required: ['address'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_wallet_tokens',
      description: 'Get ERC-20 token balances for a wallet',
      parameters: {
        type: 'object',
        properties: {
          address: { type: 'string', description: 'Wallet address (0x...)' },
          chain: { type: 'string', description: 'Chain (default eth)' },
        },
        required: ['address'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_stats',
      description: 'Get overall NFT market cap and volume statistics',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

async function executeTool(name, args) {
  const moralisHeaders = { 'X-API-Key': process.env.MORALIS_API_KEY ?? '' };
  const openseaHeaders = { 'X-API-KEY': process.env.OPENSEA_API_KEY ?? '' };
  const alchemyKey = process.env.ALCHEMY_API_KEY ?? '';

  switch (name) {
    case 'get_top_collections': {
      const limit = args.limit ?? 10;
      const r = await fetch(`${OPENSEA}/collections?chain=ethereum&limit=${limit}&order_by=seven_day_volume`, { headers: openseaHeaders });
      const data = await r.json();
      return JSON.stringify((data.collections ?? []).map(c => ({
        name: c.name, slug: c.collection, floor_price: c.stats?.floor_price,
        seven_day_volume: c.stats?.seven_day_volume,
      })));
    }
    case 'search_collection': {
      const r = await fetch(`${OPENSEA}/collections?chain=ethereum&limit=50&order_by=seven_day_volume`, { headers: openseaHeaders });
      const data = await r.json();
      const results = (data.collections ?? [])
        .filter(c => c.name?.toLowerCase().includes(args.query.toLowerCase()))
        .slice(0, 5)
        .map(c => ({ name: c.name, slug: c.collection, contracts: c.contracts }));
      return JSON.stringify(results);
    }
    case 'get_collection_stats': {
      const chain = args.chain ?? 'eth';
      const r = await fetch(`${MORALIS}/nft/${args.contract}/collections?chain=${chain}`, { headers: moralisHeaders });
      return JSON.stringify(await r.json());
    }
    case 'get_wallet_nfts': {
      const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${alchemyKey}/getNFTsForOwner?owner=${args.address}&withMetadata=false&pageSize=20&excludeFilters[]=SPAM`;
      const r = await fetch(url);
      const data = await r.json();
      const byCollection = {};
      (data.ownedNfts ?? []).forEach(nft => {
        const col = nft.contract?.name ?? nft.contract?.address ?? 'Unknown';
        byCollection[col] = (byCollection[col] ?? 0) + 1;
      });
      return JSON.stringify({ total: data.totalCount, collections: byCollection });
    }
    case 'get_wallet_tokens': {
      const chain = args.chain ?? 'eth';
      const r = await fetch(`${MORALIS}/wallets/${args.address}/tokens?chain=${chain}`, { headers: moralisHeaders });
      const data = await r.json();
      const tokens = (data.result ?? []).slice(0, 10).map(t => ({
        symbol: t.symbol, balance: t.balance_formatted, usd_value: t.usd_value,
      }));
      return JSON.stringify(tokens);
    }
    case 'get_market_stats': {
      const r = await fetch(`${MORALIS}/market-data/nfts/market-cap?days=1`, { headers: moralisHeaders });
      return JSON.stringify(await r.json());
    }
    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  const systemMessage = {
    role: 'system',
    content: `You are an expert NFT market analyst. You have access to real-time data from OpenSea, Moralis, and Alchemy.
Use tools to fetch data before answering. Always provide specific numbers when available.
Be concise and insightful. Format prices in ETH and USD when possible.`,
  };

  try {
    let currentMessages = [systemMessage, ...messages];

    // ReAct loop — max 3 tool call iterations
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
      if (!r.ok) return res.status(r.status).json({ error: data.error?.message ?? 'Groq error' });

      const choice = data.choices?.[0];
      const msg = choice?.message;

      if (choice?.finish_reason === 'tool_calls' && msg?.tool_calls?.length) {
        currentMessages.push(msg);
        for (const call of msg.tool_calls) {
          const args = JSON.parse(call.function.arguments ?? '{}');
          const result = await executeTool(call.function.name, args);
          currentMessages.push({
            role: 'tool',
            tool_call_id: call.id,
            content: result,
          });
        }
        continue;
      }

      return res.json({ reply: msg?.content ?? '' });
    }

    return res.json({ reply: 'Could not complete the analysis. Please try again.' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
