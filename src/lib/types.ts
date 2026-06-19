export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface Member {
  userId: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  inviteCode: string;
  budget?: number;
  members: Member[];
  createdAt: string;
}

export type Priority = 1 | 2 | 3;

export interface WishlistItem {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  shopUrl?: string;
  priority: Priority;
  price?: number;
}

// Claim is stored separately — item owner cannot read claimedBy
export interface Claim {
  id: string;
  itemId: string;
  claimedBy: string;
  claimedByName: string;
  groupId: string;
  itemOwnerId: string;
}

// What the owner sees: no claimedBy info
export interface OwnerItemView extends WishlistItem {
  isClaimed: boolean;
}

// What a browser sees: includes who claimed (if they claimed it)
export interface BrowserItemView extends WishlistItem {
  isClaimed: boolean;
  claimedByMe: boolean;
  claimedByName?: string; // only populated if claimedByMe or for display to non-owners
}
