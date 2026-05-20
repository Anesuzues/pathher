export async function callGeminiJSON<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return fallback;
    const { text } = (await res.json()) as { text: string };
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean) as T;
  } catch {
    return fallback;
  }
}
