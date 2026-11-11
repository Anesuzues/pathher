import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { CareerPath, KnobzCertificate } from '../types';
import type {
  AiInput, AiTask, BrandingResult, CareerResult, InputFor, MentorResult, ProfileCategory, ProfileInput,
  ProfileResult, ResultFor, RoleInput, RoleResult,
} from '../../api/ai';

export type {
  AiInput, BrandingResult, CareerResult, MentorResult, ProfileCategory, ProfileInput, ProfileResult, RoleInput, RoleResult,
};

/** The person has used up today's AI generations; the message is safe to show them. */
export class AiLimitError extends Error {}

// Client side of /api/ai. Career and branding results are saved on the user's
// Firestore document with a key built from the inputs, so the model only runs
// again when the person's answers, path or certificate change (or they ask to
// regenerate). Drafts (mentor, role, profile) are one-off and never saved.

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

const summary = (path: CareerPath) => ({ title: path.title, skillsNeeded: path.skillsNeeded });

export function buildAiInput(
  profile: any,
  path: CareerPath,
  cert: KnobzCertificate,
  extra: { otherPaths?: CareerPath[]; mentorField?: string } = {},
): AiInput {
  const input: AiInput = {
    profile: {
      // First name only: the model doesn't need anything that identifies the person.
      firstName: typeof profile?.fullName === 'string' ? profile.fullName.trim().split(/\s+/)[0] || '' : '',
      education: typeof profile?.education === 'string' ? profile.education : '',
      interests: list(profile?.interests),
      strengths: list(profile?.strengths),
      goals: list(profile?.goals),
      workStyle: list(profile?.workStyle),
    },
    path: summary(path),
    certificate: { number: cert.number, title: cert.title, description: cert.description },
  };
  if (extra.otherPaths?.length) input.otherPaths = extra.otherPaths.map(summary);
  if (extra.mentorField?.trim()) input.mentorField = extra.mentorField.trim();
  return input;
}

// Bump when the prompts or the reply checks change, so results saved under the
// old version are regenerated once instead of being shown forever.
// v2: next steps no longer repeat the certificate or name other platforms.
// v3: career text also covers the other recommended paths; stricter system prompt.
// v4: LinkedIn text has no hashtags, so it can be pasted straight into LinkedIn.
export const AI_VERSION = 4;

/** Stable key for an input, so a saved result is reused only for the same answers. */
export function inputKey(task: AiTask, input: unknown): string {
  const s = JSON.stringify([AI_VERSION, task, input]);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${task}-${(h >>> 0).toString(36)}`;
}

/** Calls /api/ai once, with no saving. Throws AiLimitError at the daily limit, Error otherwise. */
export async function requestAi<T extends AiTask>(task: T, input: InputFor[T]): Promise<ResultFor[T]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ task, input }),
    signal: AbortSignal.timeout(30000),
  });
  if (res.status === 429) {
    const { limit } = (await res.json().catch(() => ({}))) as { limit?: number };
    const used = limit ? `all ${limit} of today's AI requests` : "today's AI requests";
    throw new AiLimitError(`You've used ${used}. Anything already written is saved, and you can use AI again tomorrow.`);
  }
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const { result } = (await res.json()) as { result: ResultFor[T] };
  return result;
}

const FIELD = { career: 'aiCareer', branding: 'aiBranding' } as const;
type SavedTask = keyof typeof FIELD;

/**
 * Returns the AI text for this input: the saved copy if the answers haven't
 * changed, otherwise a fresh one from /api/ai. Throws if the AI is unavailable,
 * so callers can keep showing the built-in text.
 */
export async function getAiResult<T extends SavedTask>(
  task: T,
  input: AiInput,
  { regenerate = false }: { regenerate?: boolean } = {},
): Promise<ResultFor[T]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const key = inputKey(task, input);
  const ref = doc(db, 'users', user.uid);

  if (!regenerate) {
    try {
      const saved = (await getDoc(ref)).data()?.[FIELD[task]];
      if (saved?.key === key && saved.result) return saved.result as ResultFor[T];
    } catch { /* fall through to a fresh request */ }
  }

  const result = await requestAi(task, input as InputFor[T]);

  try {
    await setDoc(ref, { [FIELD[task]]: { key, result, generatedAt: new Date().toISOString() } }, { merge: true });
  } catch { /* saving is a nice-to-have */ }
  return result;
}

/** Message to show when a one-off AI draft fails. */
export function aiErrorMessage(e: unknown): string {
  return e instanceof AiLimitError ? e.message : 'The AI writer is unavailable right now. Try again in a minute.';
}
