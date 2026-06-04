import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Users, Gift, ExternalLink, Copy, Check, Star, LogIn } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { getUserGroups, createGroup, joinGroupByCode } from "../lib/store";
import type { Group } from "../lib/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function GroupCard({ group, currentUserId }: { group: Group; currentUserId: string }) {
  const [copied, setCopied] = useState(false);
  const isOwner = group.ownerId === currentUserId;
  const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card rounded-3xl border border-border hover:border-primary/30 hover:shadow-md transition-all overflow-hidden group">
      {/* Color accent bar */}
      <div className={`h-1.5 ${isOwner ? "bg-primary" : "bg-secondary"}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg font-bold text-foreground truncate">{group.name}</h3>
              {isOwner && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  Owner
                </span>
              )}
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
            )}
          </div>
          <Link
            to={`/groups/${group.id}`}
            className="flex-shrink-0 bg-primary text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            Open
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{group.members.length}</span>
            <span>members</span>
          </div>
          {group.budget && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent" />
              <span className="font-semibold">${group.budget}</span>
              <span>budget</span>
            </div>
          )}
          <span className="ml-auto text-xs">
            {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Members avatars */}
        <div className="flex items-center gap-1 mb-4">
          {group.members.slice(0, 5).map((m, i) => (
            <div
              key={m.userId}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold border-2 border-card"
              style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }}
            >
              {m.name[0].toUpperCase()}
            </div>
          ))}
          {group.members.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border-2 border-card" style={{ marginLeft: -8 }}>
              +{group.members.length - 5}
            </div>
          )}
        </div>

        {/* Invite link */}
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-2 bg-muted hover:bg-muted/80 border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-secondary flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="flex-1 truncate text-left">{inviteUrl}</span>
          <span className="font-semibold text-foreground">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createBudget, setCreateBudget] = useState("");

  // Join form state
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (user) setGroups(getUserGroups(user.id));
  }, [user]);

  function refreshGroups() {
    if (user) setGroups(getUserGroups(user.id));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const group = createGroup(
      createName,
      createDesc,
      createBudget ? Number(createBudget) : undefined,
      { id: user.id, name: user.name, email: user.email }
    );
    toast.success(`"${group.name}" created!`);
    setShowCreate(false);
    setCreateName("");
    setCreateDesc("");
    setCreateBudget("");
    navigate(`/groups/${group.id}`);
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const code = joinCode.trim().split("/").pop() ?? joinCode.trim();
    const group = joinGroupByCode(code, { id: user.id, name: user.name, email: user.email });
    if (!group) {
      toast.error("Invalid invite code. Check the link and try again.");
      return;
    }
    toast.success(`Joined "${group.name}"!`);
    setShowJoin(false);
    setJoinCode("");
    refreshGroups();
    navigate(`/groups/${group.id}`);
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Hey, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {groups.length === 0
              ? "Create or join a gift exchange group to get started."
              : `You're in ${groups.length} exchange group${groups.length !== 1 ? "s" : ""}.`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowJoin((p) => !p); setShowCreate(false); }}
            className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-muted transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Join group
          </button>
          <button
            onClick={() => { setShowCreate((p) => !p); setShowJoin(false); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New group
          </button>
        </div>
      </div>

      {/* Create group form */}
      {showCreate && (
        <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 mb-8 shadow-md">
          <h2 className="font-display text-xl font-bold text-foreground mb-5">Create a new group</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Johnson Family Christmas 2025"
                  required
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Budget per person</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  <input
                    type="number"
                    value={createBudget}
                    onChange={(e) => setCreateBudget(e.target.value)}
                    placeholder="50"
                    min="1"
                    className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Description (optional)</label>
              <input
                type="text"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Secret Santa exchange for the extended family"
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm"
              >
                Create group
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="bg-muted text-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join group form */}
      {showJoin && (
        <div className="bg-card border-2 border-secondary/30 rounded-3xl p-6 mb-8 shadow-md">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Join a group</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Paste the invite link or code shared with you.
          </p>
          <form onSubmit={handleJoin} className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Paste invite link or code"
              required
              className="flex-1 px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
            />
            <button
              type="submit"
              className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-colors shadow-sm"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => setShowJoin(false)}
              className="bg-muted text-foreground px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">No groups yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Create a group to start your gift exchange, or join one with an invite link.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} currentUserId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
