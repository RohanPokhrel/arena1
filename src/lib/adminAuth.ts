import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from "firebase/auth";

export const ADMIN_EMAIL = "rohanpokhrel800@gmail.com";
const ADMIN_PASSWORD = "rohanarenagreat123";

export const setupAdminAccount = async () => {
  try {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            // Check if user exists first
            const signInMethods = await fetchSignInMethodsForEmail(auth, ADMIN_EMAIL);
            
            if (signInMethods.length === 0) {
              const userCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
              console.log("Created new admin account");
            } else {
              await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
              console.log("Signed in existing admin");
            }
          } catch (error: any) {
            console.error("Error in admin auth:", error);
            reject(error);
            return;
          }
        }

        try {
          // Use UID instead of email for admin document
          const adminDoc = doc(db, "admins", user!.uid);
          const adminExists = await getDoc(adminDoc);

          if (!adminExists.exists()) {
            // Create admin document in Firestore
            await setDoc(adminDoc, {
              email: ADMIN_EMAIL,
              role: "admin",
              createdAt: new Date().toISOString(),
              permissions: [
                "manage_users",
                "manage_transactions",
                "manage_withdrawals",
                "manage_games",
                "view_analytics"
              ]
            });
            console.log("Created admin document in Firestore");
          }
          
          unsubscribe();
          resolve(true);
        } catch (error) {
          console.error("Error setting up admin document:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error in setupAdminAccount:", error);
    throw error;
  }
};
