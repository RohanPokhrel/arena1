import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth, db, googleProvider, facebookProvider } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUserBalance: (newBalance: number) => Promise<void>;
  signInWithGoogle: () => Promise<{ user: User } | undefined>;
  signInWithFacebook: () => Promise<{ user: User } | undefined>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user };
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return { user: result.user };
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(error.message);
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, userData: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userData,
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in instead.');
      } else {
        setError(error.message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      const usernameDoc = doc(db, 'usernames', username);
      const usernameSnapshot = await getDoc(usernameDoc);
      return !usernameSnapshot.exists();
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: Number(newBalance),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        updateUserBalance,
        signInWithGoogle,
        signInWithFacebook,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        checkUsernameAvailability,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
} 