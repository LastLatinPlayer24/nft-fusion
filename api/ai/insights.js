import { sanitizeString } from '../_lib/validate.js';

const GROQ = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  const { context } = req.body ?? {};
  const safeContext = context ? sanitizeString(String(context), 1000) : 'general NFT market';

  const systemPrompt = `You are an NFT market analyst. Return exactly 3 market insights as a JSON array. Each insight must have: type ("opportunity"|"warning"|"signal"), title (max 8 words), description (max 30 words), confidence (0.0-1.0). Return ONLY valid JSON array, no markdown.`;

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
          { role: 'user', content: `Generate 3 NFT market insights for: ${safeContext}` },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    const json = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: json.error?.message ?? 'AI error' });

    const text = json.choices?.[0]?.message?.content ?? '[]';
    let insights;
    try {
      const match = text.match(/\[[\s\S]*\]/);
      insights = JSON.parse(match ? match[0] : text);
    } catch {
      insights = [];
    }

    res.json(Array.isArray(insights) ? insights.slice(0, 5) : []);
  } catch (e) {
    res.status(500).json({ error: 'Insights unavailable' });
  }
}
