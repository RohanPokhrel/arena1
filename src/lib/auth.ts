import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export const createUser = async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      balance: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0
      }
    });

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    toast.error(error.message || 'Failed to create account');
    return null;
  }
};

export const signIn = async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    toast.error(error.message || 'Failed to sign in');
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    toast.success('Signed out successfully');
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast.error(error.message || 'Failed to sign out');
  }
};

export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // If user doesn't exist, create a new document
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        balance: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        stats: {
          wins: 0,
          losses: 0,
          draws: 0
        }
      });
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    toast.error(error.message || 'Failed to sign in with Google');
    return null;
  }
};

export const getCurrentUser = (): Promise<AuthUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        resolve(null);
      }
    });
  });
}; 