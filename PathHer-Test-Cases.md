# PathHer AI — QA Test Cases

**Environment:** https://pathher.vercel.app  
**Firebase project:** path-her  
**AI provider:** Groq (llama-3.3-70b-versatile)

> Use a **real email you control** for auth tests. Delete the test account when done.

---

**Tester name:** ___________________________  
**Test date:** ___________________________  
**Browser + version:** ___________________________  
**Device / OS:** ___________________________  
**Build / commit:** ___________________________  
**Overall result:** ___________________________

---

## Test Case Key

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not yet run |
| `[P]` | Pass |
| `[F]` | Fail |
| `[S]` | Skip |

---

## Section 1 — Landing Page

### TC-01 · Landing page loads with all key content · **High**

**Preconditions:** Logged out. Clear browser cache before running.

**Steps:**
1. Open https://pathher.vercel.app
2. Observe the hero section — headline, subheading, CTA button
3. Scroll down the full page
4. Open DevTools (F12) → Console — check for red errors

**Expected:** Page loads without errors. Hero headline is visible. All sections render on scroll. No red errors in console.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-02 · CTA button routes correctly based on auth state · **High**

**Preconditions:** Test twice — once logged out, once logged in with a completed profile.

**Steps:**
1. While logged out, click the main "Start Your Journey" CTA button — note the destination URL
2. Log in with a completed profile, return to the landing page
3. Click the same CTA button — note the destination URL this time

**Expected:** Logged out → `/onboarding`. Logged in (profile complete) → `/recommendations`.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-03 · "Need a moment?" breathing exercise · **Low**

**Preconditions:** Landing page is open.

**Steps:**
1. Click the "Need a moment?" button/link
2. A modal should appear with breathing instructions
3. Start the exercise and observe the phases: Inhale → Hold → Exhale
4. Wait for all 3 cycles to complete
5. Close the modal with the X button

**Expected:** Modal opens. Phases animate correctly (4s Inhale → 4s Hold → 4s Exhale × 3 cycles). A "Complete" state appears after 3 cycles. Modal closes cleanly with no errors.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 2 — Authentication

### TC-04 · New user sign-up with email and password · **High**

**Preconditions:** Logged out. Use an email not previously registered — note it down.

**Steps:**
1. Navigate to `/auth`
2. Select the "Sign Up" tab or mode
3. Enter a valid unused email and a password (minimum 6 characters)
4. Submit the form
5. Note where the app navigates

**Expected:** User is signed up and automatically logged in. App redirects to `/onboarding` (first-time user). No error shown.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-05 · Returning user sign-in with email and password · **High**

**Preconditions:** An account with a completed onboarding profile already exists.

**Steps:**
1. Sign out if currently signed in
2. Navigate to `/auth`
3. Enter the existing account's email and password
4. Submit the sign-in form

**Expected:** Sign-in succeeds. App redirects to `/recommendations` (not `/onboarding`). User's name or profile data is visible on the page.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-06 · Google OAuth sign-in · **High**

**Preconditions:** Logged out. A Google account is available.

**Steps:**
1. Navigate to `/auth`
2. Click "Continue with Google"
3. Complete the Google sign-in popup
4. Observe the redirect after sign-in

**Expected:** Google popup opens. After selecting an account, user is signed in. New Google users → `/onboarding`. Returning Google users → `/recommendations`. Popup closes — no lingering blank window.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-07 · Logged-in user is redirected away from /auth · **High**

**Preconditions:** Already signed in with a completed profile.

**Steps:**
1. Manually type `/auth` in the address bar and press Enter
2. Observe the result

**Expected:** The `/auth` page never renders. User is immediately redirected to `/recommendations`.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-08 · Invalid credentials show a user-friendly error · **Medium**

**Preconditions:** Logged out. On `/auth`.

**Steps:**
1. Enter a valid-looking email (e.g. `notreal@test.com`) and a wrong password, click Sign In
2. Note the error message shown
3. Try again with a malformed email (e.g. `notanemail`) and submit

**Expected:** A clear, non-technical error message appears (e.g. "Invalid email or password"). No raw Firebase error codes (`auth/user-not-found`) shown. App does not crash.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 3 — Onboarding Flow

### TC-09 · Complete 6-step onboarding generates an AI career plan · **High**

**Preconditions:** Signed in as a brand-new user (no saved profile). Start at `/onboarding`.

**Steps:**
1. Step 1 — Personal Info: enter a full name and email, click Next
2. Step 2 — Education: select an education level, click Next
3. Step 3 — Interests: select at least 2 interests, click Next
4. Step 4 — Strengths: select at least 2 strengths, click Next
5. Step 5 — Career Goals: select at least 2 goals, click Next
6. Step 6 — Work Style: select at least 1 style, click Finish/Submit
7. Wait for AI generation to complete (observe loading state)
8. Note where the app navigates after completion

**Expected:** All 6 steps progress correctly. App navigates to `/recommendations` showing 3 personalised career paths that reference the user's actual interests and name — not generic placeholder text.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-10 · AI generation shows a loading state (not a blank screen) · **High**

**Preconditions:** Run during TC-09. Watch carefully after submitting Step 6.

**Steps:**
1. Submit the final onboarding step
2. Immediately observe the screen while the AI generates (takes ~5–15 seconds)
3. Look for a spinner, progress message, or any visual feedback

**Expected:** A loading indicator or message is visible during AI generation. Screen does not go blank or show an error while waiting.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-11 · Returning user is not forced through onboarding again · **High**

**Preconditions:** Signed in as a user who has already completed onboarding.

**Steps:**
1. Sign out and sign back in with the existing account
2. Observe where the app redirects after sign-in
3. While logged in with this profile, manually navigate to `/onboarding`

**Expected:** Sign-in goes directly to `/recommendations` — not `/onboarding`. Navigating to `/onboarding` while a profile exists either shows an edit mode or redirects away. Previously entered data is intact.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-12 · Back button returns to the previous onboarding step with data intact · **Medium**

**Preconditions:** New user on the onboarding flow.

**Steps:**
1. Complete Step 1 (enter name + email), advance to Step 2
2. Click the Back button
3. Verify you are on Step 1 and the name/email you entered is still there
4. Advance to Step 4, then press Back twice

**Expected:** Back returns to the previous step. All previously entered data is preserved — the user does not need to re-enter anything.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 4 — Recommendations Page

### TC-13 · AI career paths are personalised (not hardcoded/generic) · **High**

**Preconditions:** Just completed TC-09. Profile had specific interests (e.g. "Technology" and "Finance").

**Steps:**
1. On `/recommendations`, read the "Why it fits" text for each career path
2. Check that the text references the user's actual interests, strengths, or goals by name
3. Check that "SA Examples" lists real South African companies or programmes
4. Verify no text says "Your Name" or contains obvious placeholders

**Expected:** "Why it fits" descriptions reference the user's specific profile by name. SA Examples are real organisations. No template placeholder text visible.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-14 · Save / unsave a career path · **Medium**

**Preconditions:** On `/recommendations` with career paths loaded.

**Steps:**
1. Click the Bookmark/Save icon on one of the career path cards
2. Observe visual feedback (icon fills or changes colour)
3. Reload the page (F5)
4. Check the same card — is it still saved?
5. Click the icon again to unsave it

**Expected:** Save state toggles visually. After reload, the saved path is still highlighted. Clicking again removes the saved state.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-15 · Share button copies a shareable link to clipboard · **Low**

**Preconditions:** On `/recommendations` with career paths loaded.

**Steps:**
1. Click the Share icon on a career path card
2. Observe any toast/notification
3. Open a new tab, paste (Ctrl+V), check what was copied

**Expected:** "Copied!" toast appears. Clipboard contains a URL pointing to the recommendations page or specific path.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-16 · Page handles missing AI data gracefully (fallback paths) · **Medium**

**Preconditions:** DevTools open → Application tab → Local Storage.

**Steps:**
1. Open DevTools → Application → Local Storage → https://pathher.vercel.app
2. Delete the key containing AI/career data (look for `pathher_ai` or similar)
3. Navigate to `/recommendations`
4. Observe whether the page shows anything or breaks

**Expected:** Page does not crash. Either fallback/generic career paths are shown, or a prompt to complete onboarding appears. No unhandled JS errors in console.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 5 — Opportunities Page

### TC-17 · Opportunities list loads and displays cards · **High**

**Preconditions:** Signed in with a completed profile. Navigate to `/opportunities`.

**Steps:**
1. Navigate to `/opportunities`
2. Wait for the page to fully load
3. Count how many opportunity cards appear
4. Check each card has a title, type badge, and details
5. Scroll down to check if a courses section is present

**Expected:** Multiple opportunity cards load (bursaries, internships, etc.) with titles and type badges. A recommended courses section is also visible. No blank or infinite-loading state.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-18 · Filter by opportunity type narrows results · **Medium**

**Preconditions:** On `/opportunities` with cards loaded.

**Steps:**
1. Click the "Bursary" filter
2. Confirm only Bursary cards remain
3. Switch to "Internship" filter — confirm results update
4. Click "All" to reset

**Expected:** Each filter shows only cards of the selected type. "All" restores the full list.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-19 · Search box filters opportunities by keyword · **Medium**

**Preconditions:** On `/opportunities` with cards loaded.

**Steps:**
1. Type "technology" or "engineering" in the search box
2. Observe the filtered results
3. Clear the search box — confirm all cards return
4. Type a word that matches nothing (e.g. `zzzzz`)

**Expected:** Results update as the user types. Matching cards remain; non-matching cards are hidden. No-match state shows a message — page does not crash.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-20 · Bookmark/save an opportunity persists after reload · **Low**

**Preconditions:** On `/opportunities` with cards loaded.

**Steps:**
1. Click the bookmark icon on any opportunity card
2. Reload the page (F5)
3. Check that the same card is still bookmarked

**Expected:** Bookmark state is saved (localStorage or Firestore) and persists after reload.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 6 — Branding Page

### TC-21 · CV text generates with the user's real information · **High**

**Preconditions:** Signed in with a completed profile. Navigate to `/branding`.

**Steps:**
1. Navigate to `/branding`
2. Find the CV / resumé section
3. Read through the generated CV text
4. Check for the user's name (in uppercase), education level, interests, and strengths

**Expected:** CV contains the user's actual name, education level, interests, and strengths. No "Your Name" or placeholder text.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-22 · LinkedIn bio generates with relevant content · **High**

**Preconditions:** On `/branding` with a profile loaded.

**Steps:**
1. Find the LinkedIn Bio section
2. Read the generated bio
3. Confirm it mentions the user's career path or interests
4. Check it includes South African context and `#PathHerAI` hashtag

**Expected:** LinkedIn bio is generated and relevant. It references the user's aspirational career path. South African context and hashtags are present. No placeholder text.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-23 · Regenerate button creates a different variation · **Medium**

**Preconditions:** On `/branding` with content loaded.

**Steps:**
1. Read and note the first few lines of the CV or LinkedIn bio
2. Click the Regenerate/Refresh button next to that section
3. Compare the new text to what was there before

**Expected:** New text is visibly different in wording. Content is still relevant to the user's profile — not random. Name, education, and interests still present.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-24 · Copy button copies content to clipboard · **Medium**

**Preconditions:** On `/branding` with content loaded.

**Steps:**
1. Click the Copy button on the CV or LinkedIn bio
2. Open Notepad and paste (Ctrl+V)
3. Confirm what was pasted matches what was on screen

**Expected:** Full CV or bio text is in the clipboard. A "Copied!" confirmation appears briefly.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-25 · Profile visibility toggle persists after page reload · **Medium**

**Preconditions:** On `/branding`.

**Steps:**
1. Find the profile visibility toggle (e.g. "Make my profile visible to recruiters")
2. Toggle it ON if it is off — note the new state
3. Reload the page (F5)
4. Confirm the toggle is in the same state you left it

**Expected:** Toggle state is saved to Firestore. After reload it shows the same value — not a reset/default.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 7 — Dashboard & Recruiter Gate

### TC-26 · Non-recruiter sees a locked dashboard state · **High**

**Preconditions:** Signed in as a regular user (`isRecruiter` is NOT set in Firestore). Navigate to `/dashboard`.

**Steps:**
1. Navigate to `/dashboard`
2. Observe the page state
3. Confirm that recruiter features (candidate list, job posting) are inaccessible

**Expected:** Dashboard shows a locked/gated state. Recruiter-only features are inaccessible. An explanation of recruiter access is shown.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-27 · "Request recruiter access" sets a PENDING state — does NOT grant access · **High**

**Preconditions:** On `/dashboard` as a non-recruiter who has NOT previously requested access.

**Steps:**
1. Click the "Request Recruiter Access" (or similar) button
2. Observe the immediate UI change
3. Confirm the recruiter features are still locked
4. Open Firebase Console → Firestore → users → [your UID] — check that `recruiterRequested: true` is set but `isRecruiter` is absent or false

**Expected:** Button changes to a "Request received" message. The dashboard remains locked — the user does NOT gain access by clicking. Firestore has `recruiterRequested: true` only.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-28 · Pending recruiter request persists on page reload and re-login · **Medium**

**Preconditions:** TC-27 completed — recruiter request has been submitted.

**Steps:**
1. Reload `/dashboard` (F5) — check the pending message is still shown
2. Sign out and sign back in — navigate to `/dashboard` again

**Expected:** The "Request received" / pending state is shown after every reload and after re-login. The "Request access" button does not reappear.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 8 — Ecosystem Page

### TC-29 · Ecosystem page shows "PathHer Talent Network" (not old branding) · **High**

**Preconditions:** Navigate to `/ecosystem` while signed in.

**Steps:**
1. Navigate to `/ecosystem`
2. Press Ctrl+F and search for "Nobztech" on the page
3. Check the talent network section heading

**Expected:** "Nobztech" appears nowhere on the page. The talent network section says "Join the PathHer Talent Network" or similar with PathHer branding.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-30 · Ecosystem page content loads without errors · **Medium**

**Preconditions:** Navigate to `/ecosystem`.

**Steps:**
1. Navigate to `/ecosystem`
2. Scroll through the full page
3. Check browser console for errors (F12)

**Expected:** Page content loads fully with no broken sections. No red errors in console.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 9 — Legal Pages

### TC-31 · Terms of Service page loads at /terms · **Medium**

**Preconditions:** Accessible while logged out.

**Steps:**
1. Navigate to https://pathher.vercel.app/terms
2. Confirm the page loads with Terms of Service content
3. Also try via a footer link if one exists

**Expected:** `/terms` loads and shows Terms of Service content. No 404 or blank page.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-32 · Privacy Policy page loads at /privacy · **Medium**

**Preconditions:** Accessible while logged out.

**Steps:**
1. Navigate to https://pathher.vercel.app/privacy
2. Confirm the page loads with Privacy Policy content

**Expected:** `/privacy` loads and shows Privacy Policy content. No 404 or blank page.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 10 — 404 & Error Handling

### TC-33 · Unknown route shows a 404 page (not a blank screen) · **Medium**

**Preconditions:** None.

**Steps:**
1. Navigate to https://pathher.vercel.app/this-page-does-not-exist
2. Observe what is displayed
3. Check if there is a link/button to go back home

**Expected:** A custom 404 / "Page Not Found" screen appears with a way to navigate home. App shell (header/nav) still renders correctly.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-34 · Sign out works and route guard blocks unauthenticated users · **High**

**Preconditions:** Signed in. Find the Sign Out button (usually in nav or profile menu).

**Steps:**
1. While on `/recommendations`, click Sign Out
2. Note where the app navigates after sign-out
3. Try manually visiting `/recommendations` while signed out

**Expected:** Sign-out logs the user out and redirects to the landing page or `/auth`. Visiting `/recommendations` while signed out redirects to `/auth` (route guard is working).

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 11 — Security

### TC-35 · AI endpoint rejects calls without an auth token · **High**

**Preconditions:** A terminal or Postman is available.

**Steps:**
1. Run the following command in a terminal:
   ```
   curl -X POST https://pathher.vercel.app/api/gemini \
     -H "Content-Type: application/json" \
     -d '{"profile":{"fullName":"Test"}}'
   ```
2. Note the HTTP status code and response body

**Expected:** Response is HTTP `401` with body `{"error":"Unauthorized"}`. No career data is returned. The AI is not called.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-36 · Protected routes block unauthenticated users · **High**

**Preconditions:** Signed out / incognito window.

**Steps:**
1. While signed out, directly visit each of these URLs one by one:
   - https://pathher.vercel.app/recommendations
   - https://pathher.vercel.app/opportunities
   - https://pathher.vercel.app/branding
   - https://pathher.vercel.app/dashboard
2. Note what happens for each

**Expected:** All four routes redirect to `/auth`. None of them render their content to an unauthenticated user.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

### TC-37 · User cannot read another user's Firestore data · **High**

**Preconditions:** Signed in as any user. You need a second user's UID (ask the project owner for one, or find one in the Firebase Console).

**Steps:**
1. Open browser DevTools → Console (F12)
2. Paste and run this command (replace `ANOTHER_USER_UID`):
   ```js
   const r = await fetch('https://firestore.googleapis.com/v1/projects/path-her/databases/default/documents/users/ANOTHER_USER_UID');
   console.log(r.status);
   ```
3. Note the status code returned

**Expected:** Status is `403`. The response body contains `PERMISSION_DENIED`. No other user's data is accessible.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Section 12 — Cross-Device Data Sync

### TC-38 · Profile and recommendations load correctly on a second device/browser · **High**

**Preconditions:** Account with a completed onboarding profile. Access to a second device or a different browser (e.g. Chrome + Firefox, or phone + laptop).

**Steps:**
1. Device A: complete onboarding and note the 3 career paths shown on `/recommendations`
2. Device B (different browser — no shared localStorage): sign in with the same credentials
3. Navigate to `/recommendations` on Device B
4. Compare career paths with Device A
5. Check `/branding` on Device B — confirm CV and bio are generated from the correct profile

**Expected:** Device B shows the same profile-based career paths (loaded from Firestore). Onboarding is NOT repeated. CV and LinkedIn bio are based on the correct profile data.

**Result:** `[ ]` Pass `[ ]` Fail `[ ]` Skip

**Notes / Bug details:**
> _______________________________________________________________________

---

## Result Summary

| ID | Test Case | Priority | Result | Bug / Notes |
|----|-----------|----------|--------|-------------|
| TC-01 | Landing page loads | High | | |
| TC-02 | CTA routing by auth state | High | | |
| TC-03 | Breathing exercise modal | Low | | |
| TC-04 | Email/password sign up | High | | |
| TC-05 | Returning user sign in | High | | |
| TC-06 | Google OAuth sign-in | High | | |
| TC-07 | Logged-in redirect from /auth | High | | |
| TC-08 | Invalid credentials error | Medium | | |
| TC-09 | Full onboarding → AI generation | High | | |
| TC-10 | AI loading state visible | High | | |
| TC-11 | Returning user skips onboarding | High | | |
| TC-12 | Onboarding back button | Medium | | |
| TC-13 | Personalised career paths | High | | |
| TC-14 | Save / unsave career path | Medium | | |
| TC-15 | Share button copies link | Low | | |
| TC-16 | Fallback on missing AI data | Medium | | |
| TC-17 | Opportunities list loads | High | | |
| TC-18 | Filter by type | Medium | | |
| TC-19 | Search filters results | Medium | | |
| TC-20 | Bookmark opportunity persists | Low | | |
| TC-21 | CV with real profile data | High | | |
| TC-22 | LinkedIn bio generates | High | | |
| TC-23 | Regenerate creates variation | Medium | | |
| TC-24 | Copy to clipboard | Medium | | |
| TC-25 | Visibility toggle persists | Medium | | |
| TC-26 | Non-recruiter sees locked state | High | | |
| TC-27 | Request access = pending (not granted) | High | | |
| TC-28 | Pending request persists | Medium | | |
| TC-29 | Ecosystem branding (no "Nobztech") | High | | |
| TC-30 | Ecosystem page loads | Medium | | |
| TC-31 | /terms loads | Medium | | |
| TC-32 | /privacy loads | Medium | | |
| TC-33 | 404 page for unknown routes | Medium | | |
| TC-34 | Sign out and route guard | High | | |
| TC-35 | API rejects unauthenticated calls | High | | |
| TC-36 | Protected routes block signed-out users | High | | |
| TC-37 | Firestore cross-user data blocked | High | | |
| TC-38 | Cross-device data sync | High | | |

---

**Total Pass:** _______ / 38  
**Total Fail:** _______  
**Total Skip:** _______  
**Sign-off:** ___________________________
