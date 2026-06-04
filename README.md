# CIS 350 Project

##  GiftList — Gift Exchange Web App

---

## Made by

### Dan Jauregui, Gabe Rowell

---

## Important Links
LucidChart Diagrams - https://lucid.app/lucidchart/86c66f15-f086-40fd-9e13-954487fd6dd2/edit?beaconFlowId=693C219668540326&invitationId=inv_d87975cb-13cc-4b97-bfd5-43dd285a0dd5&page=0_0#
Figma UI - https://www.figma.com/design/63faLuDJad4PZ2VO0HwPWU/CIS350-Project-UI?node-id=0-1&p=f&t=o0PSfmQVKbfnbpQA-0

---

## 1. Abstract

Gift-giving during the holiday season is one of the most meaningful traditions shared among families and friends. However, the process of coordinating Christmas exchanges is often plagued by duplicate purchases, poor communication, and ruined surprises. People either make themselves too easy to shop for by revealing what they already received, or too difficult to shop for by providing no guidance at all.

**GiftList** is a web application that solves this problem by allowing users to create Christmas exchange groups, build personal wishlists with item images and direct shopping links, and set priority rankings for their most-wanted gifts. Other group members can browse each person's list and "claim" an item to indicate they will be purchasing it — critically, the list owner is never shown who claimed any of their items, preserving the element of surprise. The system enforces this privacy guarantee at the database security level, not just the UI, so it cannot be bypassed.

---

## 2. Introduction

**GiftList** is a browser-based web application accessible on any device including phones, tablets, and desktops. Users log in with their Google account, create or join a Christmas exchange group using a shareable invite link, and begin building their wishlist immediately. Each wishlist item can include a name, a product image, a direct URL to the item on any shopping site (Amazon, eBay, Target, etc.), and a priority number indicating how much the user wants that gift.

Once a wishlist is published to the group, other members can view it and claim items. A claimed item is visually marked as taken so no one else buys a duplicate. The list owner sees the same view as everyone else — they can see their items are claimed, but the identity of the claimer is hidden from them entirely. This design preserves the joy of receiving a gift as a surprise while eliminating the frustration of duplicates.

The application is built with **React** on the frontend and **Firebase** (Firestore, Authentication, Storage) as the backend, requiring no traditional server infrastructure. It is deployed as a static site on **Vercel** and is accessible via any modern web browser without installation.

---

## 3. Architectural Design

**GiftList** uses a client-server architecture where the client is a React single-page application and the server layer is provided entirely by Google Firebase managed services. There is no custom backend server to maintain or deploy. All business logic that cannot live on the client (such as privacy enforcement on claimed items) is handled by Firestore's server-side security rules.

![Architecture Diagram] *place png*
*Figure 1: System Architecture — React Client + Firebase Backend + Vercel Hosting*

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend UI | React 18 + Vite | Component-based UI, routing, state management |
| Styling | Tailwind CSS | Utility-first responsive styling |
| Authentication | Firebase Auth (Google Sign-In) | User identity and session management |
| Database | Cloud Firestore | Real-time NoSQL document database |
| File Storage | Firebase Storage | Gift item image uploads |
| Hosting | Vercel | Static site deployment from GitHub |
| Version Control | Git + GitHub | Source control and project repository |
| Project Mgmt | JIRA | Sprint planning and issue tracking |

### Firestore Collection Structure

```
/users/{userId}
    displayName, email, photoURL

/groups/{groupId}
    name, createdBy, members[], inviteCode, createdAt

/groups/{groupId}/wishlists/{userId}
    ownerName, ownerPhoto
    items: [{ id, name, imageUrl, shopUrl, priority, addedAt }]

/groups/{groupId}/claims/{claimId}
    itemId, itemOwnerId, claimedBy (userId), claimedAt
```

The `claims` subcollection is the core of the privacy system. Firestore security rules block any read where `request.auth.uid == resource.data.itemOwnerId`, meaning a user can never retrieve claim documents on their own items regardless of what the client-side code does.

---

### 3.1 Class Diagram

The class diagram below describes the primary data models and their relationships within the GiftList system.

![Class Diagram]*place png*
*Figure 2: Class Diagram*

Key classes include `User`, `Group`, `Wishlist`, `WishlistItem`, and `Claim`. The `FirestoreService` class acts as the data access layer, and `AuthService` handles user authentication. UI boundary classes (`GroupDashboardPage`, `MyListPage`, `LoginPage`) interact with services directly.

---

### 3.2 Use Case Diagram

The use case diagram captures all meaningful interactions a user can perform within GiftList.

![Use Case Diagram]*place png*
*Figure 3: Use Case Diagram*

Primary use cases include: Register / Sign In, Create Exchange Group, Invite Members via Link, Join Group via Invite Link, Add Wishlist Item, Set Item Priority, Upload Item Image, Add Item URL, View Group Members' Lists, Claim a Gift Item, and View Claimed Status (without claimer identity for list owner).

---

### 3.3 Sequence Diagrams

Three core user flows are represented as sequence diagrams.

![Sequence Diagram — Add Wishlist Item]*place png*
*Figure 4: Sequence Diagram — Adding a Wishlist Item*

![Sequence Diagram — Claim a Gift]*place png*
*Figure 5: Sequence Diagram — Claiming a Gift Item*

![Sequence Diagram — Join Group]*place png* 
*Figure 6: Sequence Diagram — Joining a Group via Invite Link*

---

### 3.4 Communication Diagrams

Communication diagrams show the same interactions as the sequence diagrams above but illustrate the object relationships horizontally, emphasizing which components exchange messages.

![Communication Diagram — Add Wishlist Item]*place png*
*Figure 7: Communication Diagram — Adding a Wishlist Item*

![Communication Diagram — Claim a Gift]*place png*
*Figure 8: Communication Diagram — Claiming a Gift Item*

![Communication Diagram — Join Group]*place png* 
*Figure 9: Communication Diagram — Joining a Group via Invite Link*

---

## 4. User Guide / Implementation

### 4.1 Login Page

When the user first visits GiftList they are presented with a login screen. Clicking "Sign in with Google" opens the standard Google OAuth popup. After authentication the user is redirected to the Group Dashboard.

![Login Page]*place png* 
*Figure 10: Login / Landing Page*

### 4.2 Group Dashboard

After logging in, the user sees all groups they belong to. From here they can create a new group or select an existing one.

![Group Dashboard]*place png* 
*Figure 11: Group Dashboard*

**Creating a group** prompts the user to enter a group name. Upon creation, a unique invite code is generated and a shareable link is displayed that can be copied and sent to family or friends.

### 4.3 My List (Wishlist Editor)

Each user has a personal wishlist within each group. On the My List page, users can add, reorder, and delete items.

![My List Page]*place png* 
*Figure 12: My Wishlist Page*

**Adding an item** opens a form with fields for item name, shopping URL, image upload, and priority number. Items are displayed sorted by priority. The drag-to-reorder handle lets users reorganize their list by dragging items up or down.

**What the owner sees for claimed items:** The item shows a "Claimed" badge, but no claimer name is shown. This is enforced at the Firestore security rule level.

### 4.4 Viewing Group Members' Lists

Selecting another member from the group shows their wishlist. Items display the priority badge, shopping link, and image. Unclaimed items show a "Claim" button. Claimed items show a "Claimed" badge.

![Member List View]*place png*
*Figure 13: Viewing Another Member's Wishlist*

Clicking "Claim" writes a document to the `claims` subcollection with the claimer's UID and item details. The button is immediately disabled to prevent double-claiming.

---

## 5. Risk Analysis and Retrospective

The biggest architectural risk in GiftList is the privacy guarantee — the entire value proposition depends on list owners never seeing who claimed their items. Early in the design phase, a client-only solution (hiding the claimer name in the UI) was considered and rejected. A determined user could inspect network responses and see claim data. The decision was made to enforce the rule in Firestore security rules at the server level, which is not bypassable by any client-side manipulation.

A second risk was image upload and storage costs. Firebase Storage's free tier (5 GB) is more than sufficient for a holiday app with a small group, but image size limits were added on the upload form (2 MB max) to prevent accidental abuse.

A third consideration was invite link security. Invite codes are randomly generated 8-character strings stored with the group. Anyone with the link can join, which is the intended behavior for a family exchange, but it means the link should not be posted publicly.

**Future improvements:**
- Push notifications when someone claims an item on your list
- A "thank you" note system post-Christmas
- Budget tracking so gift buyers can see if they're in range
- Support for multiple exchange groups per season with different budgets

---

## 6. Conclusion

GiftList provides a clean, focused solution to the perennial problem of Christmas gift coordination. It eliminates duplicate purchases, respects the tradition of surprise, and is accessible to any family member with a smartphone and a Google account — no app installation required. The core security design ensures the privacy guarantee is ironclad, and the priority system makes shopping intuitive for givers. The five-week development timeline was achievable because Firebase handles all backend infrastructure, allowing full focus on the product experience.

---

## 7. Walkthrough

[Video Demo — Coming Soon]
