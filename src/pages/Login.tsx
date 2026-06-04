import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Gift, Mail, Lock, User, Eye, EyeOff, AlertCircle, Chrome } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  isFirebaseConfigured,
  firebaseSignInWithGoogle,
  firebaseSignInWithEmail,
  firebaseCreateAccount,
} from "../lib/firebase";
import { toast } from "sonner";

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Login() {
  const { user, signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"signin" | "register">(
    params.get("tab") === "register" ? "register" : "signin"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = params.get("redirect") ?? "/dashboard";

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isDemoMode) {
        // Demo mode: create/login with local user
        const demoUser = {
          id: `demo_${nanoid()}`,
          name: tab === "register" ? name : (name || email.split("@")[0]),
          email,
        };
        signIn(demoUser);
        toast.success(tab === "register" ? "Account created!" : "Welcome back!");
      } else {
        if (tab === "register") {
          const fbUser = await firebaseCreateAccount(email, password, name);
          if (fbUser) {
            signIn({ id: fbUser.uid, name: fbUser.displayName ?? name, email: fbUser.email ?? email });
            toast.success("Account created!");
          }
        } else {
          const fbUser = await firebaseSignInWithEmail(email, password);
          if (fbUser) {
            signIn({ id: fbUser.uid, name: fbUser.displayName ?? email, email: fbUser.email ?? email });
            toast.success("Welcome back!");
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (isDemoMode) {
      toast.info("Configure Firebase to enable Google sign-in.");
      return;
    }
    setLoading(true);
    try {
      const fbUser = await firebaseSignInWithGoogle();
      if (fbUser) {
        signIn({ id: fbUser.uid, name: fbUser.displayName ?? "User", email: fbUser.email ?? "" });
        toast.success("Signed in with Google!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">GiftList</span>
          </Link>
          <p className="text-muted-foreground mt-2">
            {tab === "register" ? "Create your free account" : "Welcome back"}
          </p>
        </div>

        {/* Demo mode notice */}
        {isDemoMode && (
          <div className="bg-accent/20 border border-accent/40 rounded-2xl p-4 mb-6 text-sm">
            <p className="font-bold text-accent-foreground mb-1">Demo Mode</p>
            <p className="text-muted-foreground">
              Firebase isn't configured — your data is saved locally in this browser.
              Add <code className="bg-muted px-1 rounded text-xs">VITE_FIREBASE_*</code> env
              vars to enable real auth.
            </p>
          </div>
        )}

        <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-border">
            {(["signin", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`py-4 text-sm font-bold transition-colors ${
                  tab === t
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Google button */}
            {isFirebaseConfigured && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold py-3 px-4 rounded-xl transition-colors mb-4 disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-semibold">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Your name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Johnson"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {(!isDemoMode || tab === "register") && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === "register" ? "At least 8 characters" : "Your password"}
                      required={!isDemoMode}
                      minLength={isDemoMode ? 0 : 8}
                      className="w-full pl-10 pr-12 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-60 mt-2"
              >
                {loading
                  ? "Please wait…"
                  : tab === "register"
                  ? "Create account"
                  : "Sign in"}
              </button>
            </form>

            {tab === "signin" && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <button
                  onClick={() => setTab("register")}
                  className="text-primary font-bold hover:underline"
                >
                  Sign up free
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our made-up{" "}
          <span className="underline cursor-pointer">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
