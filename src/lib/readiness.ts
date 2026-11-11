import { KNOBZ } from '../constants';

// Career readiness: the concrete steps a PathHer user can take, scored the same
// way on every page. Each step is ticked from the user's Firestore document,
// with this browser's localStorage as a fallback (for offline use, or before
// Firestore has loaded).
//
// Not counted yet: certificate progress. KnobzToLearn doesn't share it with us,
// so the KnobzToLearn step only records that the person opened the sign-up page.

export type ReadinessStepId = 'profile' | 'path' | 'cv' | 'linkedin' | 'knobz' | 'network' | 'mentor';

export interface ReadinessStep {
  id: ReadinessStepId;
  label: string;
  done: boolean;
  /** In-app route for the step... */
  to?: string;
  /** ...or an external link. */
  href?: string;
}

export interface Readiness {
  steps: ReadinessStep[];
  done: number;
  total: number;
  percent: number;
}

export interface ReadinessSource {
  /** The user's Firestore document, or null if not loaded. */
  doc: Record<string, any> | null;
  /** Reads a localStorage key; returns null if missing or storage is blocked. */
  local: (key: string) => string | null;
}

/** Where a markable step is recorded: a flag on the user document and a localStorage key. */
export const STEP_FLAGS: Partial<Record<ReadinessStepId, { field: string; localKey: string }>> = {
  cv: { field: 'cvGenerated', localKey: 'cv_generated' },
  linkedin: { field: 'linkedinUpdated', localKey: 'linkedin_updated' },
  knobz: { field: 'knobzVisited', localKey: 'knobz_visited' },
  network: { field: 'joinedNetwork', localKey: 'joined_network' },
  mentor: { field: 'mentorRequested', localKey: 'mentor_requested' },
};

const parse = (raw: string | null): unknown => {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
const nonEmptyList = (v: unknown) => Array.isArray(v) && v.some(x => typeof x === 'string' && x.trim());
const nonEmptyText = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

/** True when every onboarding answer is filled in. */
export function isProfileComplete(profile: any): boolean {
  if (!profile || typeof profile !== 'object') return false;
  return nonEmptyText(profile.fullName) && nonEmptyText(profile.email) && nonEmptyText(profile.education)
    && nonEmptyList(profile.interests) && nonEmptyList(profile.strengths)
    && nonEmptyList(profile.goals) && nonEmptyList(profile.workStyle);
}

export function computeReadiness({ doc, local }: ReadinessSource): Readiness {
  const flagged = (id: ReadinessStepId) => {
    const f = STEP_FLAGS[id];
    return !!f && (doc?.[f.field] === true || !!local(f.localKey));
  };
  const profile = doc?.profile ?? parse(local('pathher_profile'));

  const steps: ReadinessStep[] = [
    { id: 'profile', label: 'Complete your profile', to: '/onboarding', done: isProfileComplete(profile) },
    {
      id: 'path', label: 'Save a career path', to: '/recommendations',
      done: nonEmptyList(doc?.savedRecommendations) || nonEmptyList(parse(local('saved_recommendations'))),
    },
    // An AI-written CV saved on the account also counts, for people who made one before this flag existed.
    { id: 'cv', label: 'Generate your CV', to: '/branding', done: flagged('cv') || !!doc?.aiBranding?.result },
    { id: 'linkedin', label: 'Update your LinkedIn profile', to: '/branding', done: flagged('linkedin') },
    { id: 'knobz', label: `Go to ${KNOBZ.name} and sign up`, href: KNOBZ.signupUrl, done: flagged('knobz') },
    { id: 'network', label: 'Join the Talent Network', to: '/ecosystem', done: flagged('network') },
    { id: 'mentor', label: 'Ask for a mentor', to: '/ecosystem', done: flagged('mentor') },
  ];
  const done = steps.filter(s => s.done).length;
  return { steps, done, total: steps.length, percent: Math.round((done / steps.length) * 100) };
}
