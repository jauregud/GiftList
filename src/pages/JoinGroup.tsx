import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Gift, Users, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { joinGroupByCode, getGroupById } from "../lib/store";
import type { Group } from "../lib/types";
import { toast } from "sonner";

// Helper: find group by invite code via Firestore
async function getGroupByCode(code: string): Promise<Group | null> {
  const { getFirestoreDb } = await import("../lib/firebase");
  const db = await getFirestoreDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const q = query(collection(db, "groups"), where("inviteCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Group;
}

export default function JoinGroup() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [joining, setJoining] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    getGroupByCode(code).then((g) => {
      if (!g) setNotFound(true);
      else setGroup(g);
      setLoading(false);
    });
  }, [code]);

  useEffect(() => {
    if (!user && code) {
      navigate(`/login?redirect=/join/${code}`, { replace: true });
    }
  }, [user, code, navigate]);

  async function handleJoin() {
    if (!user || !code) return;
    setJoining(true);
    const result = await joinGroupByCode(code, { id: user.id, name: user.name, email: user.email });
    if (!result) {
      toast.error("Failed to join. The link may be invalid.");
      setJoining(false);
      return;
    }
    toast.success(`Joined "${result.name}"!`);
    navigate(`/groups/${result.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground text-sm">
        Looking up invite…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Invalid invite link</h2>
        <p className="text-muted-foreground mb-6">
          This invite link is invalid or has expired. Ask the group owner for a fresh link.
        </p>
        <Link to="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (!group) return null;

  const alreadyMember = user && group.members.some((m) => m.userId === user.id);

  if (alreadyMember) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-secondary/15 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Gift className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">You're already in!</h2>
        <p className="text-muted-foreground mb-6">
          You're already a member of <strong>{group.name}</strong>.
        </p>
        <Link
          to={`/groups/${group.id}`}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Go to group
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-md">
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          You're invited!
        </h2>
        <p className="text-muted-foreground mb-1">
          <strong>{group.ownerName}</strong> has invited you to join:
        </p>
        <p className="font-display text-xl font-bold text-primary mb-4">{group.name}</p>

        {group.description && (
          <p className="text-sm text-muted-foreground bg-muted rounded-xl px-4 py-2 mb-4">
            {group.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Users className="w-4 h-4" />
          {group.members.length} member{group.members.length !== 1 ? "s" : ""} already joined
          {group.budget && (
            <span> · ${group.budget} budget</span>
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
        >
          {joining ? "Joining…" : "Join this group"}
        </button>
        <Link
          to="/dashboard"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          Maybe later
        </Link>
      </div>
    </div>
  );
}
