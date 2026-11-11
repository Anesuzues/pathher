import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuth } from '../contexts/AuthContext';
import { computeReadiness, STEP_FLAGS, type ReadinessStepId } from './readiness';

const localGet = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};

/** Records that the signed-in user did a step, in this browser and on their account. */
export function markReadinessStep(id: ReadinessStepId): void {
  const flag = STEP_FLAGS[id];
  if (!flag) return;
  // Already recorded from this browser: skip the repeat write (e.g. the CV step on every page load).
  if (localGet(flag.localKey) === 'true') return;
  try { localStorage.setItem(flag.localKey, 'true'); } catch { /* storage blocked */ }
  const user = auth.currentUser;
  if (user) {
    setDoc(doc(db, 'users', user.uid), { [flag.field]: true }, { merge: true })
      .catch(e => console.warn(`Couldn't save readiness step "${id}":`, e));
  }
}

/** The user's readiness checklist, plus mark() to tick a step and refresh it. */
export function useReadiness() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<Record<string, any> | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDoc(doc(db, 'users', user.uid))
      .then(snap => { if (!cancelled) setUserDoc(snap.data() ?? null); })
      .catch(() => { /* localStorage fallback still works */ });
    return () => { cancelled = true; };
  }, [user]);

  // version changes after mark(), so localStorage is read again.
  const readiness = useMemo(() => computeReadiness({ doc: userDoc, local: localGet }), [userDoc, version]);

  const mark = useCallback((id: ReadinessStepId) => {
    markReadinessStep(id);
    setVersion(v => v + 1);
  }, []);

  return { ...readiness, mark };
}
