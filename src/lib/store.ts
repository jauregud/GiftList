import type { Group, WishlistItem, Claim, Member } from "./types";

const GROUPS_KEY = "giftlist_groups";
const ITEMS_KEY = "giftlist_items";
const CLAIMS_KEY = "giftlist_claims";

function getGroups(): Group[] {
  try {
    return JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setGroups(groups: Group[]): void {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function getItems(): WishlistItem[] {
  try {
    return JSON.parse(localStorage.getItem(ITEMS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setItems(items: WishlistItem[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function getClaims(): Claim[] {
  try {
    return JSON.parse(localStorage.getItem(CLAIMS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setClaims(claims: Claim[]): void {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export function getUserGroups(userId: string): Group[] {
  return getGroups().filter(
    (g) => g.ownerId === userId || g.members.some((m) => m.userId === userId)
  );
}

export function getGroupById(groupId: string): Group | null {
  return getGroups().find((g) => g.id === groupId) ?? null;
}

export function createGroup(
  name: string,
  description: string,
  budget: number | undefined,
  owner: { id: string; name: string; email: string }
): Group {
  const group: Group = {
    id: nanoid(),
    name,
    description,
    ownerId: owner.id,
    ownerName: owner.name,
    inviteCode: nanoid(),
    budget,
    members: [{ userId: owner.id, name: owner.name, email: owner.email }],
    createdAt: new Date().toISOString(),
  };
  setGroups([...getGroups(), group]);
  return group;
}

export function joinGroupByCode(
  code: string,
  joiner: { id: string; name: string; email: string }
): Group | null {
  const groups = getGroups();
  const idx = groups.findIndex((g) => g.inviteCode === code);
  if (idx === -1) return null;
  const group = groups[idx];
  if (group.members.some((m) => m.userId === joiner.id)) return group;
  const member: Member = { userId: joiner.id, name: joiner.name, email: joiner.email };
  const updated = { ...group, members: [...group.members, member] };
  groups[idx] = updated;
  setGroups(groups);
  return updated;
}

// ─── Wishlist Items ───────────────────────────────────────────────────────────

export function getMyItems(userId: string, groupId: string): WishlistItem[] {
  return getItems().filter((i) => i.userId === userId && i.groupId === groupId);
}

export function addItem(item: Omit<WishlistItem, "id">): WishlistItem {
  const newItem: WishlistItem = { ...item, id: nanoid() };
  setItems([...getItems(), newItem]);
  return newItem;
}

export function updateItem(id: string, updates: Partial<WishlistItem>): void {
  setItems(getItems().map((i) => (i.id === id ? { ...i, ...updates } : i)));
}

export function deleteItem(id: string): void {
  setItems(getItems().filter((i) => i.id !== id));
  setClaims(getClaims().filter((c) => c.itemId !== id));
}

// ─── Claims (privacy layer) ───────────────────────────────────────────────────
//
// Firestore Security Rules (for production):
//   - Claims cannot be read by the item owner (itemOwnerId field checked server-side)
//   - Only authenticated group members can create claims
//   - Only the claimer can delete their own claim
//
// In this localStorage demo, privacy is enforced in the query layer below.

export function claimItem(
  item: WishlistItem,
  claimer: { id: string; name: string }
): void {
  const claims = getClaims();
  const existing = claims.find((c) => c.itemId === item.id);
  if (existing) return;
  const claim: Claim = {
    id: nanoid(),
    itemId: item.id,
    claimedBy: claimer.id,
    claimedByName: claimer.name,
    groupId: item.groupId,
    itemOwnerId: item.userId,
  };
  setClaims([...claims, claim]);
}

export function unclaimItem(itemId: string, userId: string): void {
  setClaims(getClaims().filter((c) => !(c.itemId === itemId && c.claimedBy === userId)));
}

// Returns group members' items visible to a browser (not their own),
// with claim info. The item owner NEVER sees claimedBy.
export function getGroupWishlists(
  groupId: string,
  viewerId: string
): { member: Member; items: Array<WishlistItem & { isClaimed: boolean; claimedByMe: boolean; claimedByName?: string }> }[] {
  const group = getGroupById(groupId);
  if (!group) return [];
  const allItems = getItems().filter((i) => i.groupId === groupId);
  const allClaims = getClaims().filter((c) => c.groupId === groupId);

  return group.members
    .filter((m) => m.userId !== viewerId) // exclude viewer's own list
    .map((member) => {
      const memberItems = allItems.filter((i) => i.userId === member.userId);
      const items = memberItems.map((item) => {
        const claim = allClaims.find((c) => c.itemId === item.id);
        return {
          ...item,
          isClaimed: !!claim,
          claimedByMe: claim?.claimedBy === viewerId,
          claimedByName: claim ? claim.claimedByName : undefined,
        };
      });
      return { member, items };
    });
}

// Returns owner view — only boolean isClaimed, no claimedBy (privacy enforced)
export function getOwnerItemViews(
  userId: string,
  groupId: string
): Array<WishlistItem & { isClaimed: boolean }> {
  const items = getMyItems(userId, groupId);
  const claims = getClaims();
  return items.map((item) => ({
    ...item,
    isClaimed: claims.some((c) => c.itemId === item.id),
  }));
}
