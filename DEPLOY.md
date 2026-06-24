# Deploying GiftList to Vercel

## One-time setup (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: migrate all data to Firestore"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework preset: **Vite**
4. Add environment variables (Settings → Environment Variables):

| Key | Value |
|-----|-------|
| `VITE_FIREBASE_API_KEY` | AIzaSyBeI9O3rmsP0COXLcCFfUWTgjMe-1_6Iwk |
| `VITE_FIREBASE_AUTH_DOMAIN` | giftlist-ffdf4.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | giftlist-ffdf4 |
| `VITE_FIREBASE_STORAGE_BUCKET` | giftlist-ffdf4.appspot.com |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 277763754001 |
| `VITE_FIREBASE_APP_ID` | 1:277763754001:web:8f910499dfcd96e7c6c9b0 |

5. Click **Deploy**

Every push to `main` auto-deploys from then on.

### 3. Add your Vercel URL to Firebase Auth
In the [Firebase Console](https://console.firebase.google.com):
- Authentication → Settings → Authorized domains
- Add your `*.vercel.app` URL

### 4. Set Firestore Security Rules
In Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read, write: if request.auth != null;
    }
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /claims/{claimId} {
      // Anyone in the group can read claims EXCEPT the item owner
      allow read: if request.auth != null
                  && request.auth.uid != resource.data.itemOwnerId;
      allow create: if request.auth != null
                    && request.auth.uid != request.resource.data.itemOwnerId;
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.claimedBy;
    }
  }
}
```

## Local dev
```bash
npm install
npm run dev
```
