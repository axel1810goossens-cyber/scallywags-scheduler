# CI/CD Pipeline Setup Instructions

This repository has GitHub Actions workflows configured for automatic deployment to Firebase.

## Required GitHub Secrets

The repository owner needs to add these secrets before the workflows will function:

### 1. FIREBASE_SERVICE_ACCOUNT

**What it is:** Service account JSON key for Firebase deployment

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `scallywags-scheduler-dev`
3. Click ⚙️ → **Project settings** → **Service accounts** tab
4. Click **Generate new private key** button
5. Confirm and download the JSON file
6. Open the JSON file and copy its entire contents

**How to add it:**
1. Go to GitHub repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `FIREBASE_SERVICE_ACCOUNT`
4. Value: Paste the entire JSON content
5. Click **Add secret**

### 2. FIREBASE_TOKEN

**What it is:** CI authentication token for Firebase CLI

**How to generate it:**

Run this command in your terminal (requires Firebase CLI):
```bash
firebase login:ci
```

This will:
- Open a browser for authentication
- Generate a CI token
- Display the token in your terminal

Copy the token that's displayed.

**How to add it:**
1. Go to GitHub repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `FIREBASE_TOKEN`
4. Value: Paste the token
5. Click **Add secret**

## Workflows Included

### 1. firebase-deploy.yml
**Triggers:** Push to main branch, PRs to main
**Actions:**
- Installs dependencies (frontend + backend)
- Builds the frontend application
- Runs tests if available
- Deploys to Firebase Hosting (production)
- Deploys Cloud Functions (production)

### 2. preview-deploy.yml
**Triggers:** Pull requests opened/updated
**Actions:**
- Builds the frontend
- Creates a temporary preview deployment
- Posts preview URL as a comment on the PR
- Preview expires in 7 days

## Verifying Setup

After adding both secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see:
   - ✅ FIREBASE_SERVICE_ACCOUNT
   - ✅ FIREBASE_TOKEN

3. Check the **Actions** tab - workflows should be enabled

## Testing the Pipeline

### Option 1: Direct push to main
```bash
git add .github/
git commit -m "ci: Add GitHub Actions workflows"
git push origin main
```

### Option 2: Via pull request (recommended)
```bash
git checkout -b add-ci-cd
git add .github/
git commit -m "ci: Add GitHub Actions workflows"
git push origin add-ci-cd
```
Then create a PR on GitHub to see the preview deployment in action.

## Monitoring Deployments

1. Go to the **Actions** tab in your GitHub repository
2. Click on any workflow run to see detailed logs
3. Each step shows its status and output

## Deployment URLs

- **Production:** https://scallywags-scheduler-dev.web.app
- **API:** https://us-central1-scallywags-scheduler-dev.cloudfunctions.net/api
- **Preview:** Posted as comment on PRs

## Troubleshooting

**Build fails:**
- Check the Actions logs for specific error messages
- Ensure `npm run build` works locally
- Verify all dependencies are in package.json

**Authentication errors:**
- Verify FIREBASE_SERVICE_ACCOUNT contains valid JSON
- Regenerate FIREBASE_TOKEN if expired
- Check service account has proper Firebase permissions

**Function deployment fails:**
- Ensure JWT_SECRET is set in Firebase: `firebase functions:secrets:set JWT_SECRET`
- Check Cloud Functions quota on Firebase console
- Verify project is on Blaze plan

## Security Notes

- Secrets are encrypted by GitHub
- They're only exposed to workflow runs
- Never commit tokens or service account files to the repository
- The .gitignore file excludes sensitive files automatically

## Future Enhancements

Consider adding:
- Linting checks before deployment
- Unit and integration tests
- Branch protection rules requiring checks to pass
- Staging environment deployments
- Automated rollback on failure
