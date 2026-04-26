const BASE = '/api';

export function proxyImg(url?: string): string | undefined {
  if (!url) return undefined;
  return `${BASE}/images?url=${encodeURIComponent(url)}`;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`API ${path}: ${r.status}`);
  return r.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API ${path}: ${r.status}`);
  return r.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NFTCollection {
  collection_address: string;
  name: string;
  floor_price_usd?: string;
  floor_price?: string;
  volume_usd?: string;
  average_price_usd?: string;
  buyers_count?: number;
  sellers_count?: number;
  transactions_count?: number;
  collection_image?: string;
}

export interface OpenSeaCollection {
  collection: string;
  name: string;
  description?: string;
  image_url?: string;
  banner_image_url?: string;
  project_url?: string;
  twitter_username?: string;
  total_supply?: number;
  floor_price?: number;
  seven_day_volume?: number;
  thirty_day_volume?: number;
}

export interface WalletNFT {
  contract: {
    address: string;
    name?: string;
    symbol?: string;
    tokenType?: string;
  };
  tokenId: string;
  name?: string;
  description?: string;
  image?: { cachedUrl?: string; thumbnailUrl?: string };
  collection?: { name?: string; slug?: string };
}

export interface WalletToken {
  token_address: string;
  name: string;
  symbol: string;
  balance_formatted: string;
  usd_value?: string;
  usd_price?: string;
  usd_price_24hr_percent_change?: string;
  logo?: string;
}

export interface AIInsight {
  type: 'opportunity' | 'warning' | 'signal';
  title: string;
  description: string;
  confidence: number;
}

// ─── Market ───────────────────────────────────────────────────────────────────

export const getHottestCollections = (limit = 20) =>
  get<NFTCollection[]>(`/market/collections?limit=${limit}`);

export const getMarketStats = () =>
  get<Record<string, unknown>>('/market/stats');

// ─── Collections ─────────────────────────────────────────────────────────────

export const searchCollections = (q: string, limit = 10) =>
  get<OpenSeaCollection[]>(`/collections/search?q=${encodeURIComponent(q)}&limit=${limit}`);

export const getTopCollections = (limit = 20) =>
  get<OpenSeaCollection[]>(`/collections/top?limit=${limit}`);

export const getCollectionDetails = (contract: string, chain = 'eth') =>
  get<Record<string, unknown>>(`/collections/${contract}?chain=${chain}`);

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface AlchemyNFTResponse {
  ownedNfts: WalletNFT[];
  totalCount: number;
  pageKey?: string;
}

export const getWalletNFTs = (address: string, pageSize = 20) =>
  get<AlchemyNFTResponse>(`/wallet/nfts?address=${address}&pageSize=${pageSize}`);

export const getWalletTokens = (address: string, chain = 'eth') =>
  get<WalletToken[]>(`/wallet/tokens?address=${address}&chain=${chain}`);

// ─── AI ───────────────────────────────────────────────────────────────────────

export const getAIInsights = (context?: string) =>
  post<AIInsight[]>('/ai/insights', { context });

export const analyzeNFT = (query: string, data?: string) =>
  post<{ analysis: string }>('/ai/analyze', { query, data });
