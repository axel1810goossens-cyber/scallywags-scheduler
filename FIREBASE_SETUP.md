# Firebase Setup Guide for Scallywags Scheduler

## Why Firebase?

Firebase provides:
- **Real-time Database**: Automatic UI updates when data changes
- **Authentication**: Secure user login
- **Hosting**: Free hosting for your web app
- **No backend code needed**: Everything runs client-side

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "scallywags-scheduler"
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Services

#### Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (we'll secure it later)
4. Choose a location (closest to you)

#### Authentication
1. Go to "Authentication" → "Sign-in method"
2. Enable "Email/Password"
3. Click "Save"

### 3. Get Your Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon `</>`
4. Register app as "scallywags-scheduler-web"
5. Copy the `firebaseConfig` object

### 4. Add Config to Your App

1. Open `.env.local` in your project
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...your-actual-key
VITE_FIREBASE_AUTH_DOMAIN=scallywags-scheduler.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scallywags-scheduler
VITE_FIREBASE_STORAGE_BUCKET=scallywags-scheduler.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the App

```bash
npm run dev
```

## What Changes?

Once Firebase is configured:

✅ **Real-time updates**: Shifts appear immediately without refresh
✅ **Multi-user support**: Multiple managers can use the app simultaneously
✅ **Data persistence**: Data survives browser refresh
✅ **Secure authentication**: Real user accounts instead of mock login

## Security Rules (Important!)

After testing, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment (Optional)

To deploy to Firebase Hosting:

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

Your app will be live at: `https://scallywags-scheduler.web.app`

## Current State

Right now, your app works with **mock data** stored in browser memory. This is perfect for:
- Development
- Testing features
- Demos

But Firebase gives you:
- Real database
- Multi-device sync
- Production-ready infrastructure

## Need Help?

If you want me to help you set up Firebase, just share your Firebase config and I'll update the `.env.local` file for you!
