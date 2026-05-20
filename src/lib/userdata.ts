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

export async function saveUserField(uid: string, field: string, value: unknown): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { [field]: value }, { merge: true });
  } catch (e) {
    console.error(`Failed to save user field "${field}":`, e);
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

export async function saveMentorRequest(req: Omit<MentorRequest, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'mentorRequests'), req);
  } catch (e) {
    console.error('Failed to save mentor request:', e);
  }
}

export interface PostedRole {
  id?: string;
  title: string;
  type: string;
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

export async function closeRole(roleId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'roles', roleId), { status: 'closed' }, { merge: true });
  } catch (e) {
    console.error('Failed to close role:', e);
  }
}
