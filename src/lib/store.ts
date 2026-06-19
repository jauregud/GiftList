import type { Group, WishlistItem, Claim, Member } from "./types";
import { getFirestoreDb } from "./firebase";
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

export async function getUserGroups(////////////////////////////////
  userId: string
): Promise<Group[]> {
  const db = await getFirestoreDb();

  const { collection, getDocs } =
    await import("firebase/firestore");

  const snapshot = await getDocs(
    collection(db, "groups")
  );

  const groups = snapshot.docs.map((doc) => ({
    ...(doc.data() as Group),
  }));

  return groups.filter(
    (g) =>
      g.ownerId === userId ||
      g.members.some((m) => m.userId === userId)
  );
}

export async function getGroupById(groupId: string): Promise<Group | null> { /////////////////////////
  const db = await getFirestoreDb();

  const { doc, getDoc } = await import("firebase/firestore");

  const snap = await getDoc(
    doc(db, "groups", groupId)
  );

  if (!snap.exists()) return null;

  return snap.data() as Group;
}

export async function createGroup(
  name: string,
  description: string,
  budget: number | undefined,
  owner: { id: string; name: string; email: string }
): Promise<Group> {
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

  const db = await getFirestoreDb();

  const { doc, setDoc } = await import("firebase/firestore");

  await setDoc(
    doc(db, "groups", group.id),
    group
  );

  return group;
}




export async function joinGroupByCode(
  code: string,
  joiner: {
    id: string;
    name: string;
    email: string;
  }
): Promise<Group | null> {

  const db = await getFirestoreDb();

  const {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
  } = await import("firebase/firestore");


  const q = query(
    collection(db, "groups"),
    where("inviteCode", "==", code)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const groupDoc = snapshot.docs[0];

  const group = groupDoc.data() as Group;

  if (group.members.some((m) => m.userId === joiner.id)) {
    return group;
  }

  const updatedMembers = [
    ...group.members,
    {
      userId: joiner.id,
      name: joiner.name,
      email: joiner.email,
    },
  ];

  await updateDoc(
    doc(db, "groups", groupDoc.id),
    {
      members: updatedMembers,
    }
  );

  return {
    ...group,
    members: updatedMembers,
  };
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
export async function getGroupWishlists(
  groupId: string,
  viewerId: string
): Promise<
  {
    member: Member;
    items: Array<
      WishlistItem & {
        isClaimed: boolean;
        claimedByMe: boolean;
        claimedByName?: string;
      }
    >;
  }[]
> {
  const group = await getGroupById(groupId);
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
