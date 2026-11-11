import type { IncomingMessage, ServerResponse } from 'node:http';
import Groq from 'groq-sdk';

// POST /api/ai  { task: 'career' | 'branding', input: AiInput }
// Signed-in users only (Firebase ID token in the Authorization header).
// The rule-based matcher has already chosen the career path and KnobzToLearn
// certificate; the model only writes personalised text around that choice.

type Req = IncomingMessage & { body: unknown };
type Res = ServerResponse & { status: (c: number) => Res; json: (body: unknown) => void };

export type AiTask = 'career' | 'branding';

export interface AiInput {
  profile: {
    firstName: string;
    education: string;
    interests: string[];
    strengths: string[];
    goals: string[];
    workStyle: string[];
  };
  path: { title: string; skillsNeeded: string[] };
  certificate: { number: number; title: string; description: string };
}

export interface CareerResult {
  whyItFits: string;
  encouragement: string;
  nextSteps: string[];
  networkingTip: string;
  careerInsight: string;
}

export interface BrandingResult {
  cvSummary: string;
  cvSkills: string[];
  linkedinHeadline: string;
  linkedinAbout: string;
}

// ---------- input cleaning ----------

const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max) : '';
const strList = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.map(x => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

export function cleanInput(raw: unknown): AiInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, any>;
  const certNumber = Number(r.certificate?.number);
  const input: AiInput = {
    profile: {
      firstName: str(r.profile?.firstName, 40),
      education: str(r.profile?.education, 80),
      interests: strList(r.profile?.interests, 10, 40),
      strengths: strList(r.profile?.strengths, 10, 40),
      goals: strList(r.profile?.goals, 10, 40),
      workStyle: strList(r.profile?.workStyle, 10, 40),
    },
    path: {
      title: str(r.path?.title, 80),
      skillsNeeded: strList(r.path?.skillsNeeded, 10, 60),
    },
    certificate: {
      number: Number.isInteger(certNumber) && certNumber > 0 && certNumber < 20 ? certNumber : 1,
      title: str(r.certificate?.title, 80),
      description: str(r.certificate?.description, 300),
    },
  };
  if (!input.path.title || !input.certificate.title) return null;
  return input;
}

// ---------- prompts ----------

const SYSTEM_PROMPT = `You write career guidance for PathHer, a platform that helps young women in South Africa start careers in technology.

PathHer's learning partner is KnobzToLearn. It offers a sequence of certificates, and each one unlocks after the previous one is completed, so everyone starts at Certificate 1. When you mention learning, point to the KnobzToLearn certificate named in the request, by its number and title.

Rules that matter more than style:
- Work only from the profile you are given. Do not invent work experience, qualifications, employers, job titles, achievements, years or numbers the person has not given.
- Do not name other course providers, learning platforms, websites, apps, events, communities or URLs. LinkedIn is the only platform you may name.
- Do not name specific companies, graduate programmes or organisations. Describe kinds of employers or settings instead (for example "banks and insurers" or "small agencies").
- Refer to the person's actual interests, strengths and goals, not generic praise.
- Write in plain, warm South African English. Keep sentences short.

Reply with a single JSON object and nothing else.`;

function profileBlock(p: AiInput['profile']): string {
  const line = (label: string, v: string | string[]) =>
    `- ${label}: ${Array.isArray(v) ? v.join(', ') || 'not given' : v || 'not given'}`;
  return [
    line('First name', p.firstName),
    line('Education', p.education),
    line('Interests', p.interests),
    line('Strengths', p.strengths),
    line('Goals', p.goals),
    line('Preferred work style', p.workStyle),
  ].join('\n');
}

function contextBlock(input: AiInput): string {
  return `Profile:
${profileBlock(input.profile)}

Matched career path: ${input.path.title}
Skills this path needs: ${input.path.skillsNeeded.join(', ')}
KnobzToLearn certificate for this path: Certificate ${input.certificate.number}: ${input.certificate.title}. ${input.certificate.description}`;
}

export function buildPrompt(task: AiTask, input: AiInput): string {
  if (task === 'career') {
    return `${contextBlock(input)}

Explain to this person, speaking to them as "you", why this path suits them and what to do next. Return JSON with exactly these keys:
{
  "whyItFits": "2-3 sentences linking at least two of their specific interests, strengths or goals to this path",
  "encouragement": "one warm sentence",
  "nextSteps": ["2 or 3 short, practical actions they can take alongside the certificate, each under 25 words. Do not repeat signing up for the certificate; that step is shown separately. Do not name any website, platform, app or community other than LinkedIn (for example, say 'free coding exercises', not a site name)."],
  "networkingTip": "one specific, practical networking tip for someone starting out in South Africa",
  "careerInsight": "one or two sentences on how their particular combination of traits gives them an edge in this path"
}`;
  }
  return `${contextBlock(input)}

Write CV and LinkedIn text for this person. They are early in their career, so build on their education, strengths and the certificate they are working towards, and leave out anything they have not told you. Describe the path's skills as things they are learning, not as experience or expertise they already have. Return JSON with exactly these keys:
{
  "cvSummary": "3-4 sentence professional summary in CV style (no 'I'), mentioning that they are working towards KnobzToLearn Certificate ${input.certificate.number}: ${input.certificate.title}",
  "cvSkills": ["6 to 8 skills, drawn only from the path's skills and their own strengths"],
  "linkedinHeadline": "LinkedIn headline, under 200 characters",
  "linkedinAbout": "LinkedIn About section in the first person, 120-180 words, mentioning the KnobzToLearn certificate they are working towards, ending with 3-5 relevant hashtags"
}`;
}

// ---------- output checking ----------

const URL_RE = /\b(?:https?:\/\/|www\.)\S+/gi;
// The model sometimes misspells the partner's name ("KnobdToLearn", "Knobz To Learn").
const KNOBZ_RE = /\bKn?ob[a-z]{0,2}\s?To\s?Learn\b/gi;
const out = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(URL_RE, '').replace(KNOBZ_RE, 'KnobzToLearn').trim().slice(0, max) : '';
const outList = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.map(x => out(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

/** Returns null if the model's reply is missing anything the page needs. */
export function parseResult(task: AiTask, text: string): CareerResult | BrandingResult | null {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;

  if (task === 'career') {
    const r: CareerResult = {
      whyItFits: out(data.whyItFits, 800),
      encouragement: out(data.encouragement, 300),
      // The page shows the KnobzToLearn step itself, so drop any the model repeats.
      nextSteps: outList(data.nextSteps, 4, 200).filter(s => !/certificate|knobztolearn/i.test(s)).slice(0, 3),
      networkingTip: out(data.networkingTip, 400),
      careerInsight: out(data.careerInsight, 500),
    };
    return r.whyItFits && r.encouragement && r.nextSteps.length ? r : null;
  }

  const r: BrandingResult = {
    cvSummary: out(data.cvSummary, 1000),
    cvSkills: outList(data.cvSkills, 8, 60),
    linkedinHeadline: out(data.linkedinHeadline, 220),
    linkedinAbout: out(data.linkedinAbout, 2600),
  };
  return r.cvSummary && r.cvSkills.length && r.linkedinHeadline && r.linkedinAbout ? r : null;
}

// ---------- model call ----------

const MODEL = () => process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export async function generate(task: AiTask, input: AiInput, apiKey: string) {
  const groq = new Groq({ apiKey });
  const model = MODEL();
  // gpt-oss models reason before answering, and that reasoning counts towards
  // max_tokens, so keep it short and leave plenty of room for the JSON.
  const reasoning = model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' as const } : {};

  // One retry: JSON mode occasionally rejects a reply that came out malformed.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(task, input) },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        ...reasoning,
      });
      const result = parseResult(task, completion.choices[0]?.message?.content || '');
      if (result) return result;
    } catch (error) {
      const retryable = error instanceof Groq.BadRequestError && /json_validate_failed/.test(String(error.message));
      if (!retryable || attempt === 1) throw error;
    }
  }
  return null;
}

// ---------- handler ----------

async function verifyFirebaseToken(idToken: string): Promise<boolean> {
  const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!firebaseApiKey) return false;
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers['authorization'];
  const idToken = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!idToken || !(await verifyFirebaseToken(idToken))) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body ?? {}) as { task?: unknown; input?: unknown };
  const task = body.task === 'career' || body.task === 'branding' ? body.task : null;
  const input = cleanInput(body.input);
  if (!task || !input) return res.status(400).json({ error: 'Invalid request' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI is not configured' });

  try {
    const result = await generate(task, input, apiKey);
    if (!result) return res.status(502).json({ error: 'AI reply was incomplete' });
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Groq request failed:', error);
    return res.status(502).json({ error: 'AI generation failed' });
  }
}
