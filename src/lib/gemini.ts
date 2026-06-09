export interface AiCareerPath {
  id: string;
  title: string;
  icon: string;
  whyItFits: string;
  encouragement: string;
  skillsNeeded: string[];
  saExamples: string[];
}

export interface AiCourse {
  title: string;
  platform: string;
  duration: string;
  rating: string;
  url: string;
}

export interface AiData {
  careerPaths: AiCareerPath[];
  courses: AiCourse[];
  networkingTip: string;
  careerInsight: string;
  generatedAt: string;
}

interface Profile {
  fullName: string;
  education: string;
  interests: string[];
  strengths: string[];
  goals: string[];
  workStyle: string[];
}

export async function generateUserContent(profile: Profile): Promise<AiData> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile }),
  });

  if (!response.ok) {
    let msg = `AI generation failed (${response.status})`;
    try {
      const err = await response.json();
      if (err?.error) msg = err.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  const data = (await response.json()) as AiData;
  if (!data.generatedAt) data.generatedAt = new Date().toISOString();
  return data;
}
