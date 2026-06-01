import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return res.status(200).json({ text: response.text });
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    return res.status(502).json({ error: 'AI generation failed' });
  }
}
