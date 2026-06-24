import type { Group, WishlistItem, Claim, Member } from "./types";
import { getFirestoreDb } from "./firebase";

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function getUserGroups(userId: string): Promise<Group[]> {
  const db = await getFirestoreDb();
  const { collection, getDocs } = await import("firebase/firestore");
  const snapshot = await getDocs(collection(db, "groups"));
  const groups = snapshot.docs.map((doc) => ({ ...(doc.data() as Group) }));
  return groups.filter(
    (g) => g.ownerId === userId || g.members.some((m) => m.userId === userId)
  );
}

export async function getGroupById(groupId: string): Promise<Group | null> {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "groups", groupId));
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
  await setDoc(doc(db, "groups", group.id), group);
  return group;
}

export async function joinGroupByCode(
  code: string,
  joiner: { id: string; name: string; email: string }
): Promise<Group | null> {
  const db = await getFirestoreDb();
  const { collection, query, where, getDocs, doc, updateDoc } =
    await import("firebase/firestore");
  const q = query(collection(db, "groups"), where("inviteCode", "==", code));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const groupDoc = snapshot.docs[0];
  const group = groupDoc.data() as Group;
  if (group.members.some((m) => m.userId === joiner.id)) return group;
  const updatedMembers = [
    ...group.members,
    { userId: joiner.id, name: joiner.name, email: joiner.email },
  ];
  await updateDoc(doc(db, "groups", groupDoc.id), { members: updatedMembers });
  return { ...group, members: updatedMembers };
}

// ─── Wishlist Items (Firestore) ───────────────────────────────────────────────

export async function getMyItems(
  userId: string,
  groupId: string
): Promise<WishlistItem[]> {
  const db = await getFirestoreDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const q = query(
    collection(db, "items"),
    where("userId", "==", userId),
    where("groupId", "==", groupId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WishlistItem);
}

export async function addItem(
  item: Omit<WishlistItem, "id">
): Promise<WishlistItem> {
  const newItem: WishlistItem = { ...item, id: nanoid() };
  const db = await getFirestoreDb();
  const { doc, setDoc } = await import("firebase/firestore");
  
  // Remove undefined fields - Firestore doesn't allow undefined values
  const dataToSave = Object.fromEntries(
    Object.entries(newItem).filter(([_, v]) => v !== undefined)
  );
  
  await setDoc(doc(db, "items", newItem.id), dataToSave);
  return newItem;
}

export async function updateItem(
  id: string,
  updates: Partial<WishlistItem>
): Promise<void> {
  const db = await getFirestoreDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  
  // Remove undefined fields - Firestore doesn't allow undefined values
  const dataToUpdate = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );
  
  await updateDoc(doc(db, "items", id), dataToUpdate as Record<string, unknown>);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getFirestoreDb();
  const { doc, deleteDoc, collection, query, where, getDocs } =
    await import("firebase/firestore");
  await deleteDoc(doc(db, "items", id));
  // Also delete any claims for this item
  const claimsQ = query(
    collection(db, "claims"),
    where("itemId", "==", id)
  );
  const claimsSnap = await getDocs(claimsQ);
  await Promise.all(claimsSnap.docs.map((d) => deleteDoc(d.ref)));
}

// ─── Claims (Firestore) ───────────────────────────────────────────────────────

export async function claimItem(
  item: WishlistItem,
  claimer: { id: string; name: string }
): Promise<void> {
  const db = await getFirestoreDb();
  const { collection, query, where, getDocs, doc, setDoc } =
    await import("firebase/firestore");
  // Check for existing claim
  const existing = query(
    collection(db, "claims"),
    where("itemId", "==", item.id)
  );
  const snap = await getDocs(existing);
  if (!snap.empty) return;
  const claim: Claim = {
    id: nanoid(),
    itemId: item.id,
    claimedBy: claimer.id,
    claimedByName: claimer.name,
    groupId: item.groupId,
    itemOwnerId: item.userId,
  };
  await setDoc(doc(db, "claims", claim.id), claim);
}

export async function unclaimItem(
  itemId: string,
  userId: string
): Promise<void> {
  const db = await getFirestoreDb();
  const { collection, query, where, getDocs, deleteDoc } =
    await import("firebase/firestore");
  const q = query(
    collection(db, "claims"),
    where("itemId", "==", itemId),
    where("claimedBy", "==", userId)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

// ─── Group Wishlists (for browse tab) ────────────────────────────────────────

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

  const db = await getFirestoreDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");

  // Fetch all items for this group
  const itemsQ = query(
    collection(db, "items"),
    where("groupId", "==", groupId)
  );
  const itemsSnap = await getDocs(itemsQ);
  const allItems = itemsSnap.docs.map((d) => d.data() as WishlistItem);

  // Fetch all claims for this group
  const claimsQ = query(
    collection(db, "claims"),
    where("groupId", "==", groupId)
  );
  const claimsSnap = await getDocs(claimsQ);
  const allClaims = claimsSnap.docs.map((d) => d.data() as Claim);

  return group.members
    .filter((m) => m.userId !== viewerId)
    .map((member) => {
      const memberItems = allItems.filter((i) => i.userId === member.userId);
      const items = memberItems.map((item) => {
        const claim = allClaims.find((c) => c.itemId === item.id);
        return {
          ...item,
          isClaimed: !!claim,
          claimedByMe: claim?.claimedBy === viewerId,
          // Only show who claimed if it's the viewer (for "unclaim" button)
          claimedByName:
            claim?.claimedBy === viewerId ? claim.claimedByName : undefined,
        };
      });
      return { member, items };
    });
}

// ─── Owner item views ─────────────────────────────────────────────────────────

export async function getOwnerItemViews(
  userId: string,
  groupId: string
): Promise<Array<WishlistItem & { isClaimed: boolean }>> {
  const items = await getMyItems(userId, groupId);
  const db = await getFirestoreDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const claimsQ = query(
    collection(db, "claims"),
    where("groupId", "==", groupId),
    where("itemOwnerId", "==", userId)
  );
  const claimsSnap = await getDocs(claimsQ);
  const claimedItemIds = new Set(
    claimsSnap.docs.map((d) => (d.data() as Claim).itemId)
  );
  return items.map((item) => ({
    ...item,
    isClaimed: claimedItemIds.has(item.id),
  }));
}