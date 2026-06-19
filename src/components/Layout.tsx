import { Link, NavLink, useNavigate } from "react-router";
import { Gift, LogOut, LayoutDashboard, ChevronDown, Beaker } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  const initials = user?.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Memphis stripe header accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />

      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              GiftList
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {isDemoMode && (
              <div className="hidden sm:flex items-center gap-1.5 bg-accent/20 text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full border border-accent/30">
                <Beaker className="w-3 h-3" />
                Demo Mode
              </div>
            )}

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>

            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground hidden sm:block max-w-28 truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-card rounded-2xl border border-border shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Gift className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-foreground">GiftList</span>
          <span>— No more duplicate gifts</span>
        </div>
      </footer>
    </div>
  );
}
