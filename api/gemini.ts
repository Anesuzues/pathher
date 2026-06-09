import type { IncomingMessage, ServerResponse } from 'node:http';
import Groq from 'groq-sdk';

type Req = IncomingMessage & { body: Record<string, unknown> };
type Res = ServerResponse & { status: (c: number) => Res; json: (body: unknown) => void };

interface Profile {
  fullName?: string;
  education?: string;
  interests?: string[];
  strengths?: string[];
  goals?: string[];
  workStyle?: string[];
}

function buildPrompt(profile: Profile): string {
  return `You are an expert career counselor for young women in South Africa. Generate a fully personalised career plan based on this profile.

User Profile:
- Name: ${String(profile.fullName || '')}
- Education: ${String(profile.education || '')}
- Interests: ${(profile.interests || []).join(', ')}
- Strengths: ${(profile.strengths || []).join(', ')}
- Goals: ${(profile.goals || []).join(', ')}
- Work style: ${(profile.workStyle || []).join(', ')}

Respond with ONLY a JSON object:
{
  "careerPaths": [
    {
      "id": "kebab-case-slug",
      "title": "Job Title",
      "icon": "Code",
      "whyItFits": "2-3 sentences referencing this person's specific interests, strengths and goals",
      "encouragement": "One warm personalised encouraging sentence",
      "skillsNeeded": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "saExamples": ["Real SA company or programme 1", "Real SA company or programme 2", "Real SA company or programme 3"]
    }
  ],
  "courses": [
    {
      "title": "Course name",
      "platform": "Platform name",
      "duration": "X weeks",
      "rating": "4.X",
      "url": "https://real-url.com"
    }
  ],
  "networkingTip": "One specific, actionable SA-context networking tip for this person",
  "careerInsight": "One insightful observation about their unique combination of traits and how it gives them an edge"
}

Rules:
- Generate exactly 3 career paths best suited to South Africa's job market for this specific person, ranked best-fit first
- icon must be one of: Code, BarChart, Layout, Megaphone, Briefcase, TrendingUp
- saExamples must be real South African companies, graduate programmes, or organisations
- Generate exactly 4 courses for the top career path using real platforms (Coursera, edX, FreeCodeCamp, Udemy, Google, LinkedIn Learning, etc.) with real URLs
- Everything must be specific to this person — no generic advice
- South African context throughout`;
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile } = req.body as { profile?: Profile };

  if (!profile || typeof profile !== 'object') {
    return res.status(400).json({ error: 'Missing profile' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPrompt(profile) }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    const text = completion.choices[0]?.message?.content || '{}';
    const data = JSON.parse(text);
    data.generatedAt = new Date().toISOString();
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Groq API error:', error);
    return res.status(502).json({ error: 'AI generation failed' });
  }
}
