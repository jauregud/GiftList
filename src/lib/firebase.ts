// Firebase configuration — set these in .env:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

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

export async function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null;
  if (auth) return auth;
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  return auth;
}

export async function firebaseSignInWithGoogle() {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return null;
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(fbAuth, provider);
  return result.user;
}

export async function firebaseSignInWithEmail(email: string, password: string) {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return null;
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const result = await signInWithEmailAndPassword(fbAuth, email, password);
  return result.user;
}

export async function firebaseCreateAccount(
  email: string,
  password: string,
  displayName: string
) {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return null;
  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "firebase/auth"
  );
  const result = await createUserWithEmailAndPassword(fbAuth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

export async function firebaseSignOut() {
  const fbAuth = await getFirebaseAuth();
  if (!fbAuth) return;
  const { signOut } = await import("firebase/auth");
  await signOut(fbAuth);
}


/////////////////////////////////////
let firestore: import("firebase/firestore").Firestore | null = null;

export async function getFirestoreDb() {
  if (firestore) return firestore;

  const { initializeApp, getApps } = await import("firebase/app");
  const { getFirestore } = await import("firebase/firestore");

  const app =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];

  firestore = getFirestore(app);

  return firestore;
}