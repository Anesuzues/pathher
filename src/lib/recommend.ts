import { CAREER_PATHS } from '../constants';
import { CareerPath } from '../types';
import { readJSON, readStringList } from './utils';

const CAREER_KEYWORDS: Record<string, string[]> = {
  'ai-digital-professional': ['Business', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Social Work', 'Law', 'Communication', 'Organization', 'Leadership', 'Teamwork', 'Empathy', 'Public Speaking', 'Adaptability', 'Stability', 'Work-Life Balance', 'Helping Others', 'Networking', 'Management', 'Social Impact'],
  'junior-software-developer': ['Technology', 'Engineering', 'Arts & Design', 'Problem Solving', 'Technical Skills', 'Creativity', 'Skill Mastery', 'High Salary'],
  'ai-enhanced-developer': ['Technology', 'Science', 'Writing', 'Analytical Thinking', 'Organization', 'Communication', 'Skill Mastery', 'Innovation'],
  'ai-application-developer': ['Technology', 'Engineering', 'Science', 'Technical Skills', 'Problem Solving', 'Analytical Thinking', 'Innovation', 'Entrepreneurship', 'High Salary'],
};

// Advanced certificates build on earlier ones, so weight them by how far along the person already is.
const EDUCATION_BONUS: Record<string, Partial<Record<string, number>>> = {
  'High School Student': { 'ai-digital-professional': 3, 'junior-software-developer': 1 },
  'High School Graduate': { 'ai-digital-professional': 2, 'junior-software-developer': 2 },
  'Undergraduate Student': { 'junior-software-developer': 2, 'ai-enhanced-developer': 1 },
  'University Graduate': { 'ai-enhanced-developer': 2, 'ai-application-developer': 1 },
  'Postgraduate Student': { 'ai-enhanced-developer': 1, 'ai-application-developer': 2 },
  'Working Professional': { 'ai-digital-professional': 1, 'ai-application-developer': 2 },
  'Career Changer': { 'ai-digital-professional': 2, 'junior-software-developer': 2 },
};

// Profiles come from Firestore or localStorage, so don't trust their shape.
const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

function scoreCareerPath(path: CareerPath, profile: any): number {
  const keywords = CAREER_KEYWORDS[path.id] || [];
  let score = 0;
  list(profile?.interests).forEach(i => { if (keywords.includes(i)) score += 3; });
  list(profile?.strengths).forEach(s => { if (keywords.includes(s)) score += 2; });
  list(profile?.goals).forEach(g => { if (keywords.includes(g)) score += 1; });
  score += EDUCATION_BONUS[profile?.education || '']?.[path.id] || 0;
  return score;
}

// Every career path, best match for the profile first. Ties keep catalogue order.
export function rankCareerPaths(profile: unknown): CareerPath[] {
  return CAREER_PATHS
    .map(path => ({ path, score: scoreCareerPath(path, profile) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.path);
}

// The path a user's CV, Learning page and readiness are built around: the first
// one they saved, otherwise their best match once they have a profile.
export function getPrimaryPath(profile: unknown, savedIds: string[]): CareerPath | undefined {
  const saved = savedIds.map(id => CAREER_PATHS.find(p => p.id === id)).find(Boolean);
  return saved || (profile ? rankCareerPaths(profile)[0] : undefined);
}

// Same, from what this browser has cached (used where a page has no Firestore read of its own).
export function getCachedPrimaryPath(): CareerPath | undefined {
  return getPrimaryPath(readJSON<unknown>('pathher_profile', null), readStringList('saved_recommendations'));
}
