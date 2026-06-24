import { Link } from "react-router";
import { Gift, Lock, Users, Star, ArrowRight, Check, Sparkles } from "lucide-react";
import { MemphisHero } from "../components/MemphisShapes";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Nav */}
      <header className="bg-card/80 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">GiftList</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/login?tab=register"
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <MemphisHero />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground border border-accent/30 px-4 py-1.5 rounded-full text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            No more duplicate gifts. No more spoiled surprises.
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold text-foreground leading-tight mb-6">
            Gift giving,{" "}
            <span className="text-primary">finally</span>
            <br />
            <span className="text-secondary">sorted.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create exchange groups, share wishlists, and let family members claim
            gifts — all while keeping the surprise alive. The list owner{" "}
            <em className="text-foreground font-semibold not-italic">never</em>{" "}
            sees who claimed what.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login?tab=register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start your exchange
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-card text-foreground border-2 border-border px-8 py-4 rounded-2xl text-base font-bold hover:bg-muted transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to a stress-free gift exchange</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Users className="w-7 h-7" />,
                color: "bg-primary",
                title: "Create a group",
                desc: "Invite your family or friends with a shareable link. Everyone joins at once.",
              },
              {
                step: "02",
                icon: <Star className="w-7 h-7" />,
                color: "bg-secondary",
                title: "Build your wishlist",
                desc: "Add items with images, shop links, and priority rankings — from must-haves to nice-to-haves.",
              },
              {
                step: "03",
                icon: <Lock className="w-7 h-7" />,
                color: "bg-accent",
                title: "Claim gifts privately",
                desc: "Browse others' lists and claim items to buy. The owner only sees it's been claimed — not by whom.",
              },
            ].map(({ step, icon, color, title, desc }) => (
              <div key={step} className="relative bg-background rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors group">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-black">
                  {step}
                </div>
                <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-foreground text-background rounded-3xl p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10 text-center">
              <Lock className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Privacy you can trust
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                Claim privacy isn't just a UI trick — it's enforced at the database
                level. List owners genuinely cannot access claim data for their own
                items, not even through the API.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {[
                  "Database-level security rules",
                  "No server-side leaks",
                  "Claim data siloed by design",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Check className="w-4 h-4 text-secondary" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground mb-4">
          Ready for your best gift exchange yet?
        </h2>
        <p className="text-muted-foreground mb-8">Free to use. No credit card needed.</p>
        <Link
          to="/login?tab=register"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          <Gift className="w-5 h-5" />
          Create your first group
        </Link>
      </section>
    </div>
  );
}
