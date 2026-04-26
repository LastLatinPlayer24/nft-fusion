import { sanitizeString } from '../_lib/validate.js';

const GROQ = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  const { query, data } = req.body ?? {};
  if (!query) return res.status(400).json({ error: 'query required' });

  const safeQuery = sanitizeString(String(query), 500);
  const safeData  = data ? sanitizeString(String(data), 2000) : '';

  const systemPrompt = `You are a concise NFT market analyst. Analyze the provided NFT collection data and answer the user's question. Focus on floor price trends, volume, and market signals. Keep your response under 200 words. Format prices in ETH and USD.`;

  const userMessage = safeData
    ? `${safeQuery}\n\nCollection data:\n${safeData}`
    : safeQuery;

  try {
    const r = await fetch(GROQ, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 512,
        temperature: 0.3,
      }),
    });

    const json = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: json.error?.message ?? 'AI error' });

    const analysis = json.choices?.[0]?.message?.content ?? '';
    res.json({ analysis });
  } catch (e) {
    res.status(500).json({ error: 'Analysis unavailable' });
  }
}
