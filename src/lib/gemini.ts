import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface AiCareerPath {
  id: string;
  whyItFits: string;
  encouragement: string;
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

const CAREER_TITLES: Record<string, string> = {
  'software-dev': 'Software Developer',
  'data-analyst': 'Data Analyst',
  'ux-designer': 'UX/UI Designer',
  'digital-marketer': 'Digital Marketing Specialist',
};

export async function generateUserContent(profile: Profile): Promise<AiData> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const pathList = Object.entries(CAREER_TITLES)
    .map(([id, title]) => `${id} (${title})`)
    .join(', ');

  const prompt = `You are a career counselor for young women in South Africa. Based on this user profile, generate personalized career guidance.

User Profile:
- Name: ${profile.fullName}
- Education: ${profile.education}
- Interests: ${profile.interests.join(', ')}
- Strengths: ${profile.strengths.join(', ')}
- Goals: ${profile.goals.join(', ')}
- Work style: ${profile.workStyle.join(', ')}

Available career paths: ${pathList}

Return ONLY a valid JSON object with NO markdown or code blocks:
{
  "careerPaths": [
    {
      "id": "software-dev",
      "whyItFits": "2-3 sentences specifically referencing this person's interests/strengths/goals",
      "encouragement": "One short warm encouraging sentence personalised to them"
    }
  ],
  "courses": [
    {
      "title": "Course title",
      "platform": "Platform name",
      "duration": "X weeks",
      "rating": "4.X",
      "url": "https://real-course-url.com"
    }
  ],
  "networkingTip": "One specific SA-context networking tip tailored to their profile",
  "careerInsight": "One insightful observation about their unique combination of traits"
}

Rules:
- Include ALL 4 career paths, ranked best-fit first based on their profile
- Include exactly 4 courses suited to their top career path — use real platforms (Coursera, edX, FreeCodeCamp, Udemy, Google, freeCodeCamp, etc.) with real URLs
- whyItFits must be personal and specific, not generic
- Keep South African context throughout`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini returned no JSON');

  const data = JSON.parse(jsonMatch[0]) as AiData;
  data.generatedAt = new Date().toISOString();
  return data;
}
