# Travels (`/travel`)

A small public blog/review section for hikes and places. Visitors can browse,
search, and filter; only you (signed in) can create/edit entries.

- `index.html` — home / menu with search, type/tag/rating filters, and sorting
- `post.html?id=...` — a single entry (the "review")
- `editor.html` — owner-only sign-in + create/edit/delete + photo upload
- `js/travel.js` — all logic (shared across the three pages, routed via `body[data-page]`)
- `js/travel-config.js` — Supabase URL + anon key, injected at deploy time (stays `null` in git)
- `SUPABASE_TRAVEL_SETUP.sql` — run once in the Supabase SQL editor

## One-time setup

1. **Secrets** are already shared with Life ERP. The deploy workflow writes
   `travel/js/travel-config.js` from `SUPABASE_URL` + `SUPABASE_ANON_KEY`
   (GitHub → Settings → Secrets and variables → Actions). No new secrets needed.
2. In Supabase → **SQL Editor**, run `SUPABASE_TRAVEL_SETUP.sql`. This creates the
   `travel_posts` table (public read / signed-in write) and a public `travel`
   storage bucket for photos.
3. Sign in at `jacobgoodman.me/travel/editor.html` with your Life ERP account and
   start adding entries. (Account sign-up is gated by `SIGNUP_ACCESS_KEY`, so only
   you can have an account.)

## Lock writes to only your account (optional, stricter)

The default policy lets any *authenticated* user write — which is effectively just
you, since nobody else can sign up. To hard-lock it to your user ID, find your UUID
in Supabase → **Authentication → Users**, then in the SQL editor replace
`auth.role() = 'authenticated'` with `auth.uid() = 'YOUR-USER-UUID'` in each of the
`travel_posts` write policies (insert/update/delete).

## Photos

The editor uploads files you pick from your computer straight into the Supabase
`travel` storage bucket and stores the public URLs on the entry. No need to commit
images to the repo.

---

# Subdomain migration (optional, later)

Today everything is one GitHub Pages repo with a single custom domain
(`jacobgoodman.me` via the root `CNAME`). **GitHub Pages allows only one custom
domain per repository**, so subdomains like `travel.jacobgoodman.me` or
`lifelog.jacobgoodman.me` each need their **own repo** plus a DNS record. Here's the
playbook when you want to do it.

## Option A — keep subdirectories (current, zero work)

- `jacobgoodman.me/travel` and `jacobgoodman.me/lifelog` already work.
- No DNS, no extra repos. Recommended unless you specifically want the subdomain.

## Option B — promote a section to a subdomain

Example for `travel.jacobgoodman.me` (same steps for `lifelog.`):

1. **New repo** (e.g. `travel-site`). Move the `travel/` folder contents to its
   root. Copy the deploy workflow (`.github/workflows/deploy.yml`) and the parts of
   `/assets` it uses.
2. Add a `CNAME` file at the repo root containing exactly:
   ```
   travel.jacobgoodman.me
   ```
3. In the new repo: **Settings → Pages** → set Source to GitHub Actions, and set the
   custom domain to `travel.jacobgoodman.me`.
4. **DNS** (at your domain registrar): add a `CNAME` record
   `travel` → `goody64.github.io` (the user `github.io` host, *not* the repo).
5. Re-add the GitHub Secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) to the new repo so
   its workflow can generate `js/travel-config.js`.
6. Update links: in the main site, point the nav "Travel" link at
   `https://travel.jacobgoodman.me/` instead of `/travel/`.
7. Optionally leave a redirect at `jacobgoodman.me/travel/` (a tiny
   `index.html` with `<meta http-equiv="refresh" content="0; url=https://travel.jacobgoodman.me/">`).

### Notes specific to `lifelog.jacobgoodman.me`

- The service worker (`sw.js`) and `manifest.webmanifest` use `scope: /lifelog/` and
  `start_url: /lifelog/dashboard.html`. On a subdomain, change these to `/` and
  `/dashboard.html` respectively.
- The Supabase Edge Functions and `user_data` are tied to the project, not the URL,
  so cloud sync keeps working after the move (you'll just sign in on the new domain).
- Add the secrets to the new repo's Actions settings as in step 5.

GitHub serves the apex `jacobgoodman.me` and any subdomains as long as each
subdomain's repo has its own `CNAME` and a matching DNS `CNAME` record pointing to
`goody64.github.io`.
