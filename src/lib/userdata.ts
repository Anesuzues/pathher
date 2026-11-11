import { doc, setDoc, getDoc, addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function loadUserField<T>(uid: string, field: string, fallback: T): Promise<T> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists() && snap.data()?.[field] !== undefined) {
      return snap.data()[field] as T;
    }
  } catch (e) {
    console.error(`Failed to load user field "${field}":`, e);
  }
  return fallback;
}

// The write helpers below resolve to false/null on failure so callers can tell the user.

export async function saveUserField(uid: string, field: string, value: unknown): Promise<boolean> {
  try {
    await setDoc(doc(db, 'users', uid), { [field]: value }, { merge: true });
    return true;
  } catch (e) {
    console.error(`Failed to save user field "${field}":`, e);
    return false;
  }
}

export interface MentorRequest {
  id?: string;
  userId: string;
  userName: string;
  field: string;
  message: string;
  createdAt: Timestamp;
  status: 'pending' | 'matched';
}

export async function saveMentorRequest(req: Omit<MentorRequest, 'id'>): Promise<boolean> {
  try {
    await addDoc(collection(db, 'mentorRequests'), req);
    return true;
  } catch (e) {
    console.error('Failed to save mentor request:', e);
    return false;
  }
}

export interface PostedRole {
  id?: string;
  title: string;
  type: string;
  description?: string;
  /** CareerPath id that best prepares someone for this role, if any. */
  pathId?: string;
  postedBy: string;
  postedByName: string;
  createdAt: Timestamp;
  status: 'active' | 'closed';
}

export async function saveRole(role: Omit<PostedRole, 'id'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'roles'), role);
    return ref.id;
  } catch (e) {
    console.error('Failed to save role:', e);
    return null;
  }
}

export async function loadUserRoles(uid: string): Promise<PostedRole[]> {
  try {
    const q = query(collection(db, 'roles'), where('postedBy', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PostedRole));
  } catch (e) {
    console.error('Failed to load roles:', e);
    return [];
  }
}

export async function closeRole(roleId: string): Promise<boolean> {
  try {
    await setDoc(doc(db, 'roles', roleId), { status: 'closed' }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to close role:', e);
    return false;
  }
}
