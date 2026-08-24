# Members-Only Login — Implementation Plan (for Claude Code)

**Project:** Bowls Hornby website
**Goal:** A password-protected members area to view private content (committee docs, contact lists).
**Approach:** ONE shared club password, checked by a Cloudflare Worker. Private pages are served BY the Worker so they are never publicly downloadable.
**Work in the DRAFT repo first:** `bennym4/bh-preview-m4`. Do not touch the live repo until reviewed.

---

## Plain-English summary

The public site stays on GitHub Pages exactly as it is now. We add ONE new thing: a small
Cloudflare Worker that acts as a locked door. A member types the club password → the Worker
checks it → if correct, it sets a session cookie and shows the private pages. The private pages
live inside Cloudflare, NOT on GitHub, so nobody can find them by guessing a URL.

**Security honesty:** a shared password is fine for "view private docs / contacts". It is NOT
strong security. Do not put anything genuinely sensitive (financial info, anything that would be
a real problem if leaked) behind it.

---

## Division of labour

### Claude Code does (all the code)
1. Create the Worker (`worker.js`) with login, logout, session-cookie check, and page serving.
2. Create the login page (HTML form, styled with the club's existing `styles.css` look).
3. Create the private members page(s) served only after login.
4. Add a `wrangler.toml` config and a short README with deploy steps.
5. Put everything in a new folder in the draft repo, e.g. `/members-worker/`.

### Stephen does (in the Cloudflare dashboard — Claude Code cannot do these)
1. Create a free Cloudflare account (if not already done).
2. Install Wrangler / connect the repo, or deploy via dashboard.
3. Set the shared password as a **secret** (NEVER in the code): `wrangler secret put CLUB_PASSWORD`.
4. Set a **route** so a path like `bowlshornby.org.nz/members` points at the Worker.
5. Test, then repeat on live.

---

## Cloudflare products used (all free, no 50-user limit)

- **Workers** — the "robot" that checks the password and serves pages. Free tier: 100K requests/day.
- **Workers KV** (optional) — only if we want server-side session tracking. For a shared password,
  a signed cookie is enough and KV may be skipped. Claude Code: prefer a signed cookie, no KV,
  to keep it simple.

Explicitly NOT used: **Cloudflare Access** (has the 50-user free cliff — avoided on purpose).

---

## Technical spec for the Worker

**Routes handled by the Worker:**
- `GET  /members`          → if valid session cookie: serve members page. Else: serve login page.
- `POST /members/login`    → read submitted password, compare to `CLUB_PASSWORD` secret.
                             If correct: set signed session cookie, redirect to `/members`.
                             If wrong: re-show login page with an error message.
- `GET  /members/logout`   → clear the cookie, redirect to `/members`.

**Session cookie:**
- Name: `bh_session`
- Value: an HMAC-signed token (sign with a second secret, `SESSION_SECRET`), NOT the password itself.
- Attributes: `HttpOnly; Secure; SameSite=Strict; Path=/members; Max-Age=<e.g. 7 days>`
- On each `/members` request, verify the HMAC signature before serving content.

**Password check:**
- Compare submitted password to `CLUB_PASSWORD` using a constant-time comparison.
- Never log the password. Never hardcode it. It lives only as a Cloudflare secret.

**Private content:**
- Members page HTML is embedded in / served by the Worker (or fetched from a private source),
  so it is never present as a static file on the public GitHub site.

**Styling:**
- Reuse the visual style of the existing site (`styles.css`) so the login + members pages match.
  Warm, volunteer-run community-club tone.

---

## Secrets (Stephen sets these, Claude Code must NOT put real values in code)

- `CLUB_PASSWORD`   — the shared club password.
- `SESSION_SECRET`  — a long random string used to sign session cookies.

In code, reference these as `env.CLUB_PASSWORD` and `env.SESSION_SECRET` only.

---

## Deploy steps (for the README Claude Code writes)

1. `npm install -g wrangler` (or use the dashboard).
2. `wrangler login`
3. `wrangler secret put CLUB_PASSWORD`
4. `wrangler secret put SESSION_SECRET`
5. `wrangler deploy`
6. In the Cloudflare dashboard, add the route `bowlshornby.org.nz/members*` → this Worker.
7. Test on the draft path first. Only after review, repeat for the live site.

---

## Acceptance checklist

- [ ] Visiting `/members` without a cookie shows the login form, not the private content.
- [ ] Wrong password shows an error and does NOT set a cookie.
- [ ] Correct password sets the cookie and shows the members page.
- [ ] The private members HTML is NOT reachable as a plain file on the public GitHub site.
- [ ] Logout clears the cookie and re-locks the door.
- [ ] No password or secret appears anywhere in the committed code.
- [ ] Login + members pages visually match the rest of the site.

---

## Future upgrade path (not now)

If the club later wants per-member accounts (each member their own login), upgrade to
Workers + a **D1** database storing emails + hashed passwords. Still free, still no 50-user cliff.
Only do this if there's a real need — it's meaningfully more to build and maintain.
