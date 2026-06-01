import type { IncomingMessage, ServerResponse } from 'node:http';
import Groq from 'groq-sdk';

type Req = IncomingMessage & { body: Record<string, unknown> };
type Res = ServerResponse & { status: (c: number) => Res; json: (body: unknown) => void };

const MAX_PROMPT_LENGTH = 4000;

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type } = req.body as { prompt?: string; type?: string };

  if (!prompt || !type || typeof prompt !== 'string' || typeof type !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt/type' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Prompt too long' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    return res.status(200).json({ text: completion.choices[0]?.message?.content || '' });
  } catch (error: unknown) {
    console.error('Groq API error:', error);
    return res.status(502).json({ error: 'AI generation failed' });
  }
}
