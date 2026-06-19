import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft, Star, Plus, ExternalLink, Trash2, Edit3, Check,
  Users, Gift, ShoppingBag, Lock, AlertCircle, Copy, Image, Link2
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getGroupById,
  addItem,
  updateItem,
  deleteItem,
  claimItem,
  unclaimItem,
  getGroupWishlists,
  getOwnerItemViews,
} from "../lib/store";
import type { Group, WishlistItem, Priority } from "../lib/types";
import { PRIORITY_COLORS } from "../components/MemphisShapes";
import { toast } from "sonner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY_COLORS[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
      {p.icon} {p.label}
    </span>
  );
}

function ItemImage({ url, name }: { url?: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Gift className="w-8 h-8 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-full object-cover"
      onError={() => setErr(true)}
    />
  );
}

function ItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<WishlistItem>;
  onSave: (
  data: Omit<WishlistItem, "id" | "userId" | "groupId">
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [shopUrl, setShopUrl] = useState(initial?.shopUrl ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 2);
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {/////////////////////////////////////
  e.preventDefault();

  const data: Omit<WishlistItem, "id" | "userId" | "groupId"> = {
    name,
    priority,
  };

  if (desc) data.description = desc;
  if (imageUrl) data.imageUrl = imageUrl;
  if (shopUrl) data.shopUrl = shopUrl;
  if (price) data.price = Number(price);

  onSave(data);
}

  return (
    <form onSubmit={handleSubmit} className="bg-card border-2 border-primary/25 rounded-2xl p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Item name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sony WH-1000XM5 Headphones"
            required
            className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Image URL</label>
          <div className="relative">
            <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full pl-8 pr-3 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Shop link</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="url"
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              placeholder="https://amazon.com/…"
              className="w-full pl-8 pr-3 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Approximate price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="79.99"
              min="0"
              className="w-full pl-7 pr-3 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Priority</label>
          <div className="flex gap-2">
            {([1, 2, 3] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  priority === p
                    ? `${PRIORITY_COLORS[p].bg} ${PRIORITY_COLORS[p].text} border-current`
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {PRIORITY_COLORS[p].label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Description (optional)</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="The black one, not silver"
            className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          {initial?.name ? "Save changes" : "Add item"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── My Wishlist Tab ──────────────────────────────────────────────────────────

function MyWishlistTab({ group, userId }: { group: Group; userId: string }) {
  type WishlistViewItem = WishlistItem & {
  isClaimed: boolean;
  claimedByMe?: boolean;
};

const [items, setItems] = useState<WishlistViewItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
  const data = await getOwnerItemViews(
    userId,
    group.id
  );

  setItems(data);
}, [userId, group.id]);

  useEffect(() => {
  refresh();
}, [refresh]);

 async function handleAdd(////////////////////////////////////////////////
  data: Omit<WishlistItem, "id" | "userId" | "groupId">
) {
  await addItem({
    ...data,
    userId,
    groupId: group.id,
  });

  setShowAdd(false);
  toast.success("Item added!");
  refresh();
}


async function handleEdit(
  id: string,
  data: Omit<WishlistItem, "id" | "userId" | "groupId">
) {
  await updateItem(id, data);
  setEditId(null);
  toast.success("Item updated!");
  refresh();
}

async function handleDelete(id: string, name: string) {
  await deleteItem(id);
  toast.success(`"${name}" removed.`);
  refresh();
}

  const sorted = [...items].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-4">
      {/* Privacy notice */}
      <div className="bg-secondary/10 border border-secondary/25 rounded-2xl p-4 flex gap-3">
        <Lock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-secondary mb-0.5">Your list is private to you</p>
          <p className="text-xs text-muted-foreground">
            Others can see your items and claim them, but you'll only know something has been claimed — never by whom.
            This is enforced at the database level, not just the UI.
          </p>
        </div>
      </div>

      {/* Add button */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">
          {sorted.length} item{sorted.length !== 1 ? "s" : ""} on your list
        </h3>
        <button
          onClick={() => setShowAdd((p) => !p)}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </div>

      {showAdd && (
        <ItemForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      )}

      {sorted.length === 0 && !showAdd ? (
        <div className="text-center py-14 border-2 border-dashed border-border rounded-3xl">
          <Star className="w-10 h-10 text-accent mx-auto mb-3 opacity-60" />
          <p className="font-display text-lg font-bold text-foreground mb-1">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-4">Add items others can buy for you this Christmas!</p>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((item) =>
            editId === item.id ? (
              <div key={item.id} className="sm:col-span-2">
                <ItemForm
                  initial={item}
                  onSave={(data) => handleEdit(item.id, data)}
                  onCancel={() => setEditId(null)}
                />
              </div>
            ) : (
              <div
                key={item.id}
                className={`bg-card rounded-2xl border transition-all overflow-hidden ${
                  item.isClaimed ? "border-secondary/40 bg-secondary/5" : "border-border hover:border-primary/25"
                }`}
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-muted">
                    <ItemImage url={item.imageUrl} name={item.name} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0">
                        {!item.isClaimed && (
                          <button
                            onClick={() => setEditId(item.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={item.priority} />
                      {item.price && (
                        <span className="text-xs text-muted-foreground">${item.price}</span>
                      )}
                    </div>
                    {item.isClaimed && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-secondary font-bold">
                        <Check className="w-3 h-3" />
                        Claimed by someone ✨
                      </div>
                    )}
                    {item.shopUrl && (
                      <a
                        href={item.shopUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View item
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Browse Tab ───────────────────────────────────────────────────────────────

function BrowseTab({ group, viewer }: { group: Group; viewer: { id: string; name: string } }) {
  const [wishlists, setWishlists] = useState<
  Awaited<ReturnType<typeof getGroupWishlists>>
>([]);

const refresh = useCallback(async () => {
  const data = await getGroupWishlists(group.id, viewer.id);
  setWishlists(data);
}, [group.id, viewer.id]);

  useEffect(() => {
  refresh();
}, [refresh]);

  async function handleClaim(item: WishlistItem & { isClaimed: boolean; claimedByMe: boolean }) {
    if (item.isClaimed && !item.claimedByMe) {
      toast.error("Someone else already claimed this.");
      return;
    }
    if (item.claimedByMe) {
      await unclaimItem(item.id, viewer.id);
      toast.success("Claim released.");
    } else {
      await claimItem(item, viewer);
      toast.success("Claimed! It's a secret 🤫");
    }
    refresh();
  }

  const others = wishlists.filter((w) => w.items.length > 0);

  if (others.length === 0 && wishlists.length > 0) {
    return (
      <div className="text-center py-14">
        <Gift className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="font-display text-lg font-bold text-foreground mb-1">No wishlists yet</p>
        <p className="text-sm text-muted-foreground">Other members haven't added any items yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-accent/15 border border-accent/30 rounded-2xl p-4 flex gap-3">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Your claims are secret.</strong> Item owners will only see that something has been claimed — not by whom.
          You can unclaim any time before the exchange.
        </p>
      </div>

      {wishlists.map(({ member, items }) => (
        <div key={member.userId}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              {member.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">{member.name}'s wishlist</h3>
              <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic pl-13">No items yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...items].sort((a, b) => a.priority - b.priority).map((item) => (
                <div
                  key={item.id}
                  className={`bg-card rounded-2xl border overflow-hidden transition-all ${
                    item.isClaimed
                      ? item.claimedByMe
                        ? "border-secondary/50 ring-1 ring-secondary/30"
                        : "border-muted opacity-60"
                      : "border-border hover:border-primary/25 hover:shadow-sm"
                  }`}
                >
                  {/* Image */}
                  <div className="h-36 bg-muted">
                    <ItemImage url={item.imageUrl} name={item.name} />
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <PriorityBadge priority={item.priority} />
                      {item.price && (
                        <span className="text-xs text-muted-foreground font-semibold">${item.price}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.shopUrl && (
                        <a
                          href={item.shopUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Shop
                        </a>
                      )}

                      <button
                        onClick={() => handleClaim(item)}
                        disabled={item.isClaimed && !item.claimedByMe}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:cursor-not-allowed ${
                          item.claimedByMe
                            ? "bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25"
                            : item.isClaimed
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                        }`}
                      >
                        {item.claimedByMe ? (
                          <>
                            <Check className="w-3 h-3" />
                            Unclaim
                          </>
                        ) : item.isClaimed ? (
                          "Already claimed"
                        ) : (
                          <>
                            <Gift className="w-3 h-3" />
                            I'll get this!
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ group }: { group: Group }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-display text-base font-bold text-foreground mb-1">Invite more people</h3>
        <p className="text-sm text-muted-foreground mb-3">Share this link — anyone with it can join the group.</p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2.5 overflow-hidden">
            <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-foreground truncate">{inviteUrl}</span>
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              copied ? "bg-secondary text-white" : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Members list */}
      <div>
        <h3 className="font-display text-base font-bold text-foreground mb-3">
          {group.members.length} member{group.members.length !== 1 ? "s" : ""}
        </h3>
        <div className="space-y-2">
          {group.members.map((m) => (
            <div key={m.userId} className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {m.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              {m.userId === group.ownerId && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  Owner
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Group View ──────────────────────────────────────────────────────────

type Tab = "wishlist" | "browse" | "members";

export default function GroupView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [tab, setTab] = useState<Tab>("wishlist");
  const [notFound, setNotFound] = useState(false);

useEffect(() => {///////////////////////////////////////////////////////////////
  async function loadGroup() {
    if (!id) return;

    const g = await getGroupById(id);

    if (!g) {
      setNotFound(true);
      return;
    }

    setGroup(g);
  }

  loadGroup();
}, [id]);

  if (!user) return null;

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Group not found</h2>
        <p className="text-muted-foreground mb-6">This group doesn't exist or you don't have access.</p>
        <Link to="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!group) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "wishlist", label: "My Wishlist", icon: <Star className="w-4 h-4" /> },
    { id: "browse", label: "Browse", icon: <Gift className="w-4 h-4" /> },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground">{group.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {group.members.length} members
              </span>
              {group.budget && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent" />
                  ${group.budget} budget
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            {t.id === "browse" && (
              <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">
                {group.members.length - 1}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "wishlist" && <MyWishlistTab group={group} userId={user.id} />}
      {tab === "browse" && <BrowseTab group={group} viewer={{ id: user.id, name: user.name }} />}
      {tab === "members" && <MembersTab group={group} />}
    </div>
  );
}
