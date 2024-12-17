import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTW_BNGikp0y_d5NKtzk7eZYTTaNP3Q_E",
  authDomain: "rohan-arena.firebaseapp.com",
  projectId: "rohan-arena",
  storageBucket: "rohan-arena.firebasestorage.app",
  messagingSenderId: "168285215383",
  appId: "1:168285215383:web:1c2f3014215fa445ec27d2",
  measurementId: "G-V1ZSEKRMXF"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, db, googleProvider, facebookProvider };