import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasProfile: boolean;
  setHasProfile: (v: boolean) => void;
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

  useEffect(() => {
    // If Firebase is not initialized, set loading to false immediately
    if (!auth) {
      console.warn('Firebase Auth is not initialized. Running in demo mode.');
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && db) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          setHasProfile(snap.exists() && !!snap.data()?.profile);
        } catch (error) {
          // Firestore unavailable or rules not set up — treat as no profile
          console.warn('Firestore error:', error);
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await firebaseSignOut(auth);
    localStorage.removeItem('pathher_profile');
    localStorage.removeItem('saved_recommendations');
    localStorage.removeItem('saved_opportunities');
    localStorage.removeItem('joined_network');
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasProfile, setHasProfile, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
