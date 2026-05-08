import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAEMSElvvzU_zXA8I6DiFWrCqAa46WWqgE",
  authDomain: "path-her.firebaseapp.com",
  projectId: "path-her",
  storageBucket: "path-her.firebasestorage.app",
  messagingSenderId: "509423391053",
  appId: "1:509423391053:web:7e67ece70c9abd269a6704",
  measurementId: "G-9E56ER95GG",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
