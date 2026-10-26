# Admin panel setup (one time, ~10 minutes)

The admin panel (the **Admin** button in the footer, or `…/OmladinaPage_Georgia/#admin`)
uses **Firebase** (free, by Google) for logins and to store announcements, news and events.

Why Firebase: the website itself is just public files on GitHub Pages. A password written
into the page could be read by anyone. With Firebase, passwords are hashed and checked by
Google, and only admin accounts are allowed to change content. This is enforced on Google's
servers by `firestore.rules`, so it holds even if someone reads all of the site's code.

---

## 1. Create the project
1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. **Create a project** → name it e.g. `omladina-zbga` → you can turn **off** Google Analytics → **Create**.

## 2. Turn on email/password login
1. Left menu: **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Email/Password** → switch **Enable** on (leave "Email link" off) → **Save**.
3. **Settings** tab → **Authorized domains** → **Add domain** → `v1zul.github.io` → **Add**.

## 3. Create YOUR login (the first admin)
1. **Authentication → Users** tab → **Add user**.
2. Enter your email and a strong password → **Add user**.
3. Copy the **User UID** shown for that user (a long code like `aB3dE…`).

## 4. Create the database
1. Left menu: **Build → Firestore Database → Create database**.
2. Location: `nam5 (United States)` or `us-east1` → **Next** → **Start in production mode** → **Create**.

## 5. Make yourself an admin
1. In Firestore **Data** tab → **+ Start collection** → Collection ID: `admins` → **Next**.
2. **Document ID**: paste your **User UID** from step 3.
3. Add fields:
   - `name` (string) → your name
   - `email` (string) → your email
4. **Save**.

## 6. Add the security rules
1. Firestore → **Rules** tab.
2. Delete everything there, paste the full contents of [`firestore.rules`](firestore.rules) from this repository.
3. **Publish**.

## 7. Connect the website
1. Click the ⚙️ gear (top left) → **Project settings** → **General**.
2. Under **Your apps**, click the **`</>`** (Web) icon → nickname `Omladina website` → leave Hosting unchecked → **Register app**.
3. You will see a `firebaseConfig = { apiKey: …, authDomain: …, … }` block.
4. Paste those values into `js/firebase-config.js` (replacing `null`), or just send them to Claude.
   These values are **not secret**; they only identify the project.

Commit/push, wait 1–2 minutes, open the site, click **Admin** in the footer and log in.

---

## Using the panel
| Tab | What it does |
|---|---|
| **Announcements** | Gold bar at the top of the website. Optional link and "show until" date. |
| **Events** | Adds events to the calendar (with Google / Apple / Outlook buttons). |
| **News** | Posts in the News section (optional image link). |
| **Admins** | Add new admin logins (name, email, password) or remove them. |
| **My account** | Change your password, log out. |

Everything is entered in Bosnian, with an optional English version shown when visitors switch to English.

### Notes
- **Removing an admin** takes away their access immediately. Their login still exists in Firebase
  but can no longer do anything. To delete it completely: Firebase → Authentication → Users → ⋮ → Delete account.
- You **cannot remove yourself**, so the site can never be left without an admin.
- **Forgot a password?** Firebase → Authentication → Users → ⋮ → **Reset password**.
- Events can still also be added in `js/events.js`; both sources appear in the calendar.
