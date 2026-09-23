# PathHer AI - Vercel Deployment Guide

## The Problem: White Screen

Your app shows a white screen because **Vercel doesn't have your Firebase environment variables**. The app tries to initialize Firebase but fails silently, resulting in a blank page.

## The Solution: Add Environment Variables to Vercel

### Step 1: Go to Your Vercel Project

1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **pathher** project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add These Environment Variables

Copy these **exact variable names** and paste the values from your `.env` file:

| Variable Name | Value (from your .env file) |
|---------------|----------------------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAEMSElvvzU_zXA8I6DiFWrCqAa46WWqgE` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `path-her.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `path-her` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `path-her.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `509423391053` |
| `VITE_FIREBASE_APP_ID` | `1:509423391053:web:7e67ece70c9abd269a6704` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-9E56ER95GG` |
| `GROQ_API_KEY` | your Groq API key from console.groq.com (server-side only, no VITE_ prefix) |

**Important Notes:**
- All Firebase variables MUST have the `VITE_` prefix
- `GEMINI_API_KEY` should NOT have the `VITE_` prefix (it's server-side only)
- Make sure there are no extra spaces before or after the values

### Step 3: Select Environment

For each variable, select which environments it should be available in:
- ✅ **Production** (required)
- ✅ **Preview** (optional, but recommended)
- ✅ **Development** (optional)

### Step 4: Redeploy

After adding all variables:

1. Go to the **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Wait for the deployment to complete (usually 1-2 minutes)

### Step 5: Test Your Site

1. Visit your Vercel URL (e.g., `https://pathher.vercel.app`)
2. You should now see the landing page instead of a white screen
3. Open browser console (F12) to check for any remaining errors

## Still Having Issues?

### Check Browser Console

1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for red error messages
4. Common errors and fixes:

| Error | Solution |
|-------|----------|
| `Firebase: Error (auth/invalid-api-key)` | Double-check your `VITE_FIREBASE_API_KEY` value |
| `Firebase: Error (auth/project-not-found)` | Verify `VITE_FIREBASE_PROJECT_ID` is correct |
| `Cannot read properties of null` | Make sure ALL Firebase variables are set |
| `Network request failed` | Check your Firebase project is active |

### Verify Environment Variables

In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify all 8 variables are listed
3. Check that Firebase variables have the `VITE_` prefix
4. Ensure there are no typos in variable names

### Clear Vercel Cache

Sometimes Vercel caches old builds:
1. Go to **Settings** → **General**
2. Scroll to **Build & Development Settings**
3. Click **Clear Cache**
4. Redeploy

## Security Note

The Firebase API keys shown above are **safe to expose** in your frontend code. Firebase security is enforced through:
- Firestore Security Rules (in your Firebase console)
- Firebase Authentication (user must be signed in)
- Domain restrictions (you can restrict which domains can use your Firebase project)

However, the `GEMINI_API_KEY` should be kept private and only used server-side.

## Need More Help?

1. Check the [Vercel Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
2. Check the [Firebase Documentation](https://firebase.google.com/docs/web/setup)
3. Open an issue on GitHub with:
   - Screenshot of browser console errors
   - Screenshot of your Vercel environment variables (hide the values)
   - Description of what you see vs. what you expect
