import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { CareerPath, KnobzCertificate } from '../types';
import type { AiInput, AiTask, BrandingResult, CareerResult } from '../../api/ai';

export type { BrandingResult, CareerResult };

// Client side of /api/ai. Results are saved on the user's Firestore document
// with a key built from the inputs, so the model only runs again when the
// person's answers, path or certificate change (or they ask to regenerate).

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

export function buildAiInput(profile: any, path: CareerPath, cert: KnobzCertificate): AiInput {
  return {
    profile: {
      // First name only: the model doesn't need anything that identifies the person.
      firstName: typeof profile?.fullName === 'string' ? profile.fullName.trim().split(/\s+/)[0] || '' : '',
      education: typeof profile?.education === 'string' ? profile.education : '',
      interests: list(profile?.interests),
      strengths: list(profile?.strengths),
      goals: list(profile?.goals),
      workStyle: list(profile?.workStyle),
    },
    path: { title: path.title, skillsNeeded: path.skillsNeeded },
    certificate: { number: cert.number, title: cert.title, description: cert.description },
  };
}

/** Stable key for an input, so a saved result is reused only for the same answers. */
export function inputKey(task: AiTask, input: AiInput): string {
  const s = JSON.stringify([task, input]);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${task}-${(h >>> 0).toString(36)}`;
}

const FIELD: Record<AiTask, string> = { career: 'aiCareer', branding: 'aiBranding' };

type ResultFor<T extends AiTask> = T extends 'career' ? CareerResult : BrandingResult;

/**
 * Returns the AI text for this input: the saved copy if the answers haven't
 * changed, otherwise a fresh one from /api/ai. Throws if the AI is unavailable,
 * so callers can keep showing the built-in text.
 */
export async function getAiResult<T extends AiTask>(
  task: T,
  input: AiInput,
  { regenerate = false }: { regenerate?: boolean } = {},
): Promise<ResultFor<T>> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const key = inputKey(task, input);
  const ref = doc(db, 'users', user.uid);

  if (!regenerate) {
    try {
      const saved = (await getDoc(ref)).data()?.[FIELD[task]];
      if (saved?.key === key && saved.result) return saved.result as ResultFor<T>;
    } catch { /* fall through to a fresh request */ }
  }

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ task, input }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const { result } = (await res.json()) as { result: ResultFor<T> };

  try {
    await setDoc(ref, { [FIELD[task]]: { key, result, generatedAt: new Date().toISOString() } }, { merge: true });
  } catch { /* saving is a nice-to-have */ }
  return result;
}
