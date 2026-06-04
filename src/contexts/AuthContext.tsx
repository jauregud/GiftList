import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "../lib/types";
import { isFirebaseConfigured, getFirebaseAuth, firebaseSignOut } from "../lib/firebase";

const DEMO_USER_KEY = "giftlist_demo_user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isDemoMode: true,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  useEffect(() => {
    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      setLoading(false);
      return;
    }

    // Firebase auth state listener
    let unsubscribe: (() => void) | undefined;
    getFirebaseAuth().then((auth) => {
      if (!auth) {
        setLoading(false);
        return;
      }
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            setUser({
              id: fbUser.uid,
              name: fbUser.displayName ?? fbUser.email ?? "User",
              email: fbUser.email ?? "",
              photoURL: fbUser.photoURL ?? undefined,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      });
    });
    return () => unsubscribe?.();
  }, [isDemoMode]);

  function signIn(u: User) {
    setUser(u);
    if (isDemoMode) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(u));
    }
  }

  async function handleSignOut() {
    if (!isDemoMode) {
      await firebaseSignOut();
    } else {
      localStorage.removeItem(DEMO_USER_KEY);
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, signIn, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
