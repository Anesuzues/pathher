<div align="center">
<img width="1200" height="475" alt="PathHer AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# PathHer AI

**Career guidance for young South African women — discover your path, build your brand, unlock real opportunities.**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-ffca28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev)

</div>

---

## What is PathHer AI?

PathHer AI is a web app that helps young South African women navigate the job market. Users complete a short onboarding quiz about their interests, strengths, and goals. The app then recommends career paths matched to their profile, generates a professional CV and LinkedIn bio, and surfaces real bursaries, learnerships, and job opportunities in South Africa.

---

## Features

| Area | Description |
|---|---|
| **Career Matching** | Keyword-scoring algorithm ranks four high-growth SA career paths against the user's profile — no AI API required |
| **Personal Branding** | Two-variation CV summary and LinkedIn bio generator; copy to clipboard, print as PDF, or export as Word |
| **Learning & Funding** | Searchable, filterable list of bursaries, learnerships, internships, and graduate programs + curated online courses |
| **Talent Network** | Join the Nobztech talent network, request mentorship, browse hiring partners |
| **Recruiter Dashboard** | Post roles, track talent stats with bar/pie charts, search candidates, export CSV reports |
| **Authentication** | Email/password and Google OAuth via Firebase Authentication |
| **Cloud Sync** | Profile, saved items, mentor requests, and roles persist to Firestore; localStorage used as offline fallback |
| **Breathing Reset** | 30-second guided breathing exercise modal on the landing page |
| **Fully Responsive** | Mobile-first design tested from 320px to 1920px; collapsing sidebar navigation on desktop |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript 5.8 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Animations | Framer Motion (`motion/react`) |
| Icons | Lucide React |
| Charts | Recharts |
| Auth & Database | Firebase Authentication + Cloud Firestore |
| Utilities | `clsx` + `tailwind-merge` via `cn()` helper |

---

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx         # Global auth state; onAuthStateChanged listener
├── lib/
│   ├── firebase.ts             # Firebase app init, auth, db, googleProvider exports
│   ├── userdata.ts             # Firestore helpers (loadUserField, saveUserField,
│   │                           #   saveMentorRequest, saveRole, loadUserRoles, closeRole)
│   └── utils.ts                # cn() Tailwind class merger
├── pages/
│   ├── LandingPage.tsx         # Hero, benefits, SA context, breathing modal, footer
│   ├── AuthPage.tsx            # Sign-in / sign-up (email + Google)
│   ├── OnboardingPage.tsx      # 6-step profile wizard
│   ├── RecommendationsPage.tsx # Scored career path cards with save & share
│   ├── OpportunitiesPage.tsx   # Searchable opportunities + recommended courses
│   ├── BrandingPage.tsx        # CV & LinkedIn bio generator with export actions
│   ├── EcosystemPage.tsx       # Talent network, hiring partners, mentor request modal
│   └── DashboardPage.tsx       # Recruiter dashboard: charts, talent table, role posting
├── constants.ts                # CAREER_PATHS and OPPORTUNITIES static data
├── types.ts                    # Shared TypeScript interfaces
├── App.tsx                     # Router, collapsing sidebar nav, PrivateRoute, AppShell
├── index.css                   # Tailwind base, custom theme tokens, overflow protection
└── main.tsx                    # React root mount point
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Firebase project (see [Firebase Setup](#firebase-setup))

### Install & run

```bash
git clone https://github.com/FSkateP/PathHer-AI.git
cd PathHer-AI
npm install
npm run dev
```

The app starts at **http://localhost:3000**.

### Other scripts

```bash
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # TypeScript type-check (no emit)
```

---

## Firebase Setup

The app needs a Firebase project with **Authentication** and **Firestore** enabled.

### 1. Create a Firebase project

Go to [console.firebase.google.com](https://console.firebase.google.com), create a project, and register a **Web app**.

### 2. Enable Authentication providers

**Firebase console → Authentication → Sign-in method**, enable:
- Email/Password
- Google

### 3. Enable Firestore

**Firebase console → Firestore Database → Create database**.
Use **test mode** for development, then apply the rules below before going to production.

### 4. Add your config

Create a `.env` file in the root directory with your Firebase credentials:

```env
# Gemini AI (server-side only)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase (client-side - VITE_ prefix required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: All Firebase variables must have the `VITE_` prefix to be accessible in the browser.

### 5. Firestore security rules

Apply these rules in **Firestore → Rules** before going live:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Any authenticated user can submit or read mentor requests
    match /mentorRequests/{docId} {
      allow create, read: if request.auth != null;
    }

    // Any authenticated user can post and read roles;
    // only the poster can update (e.g. close) their own role
    match /roles/{docId} {
      allow create, read: if request.auth != null;
      allow update: if request.auth != null
        && request.auth.uid == resource.data.postedBy;
    }
  }
}
```

---

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. **Add environment variables** in the Vercel dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `GEMINI_API_KEY` (without VITE_ prefix)
5. Click "Deploy"

### Troubleshooting Deployment

**White screen after deployment?**
1. Open browser console (F12) to check for errors
2. Verify all environment variables are set in Vercel dashboard
3. Ensure Firebase variables have the `VITE_` prefix
4. Redeploy after adding/updating environment variables

**Firebase initialization errors?**
1. Check that your Firebase project is active
2. Verify Firestore database is created
3. Ensure Firebase Authentication is enabled (Email/Password + Google)
4. Apply the Firestore security rules shown above

---

## Data Model

### Firestore

```
users/{uid}
  profile: {
    fullName:    string
    email:       string
    education:   string
    interests:   string[]
    strengths:   string[]
    goals:       string[]
    workStyle:   string[]
  }
  savedRecommendations: string[]   // career path IDs
  savedOpportunities:   string[]   // opportunity IDs
  joinedNetwork:        boolean

mentorRequests/{docId}
  userId:    string
  userName:  string
  field:     string
  message:   string
  createdAt: Timestamp
  status:    'pending' | 'matched'

roles/{docId}
  title:         string
  type:          string
  postedBy:      string   // uid
  postedByName:  string
  createdAt:     Timestamp
  status:        'active' | 'closed'
```

### localStorage keys (offline cache)

| Key | Contents |
|---|---|
| `pathher_profile` | Serialised onboarding profile object |
| `saved_recommendations` | JSON array of saved career path IDs |
| `saved_opportunities` | JSON array of saved opportunity IDs |
| `joined_network` | `"true"` when the user has joined the talent network |

---

## Routes

| Path | Access | Page |
|---|---|---|
| `/` | Public | Landing page |
| `/auth` | Public | Sign-in / sign-up |
| `/onboarding` | Private | 6-step profile wizard |
| `/recommendations` | Private | Career path recommendations |
| `/opportunities` | Private | Bursaries, learnerships, courses |
| `/branding` | Private | CV & LinkedIn bio generator |
| `/ecosystem` | Private | Talent network & mentorship |
| `/dashboard` | Private | Recruiter analytics dashboard |

Unauthenticated users are redirected to `/auth` with the intended destination preserved in router state, so they land on the right page after signing in.

---

## Architecture Notes

### Sidebar layout offset
The desktop sidebar is `position: fixed`. The main content area uses `margin-left` (not `padding-left`) on the outer `<main>` element so the inner `max-width` container centers correctly within the *remaining* viewport space rather than against the full viewport width.

### Offline-first
Every Firestore read has a `try/catch`. On failure the app falls back to `localStorage`. Writes go to both simultaneously. The app is fully usable offline after the first successful load.

### Auth loading deadlock prevention
`onAuthStateChanged` fires an async callback that reads Firestore to determine whether the user has completed onboarding. This Firestore call is wrapped in `try/catch` so `setLoading(false)` always runs — even if the database is unreachable. Without this guard, a Firestore error leaves every protected page stuck on the loading spinner indefinitely.

### Career scoring (no AI required)
Each of the four career paths has a set of associated keywords. The user's profile fields are scored:

| Field | Points per keyword match |
|---|---|
| Interests | +3 |
| Strengths | +2 |
| Goals | +1 |

The top 3 paths by total score are shown as personalised recommendations.

### CV & bio generation (no AI required)
Template-based, cycling between two variation styles on each "Regenerate" click. The generator uses the user's profile fields and their top recommended career path to produce ATS-friendly output.

---

## Responsive Breakpoints

The app is mobile-first and tested at 320 px, 375 px, 425 px, 768 px, 1024 px, 1280 px, 1440 px, and 1920 px.

| Breakpoint | Layout behaviour |
|---|---|
| `< 768px` | Single-column, slide-in drawer nav, scaled-down typography and padding |
| `768px – 1023px` | Sidebar collapses to 80px icon rail, 2-column grids activate |
| `1024px+` | Sidebar expands on hover to 280px, 3-column grids, full hero typography |
| `1440px+` | `max-w-6xl` constrains content; centers it in the space to the right of the sidebar |

---

## Contributing

1. Fork the repo and create a branch from `main`
2. Run `npm run lint` — TypeScript strict mode must pass before pushing
3. Keep all Firestore reads and writes inside `src/lib/userdata.ts`; components should call the helpers rather than importing Firestore directly
4. Wrap every new page in `<PrivateRoute>` unless it is intentionally public

---

## License

© 2026 Nobztech. All rights reserved.
