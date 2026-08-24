# Bowls Hornby — Members Area Worker

A small Cloudflare Worker that locks `/members` behind one shared club
password. No Cloudflare Access, no per-member accounts, no 50-user cliff.

The private members page HTML lives inside this Worker, not as a file on
GitHub Pages — so it's never publicly downloadable by guessing a URL.

See `MEMBERS-LOGIN-PLAN.md` (repo root) for the full design. This README
covers only the deploy steps.

## How it works

- `GET /members` — shows the login form, or the members page if you have a
  valid session cookie.
- `POST /members/login` — checks the submitted password against the
  `CLUB_PASSWORD` secret. Correct password sets a signed `bh_session`
  cookie (`HttpOnly; Secure; SameSite=Strict`, 7 days) and redirects to
  `/members`. Wrong password re-shows the form with an error.
- `GET /members/logout` — clears the cookie.

The cookie is an HMAC-signed token (signed with the `SESSION_SECRET`
secret), not the password itself, so the password is never stored in the
browser.

## What's NOT in this repo

`CLUB_PASSWORD` and `SESSION_SECRET` are never hardcoded — the Worker only
ever reads them as `env.CLUB_PASSWORD` / `env.SESSION_SECRET`. You set the
real values as Cloudflare secrets (below), which are encrypted and not
visible in the dashboard or in this codebase.

## Deploy steps

1. Install Wrangler (Cloudflare's CLI), if you don't have it:
   ```
   npm install -g wrangler
   ```

2. Log in:
   ```
   wrangler login
   ```

3. From this folder (`members-worker/`), set the two secrets. Wrangler
   will prompt you to type each value — it is not shown on screen and is
   not stored in any file:
   ```
   wrangler secret put CLUB_PASSWORD
   wrangler secret put SESSION_SECRET
   ```
   - `CLUB_PASSWORD` — the shared password members will type in.
   - `SESSION_SECRET` — any long random string (e.g. run
     `openssl rand -hex 32` and paste the result). Members never see this
     one — it's just used to sign the session cookie.

4. Deploy the Worker:
   ```
   wrangler deploy
   ```

5. In the Cloudflare dashboard, add a route so a path on the site points
   at this Worker: **Workers & Pages → bh-members-worker → Settings →
   Triggers → Routes → Add route**.
   - Test on the **draft** path first:
     `bowlshornby.org.nz/bh-preview-m4/members*`
   - Only after it's reviewed and signed off, add the same route for the
     **live** site: `bowlshornby.org.nz/members*`

   (The zone `bowlshornby.org.nz` needs to already be on Cloudflare DNS
   for routes to work — it's already configured per `CLAUDE.md`.)

6. Visit `/members` on the draft site and test the checklist below.

## Changing the password later

If the password ever needs to change (e.g. it's been shared too widely),
just re-run:
```
wrangler secret put CLUB_PASSWORD
```
No code changes or redeploy of the page content needed — existing
sessions stay valid until they expire (7 days) or logout.

## Testing checklist

- [ ] Visiting `/members` without a cookie shows the login form, not the
      private content.
- [ ] Wrong password shows an error and does not set a cookie.
- [ ] Correct password sets the cookie and shows the members page.
- [ ] The members page HTML is not reachable as a plain file on GitHub
      Pages (it only exists inside the Worker).
- [ ] Logout clears the cookie and re-locks the door.
- [ ] Login + members pages visually match the rest of the site.

## Local development

```
wrangler dev
```
Wrangler will prompt for local values for `CLUB_PASSWORD` and
`SESSION_SECRET` (or use a `.dev.vars` file, which is git-ignored — see
`.gitignore` in this folder — never commit real secrets there).
