# Firebase Deployment Guide

Complete guide to deploy Scallywags Scheduler to Firebase (Cloud Functions + Firestore + Hosting).

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project (free Spark plan is sufficient for development)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `scallywags-scheduler`
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

## Step 2: Enable Required Services

### Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we have custom rules)
4. Choose a location (e.g., `us-central1`)
5. Click **"Enable"**

### Enable Authentication (Optional but Recommended)

1. Go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable **Email/Password** sign-in method
4. Click **"Save"**

## Step 3: Firebase CLI Setup

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase Project

```bash
# From project root
firebase init
```

Select:
- [x] Firestore
- [x] Functions
- [x] Hosting

Configuration:
- **Firestore:** Use existing files (`firestore.rules`, `firestore.indexes.json`)
- **Functions:**
  - Language: JavaScript
  - ESLint: No
  - Install dependencies: Yes
  - Directory: `backend`
- **Hosting:**
  - Public directory: `dist`
  - Single-page app: Yes
  - GitHub auto-deploys: No

### Update Firebase Project ID

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

Replace `your-actual-project-id` with your Firebase project ID from console.

## Step 4: Get Service Account Key (Local Development)

1. Firebase Console → **Project Settings** (gear icon)
2. Go to **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. Save as `backend/config/serviceAccountKey.json`

⚠️ **NEVER commit this file to Git!** (already in `.gitignore`)

## Step 5: Configure Environment Variables

### For Local Development

Create `backend/.env`:
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
ADMIN_EMAIL=admin@scallywags.com
ADMIN_PASSWORD=ChangeThisPassword123!
ADMIN_NAME=Admin Manager
FRONTEND_URL=http://localhost:5173
```

### For Cloud Functions

Set environment variables for production:
```bash
firebase functions:config:set \
  jwt.secret="your-super-secret-jwt-key-change-this" \
  admin.email="admin@scallywags.com" \
  admin.password="ChangeThisPassword123!" \
  admin.name="Admin Manager"
```

## Step 6: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies (if not already done)
cd ..
npm install
```

## Step 7: Initialize Database

Run the initialization script locally to create admin user and settings:

```bash
cd backend
npm run init-db
```

You should see:
```
✅ Admin user created successfully
   Email: admin@scallywags.com
   Password: ChangeThisPassword123!
```

## Step 8: Test Locally

### Start Local Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:3001`

### Test API

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scallywags.com","password":"ChangeThisPassword123!"}'
```

### Test with Firebase Emulators (Optional)

```bash
firebase emulators:start
```

This runs:
- Functions emulator: `http://localhost:5001`
- Firestore emulator: `http://localhost:8080`
- Hosting emulator: `http://localhost:5000`

## Step 9: Deploy to Firebase

### Build Frontend

```bash
npm run build
```

### Deploy Everything

```bash
# Deploy Firestore rules, Cloud Functions, and Hosting
firebase deploy
```

Or deploy individually:
```bash
firebase deploy --only firestore        # Just Firestore rules
firebase deploy --only functions        # Just Cloud Functions
firebase deploy --only hosting          # Just frontend
```

### Deployment Output

After successful deployment, you'll get URLs:
```
✔ Deploy complete!

Functions:
  api (Cloud Function): https://us-central1-your-project.cloudfunctions.net/api

Hosting:
  https://your-project.web.app
  https://your-project.firebaseapp.com
```

## Step 10: Update Frontend Configuration

Update `src/services/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};
```

Get these values from:
Firebase Console → Project Settings → General → Your apps → Web app

## Step 11: Configure API Endpoint

Create `src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://us-central1-your-project.cloudfunctions.net/api'
  : 'http://localhost:3001/api';

export default API_BASE_URL;
```

## Testing Your Deployment

### Test Cloud Function Endpoint

```bash
# Replace with your actual Cloud Function URL
curl https://us-central1-your-project.cloudfunctions.net/api/health
```

### Test Login

```bash
curl -X POST https://us-central1-your-project.cloudfunctions.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scallywags.com","password":"ChangeThisPassword123!"}'
```

### Test Frontend

Visit your hosting URL: `https://your-project.web.app`

## Firebase Console URLs

- **Project Overview:** https://console.firebase.google.com/project/your-project/overview
- **Firestore Database:** https://console.firebase.google.com/project/your-project/firestore
- **Functions:** https://console.firebase.google.com/project/your-project/functions
- **Hosting:** https://console.firebase.google.com/project/your-project/hosting
- **Authentication:** https://console.firebase.google.com/project/your-project/authentication

## Common Commands

```bash
# Check deployment status
firebase projects:list

# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api

# Delete a function
firebase functions:delete api

# Serve locally with emulators
firebase emulators:start

# Deploy with specific region
firebase deploy --only functions --region us-central1
```

## Pricing Notes

Firebase Spark (Free) Plan includes:
- ✅ 125K function invocations/month
- ✅ 10 GB hosting storage
- ✅ 360 MB/day hosting transfer
- ✅ 50K Firestore reads/day
- ✅ 20K Firestore writes/day

This is sufficient for development and small production deployments.

## Troubleshooting

### Functions deployment fails
- Check Node.js version (must be 18)
- Ensure all dependencies are in `backend/package.json`
- Check function logs: `firebase functions:log`

### CORS errors
- Cloud Functions automatically handle CORS with `cors({ origin: true })`
- For specific origins, update `backend/index.js`

### Authentication errors
- Verify JWT_SECRET is set in Cloud Functions config
- Check token format: `Bearer <token>`
- Token expires after 24 hours

### Firestore permission denied
- Check `firestore.rules` are deployed
- Verify user is authenticated
- Check admin role in Firestore console

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET in production
- [ ] Enable Firebase App Check (optional)
- [ ] Review Firestore security rules
- [ ] Enable HTTPS only
- [ ] Set up billing alerts
- [ ] Enable audit logging

## Next Steps

1. ✅ Deploy backend to Cloud Functions
2. ✅ Deploy frontend to Firebase Hosting
3. Update frontend to use Cloud Function API
4. Test all endpoints in production
5. Set up CI/CD with GitHub Actions (optional)
6. Monitor usage in Firebase Console

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Cloud Functions: https://firebase.google.com/docs/functions
- Firestore: https://firebase.google.com/docs/firestore
- Hosting: https://firebase.google.com/docs/hosting
