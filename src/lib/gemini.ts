import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

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
  const prompt = `You are an expert career counselor for young women in South Africa. Generate a fully personalised career plan based on this profile.

User Profile:
- Name: ${profile.fullName}
- Education: ${profile.education}
- Interests: ${profile.interests.join(', ')}
- Strengths: ${profile.strengths.join(', ')}
- Goals: ${profile.goals.join(', ')}
- Work style: ${profile.workStyle.join(', ')}

Respond with ONLY a JSON object (no markdown, no explanation):
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

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content || '{}';
  const data = JSON.parse(text) as AiData;
  data.generatedAt = new Date().toISOString();
  return data;
}
