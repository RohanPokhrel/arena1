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
import { auth, db, googleProvider, facebookProvider, realtimeDb } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { ref, set, onDisconnect, get, update, onValue } from 'firebase/database';
import { serverTimestamp } from 'firebase/database';
import DeviceRestrictionMessage from '@/components/DeviceRestrictionMessage';

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
  isActiveSessionExists: boolean;
  forceSignOutFromOtherDevices: () => Promise<void>;
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
  const [isActiveSessionExists, setIsActiveSessionExists] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = ref(realtimeDb, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL,
      online: true,
      lastSeen: serverTimestamp(),
      lastActive: serverTimestamp(),
      deviceId: generateDeviceId(),
      createdAt: user.metadata.creationTime || new Date().toISOString()
    };

    get(userRef).then((snapshot) => {
      const existingData = snapshot.val();
      
      if (existingData && existingData.online && 
          existingData.deviceId && 
          existingData.deviceId !== userData.deviceId) {
        console.log('Active session exists on another device');
        setIsActiveSessionExists(true);
        return;
      }

      set(userRef, userData).catch(error => {
        console.error('Error saving user data:', error);
      });

      onDisconnect(userRef).update({
        online: false,
        lastSeen: serverTimestamp()
      });
    });

    const deviceListener = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.online && data.deviceId && data.deviceId !== userData.deviceId) {
        setIsActiveSessionExists(true);
      }
    });

    return () => {
      deviceListener();
      update(userRef, {
        online: false,
        lastSeen: serverTimestamp()
      });
    };
  }, [user]);

  const forceSignOutFromOtherDevices = async () => {
    if (!user) return;
    
    const userRef = ref(realtimeDb, `users/${user.uid}`);
    try {
      await update(userRef, {
        online: false,
        lastSeen: serverTimestamp(),
        deviceId: null
      });
      
      localStorage.removeItem('deviceId');
      
      await firebaseSignOut(auth);
      
      setIsActiveSessionExists(false);
      
      router.push('/auth/login');
    } catch (error) {
      console.error('Error forcing sign out:', error);
    }
  };

  const generateDeviceId = () => {
    const browserInfo = `${navigator.userAgent}-${window.innerWidth}x${window.innerHeight}`;
    const existingId = localStorage.getItem('deviceId');
    
    if (existingId) return existingId;
    
    const newId = btoa(`${browserInfo}-${Date.now()}`);
    localStorage.setItem('deviceId', newId);
    return newId;
  };

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
        isActiveSessionExists,
        forceSignOutFromOtherDevices,
      }}
    >
      {!loading && (isActiveSessionExists ? <DeviceRestrictionMessage /> : children)}
    </AuthContext.Provider>
  );
} 