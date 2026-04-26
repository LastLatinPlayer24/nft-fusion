const ALLOWED_HOSTS = new Set([
  'i2c.seadn.io',
  'i.seadn.io',
  'openseauserdata.com',
  'lh3.googleusercontent.com',
]);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') return res.status(405).end();

  const { url } = req.query;
  if (!url || typeof url !== 'string') return res.status(400).end();

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).end(); }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) return res.status(403).end();

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NFTFusion/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return res.status(r.status).end();

    const ct = r.headers.get('content-type') ?? 'image/jpeg';
    if (!ct.startsWith('image/')) return res.status(400).end();

    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(buf));
  } catch {
    res.status(502).end();
  }
}
