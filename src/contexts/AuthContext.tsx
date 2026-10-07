import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { readJSON } from '../lib/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasProfile: boolean;
  setHasProfile: (v: boolean) => void;
  isRecruiter: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // Stay in the loading state until the profile check finishes, so routes
      // never act on a signed-in user with a stale hasProfile value.
      if (u) setLoading(true);
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          setHasProfile(snap.exists() && !!snap.data()?.profile);
          setIsRecruiter(snap.exists() && snap.data()?.isRecruiter === true);
        } catch {
          // Firestore unavailable — fall back to the locally cached profile
          setHasProfile(!!readJSON<unknown>('pathher_profile', null));
          setIsRecruiter(false);
        }
      } else {
        setHasProfile(false);
        setIsRecruiter(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      // The account exists at this point; the banner offers a resend.
      console.error('Failed to send verification email:', e);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    const keys = [
      'pathher_profile', 'saved_recommendations', 'saved_opportunities', // saved_opportunities: left by older versions
      'joined_network', 'is_recruiter', 'read_notifications',
      'connected_linkedin', 'profile_visible',
    ];
    keys.forEach(k => localStorage.removeItem(k));
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasProfile, setHasProfile, isRecruiter, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
