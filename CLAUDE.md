# Bowls Hornby Website — Project Context

This file is read automatically at the start of every Claude Code session.
It replaces the need to re-explain project history in chat.

## What this is
A static website (plain HTML/CSS/JS, no framework) for Bowls Hornby, a
lawn bowls club in Hornby, Christchurch, NZ. Hosted free on GitHub Pages.

## Repos
- **Live site**: `bennym4/bennym4.github.io` → serves `bowlshornby.org.nz`
  (currently UNPUBLISHED/offline — check Settings → Pages before assuming it's live)
- **Draft site**: `bennym4/bh-preview-m4` → serves at
  `bowlshornby.org.nz/bh-preview-m4/` (intentionally renamed from an
  obvious name for privacy — do not rename back to anything with "bowls"
  or "hornby" in it, and do not link to it from the live site)

## Workflow
1. Make changes in the **draft repo** first (`bh-preview-m4`)
2. Get sign-off (from committee or self)
3. Copy the same files into the **live repo** (`bennym4.github.io`) to publish
4. Always confirm with the site owner before pushing to the LIVE repo —
   draft repo changes are lower stakes and can be pushed more freely

## Site structure
6 pages, all sharing one stylesheet:
- `index.html` — Home
- `about.html` — About the Club
- `join.html` — How to Join
- `news.html` — News & Events (draws + notices, auto-loaded — see below)
- `members.html` — Members (placeholder/holding page only, no login yet)
- `contact.html` — Contact (mailto form, no backend)
- `styles.css` — shared design system, all pages import this

## Design system (do not deviate without asking)
- Deep turf green `#1E4630` — header/footer
- Mid green `#3F6B4A` — accents
- Warm parchment `#F2EFE6` — page background
- Clubhouse maroon `#8A2E35` — buttons/CTAs
- Brass gold `#C99A2E` — dividers, highlights
- Fonts: Fraunces (headings), Public Sans (body), Space Mono (small labels)
- Signature motif: thin horizontal "rink lines" (Google Fonts imported in styles.css)

## Live data — Google Sheets (already working, do not rebuild)
`news.html` pulls live from two published Google Sheets via client-side
fetch + CSV parsing (no backend, no API keys needed):
- Draws sheet: 4 columns — Date, Event, Rink, Time
- Notices sheet: 1 column — free text

Committee members edit these sheets directly; the site updates itself.
**Never re-hardcode draws/notices into the HTML** — the whole point was to
make this self-service for non-technical volunteers.
CSV URLs are already in `news.html`'s `<script>` block — don't ask for them again.

## Domain / DNS (already configured, working)
- Domain: `bowlshornby.org.nz`, registered via domains.co.nz
- DNS: 4 A records at root (@) → GitHub Pages IPs
  (185.199.108/109/110/111.153), 1 CNAME (www → bennym4.github.io)
- HTTPS enforced ✅

## Club facts (use these, don't invent others)
- Address: 521 Main South Road (on Hornby Domain), Hornby, Christchurch 8042
- Email: hornbydbc@gmail.com
- Coach: Dave Vincent — 021 070 1862
- Club has TWO full-size greens (not one — this was corrected once already)
- New players welcome any time of season, no experience/equipment needed

## Explicitly deferred / not yet built
- Real member login (would need Cloudflare Access — free up to 50 users,
  discussed but not yet set up)
- Real club/green photos (currently CSS placeholder boxes)
- Membership fees (join.html has a placeholder note flagging this)

## Members-only login

The plan for the members-only login lives in MEMBERS-LOGIN-PLAN.md — read it before
building anything login-related. Key rules: work in this draft repo only; use a
Cloudflare Worker with ONE shared club password (NOT Cloudflare Access); never put the
password or any secret in this repo; private pages are served by the Worker so they are
never publicly downloadable. Members-page copy is in members-page-copy.md.

## House style for any new copy
Warm, community-club tone. Not corporate. Short sentences. This club is
run by volunteers for a small NZ town — write like it.
