const ETH_ADDR = /^0x[0-9a-fA-F]{40}$/;
const ALLOWED_CHAINS = new Set(['eth', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base']);

export function isValidEthAddress(addr) {
  return typeof addr === 'string' && ETH_ADDR.test(addr);
}

export function isValidChain(chain) {
  return ALLOWED_CHAINS.has(String(chain).toLowerCase());
}

export function sanitizeString(str, maxLen = 100) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen).replace(/[<>"'`\\;{}()]/g, '').trim();
}

export function clampInt(val, min = 1, max = 50) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function rejectMethod(req, res, allowed = 'GET') {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  if (req.method !== allowed) {
    res.status(405).json({ error: 'Method not allowed' });
    return true;
  }
  return false;
}

export function secureHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
}
