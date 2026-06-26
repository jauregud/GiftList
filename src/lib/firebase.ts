// Firebase configuration — set these in .env:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

//import the needed configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

let auth: import("firebase/auth").Auth | null = null;

//Authentication function
export async function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null; //must be configured
  if (auth) return auth;
  const { initializeApp, getApps } = await import("firebase/app"); //import app
  const { getAuth } = await import("firebase/auth");
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]; //create app
  auth = getAuth(app);
  return auth;
}

//function for signing in with google
export async function firebaseSignInWithGoogle() {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return null;
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(fbAuth, provider);
  return result.user;
}
//sign into firebase with email
export async function firebaseSignInWithEmail(email: string, password: string) {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return null;
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const result = await signInWithEmailAndPassword(fbAuth, email, password); //call function with authentication, email, password
  return result.user;
}

export async function firebaseCreateAccount(
  //requirements for creating account
  email: string,
  password: string,
  displayName: string
) {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return null;
  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "firebase/auth"
  );
  const result = await createUserWithEmailAndPassword(fbAuth, email, password); //make a new user with authentication, email, and password
  await updateProfile(result.user, { displayName });
  return result.user;
}

export async function firebaseSignOut() { //log out of firebase
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return;
  const { signOut } = await import("firebase/auth");
  await signOut(fbAuth);
}


//import firestore
let firestore: import("firebase/firestore").Firestore | null = null;
//use the firestore database
export async function getFirestoreDb() {
  if (firestore) return firestore;

  const { initializeApp, getApps } = await import("firebase/app");
  const { getFirestore } = await import("firebase/firestore");

  const app =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];

  firestore = getFirestore(app);

  return firestore; //return firestore database when called
}
