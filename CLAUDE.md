# Bowls Hornby Website — Project Context

This file is read automatically at the start of every Claude Code session.
It replaces the need to re-explain project history in chat.

## What this is
A static website (plain HTML/CSS/JS, no framework) for Bowls Hornby, a
lawn bowls club in Hornby, Christchurch, NZ. Hosted free on GitHub Pages.

## Repos
- **Live site**: `bennym4/bennym4.github.io` → serves `bowlshornby.org.nz`
  (PRIVATE on the free plan, so its GitHub Pages is UNPUBLISHED/offline by design
  during the build — check Settings → Pages before assuming it's live)
- **Draft site**: `bennym4/bh-preview-m4` (PUBLIC) → review site
  - Reliable draft URL: **https://bennym4.github.io/bh-preview-m4/**
  - (The custom-domain path `bowlshornby.org.nz/bh-preview-m4/` has worked at times,
    but the bennym4.github.io URL is the dependable one.)
  - Do not rename the draft repo to anything with obvious wording, and do not link
    to it from the live site.

**Hosting fact (learned the hard way):** making `bennym4.github.io` private takes the
WHOLE `bennym4.github.io` domain offline, which also breaks project sites under it.
That's why the draft is reached via its own Pages URL. Decision: keep live repo private;
share the draft's unlisted URL with select reviewers. GitHub Pages has no per-person
access control — anyone with the link can view — so keep no sensitive data on the draft.

## Workflow (important)
1. Make changes in the **draft repo** first (`bh-preview-m4`).
2. Get sign-off (committee or self).
3. Copy the same files into the **live repo** to publish.
4. Always confirm before pushing to LIVE.
5. **The owner (Stephen) uploads files himself via the GitHub web interface.** So:
   plan → confirm → build in draft → show a preview → PACKAGE FILES FOR DOWNLOAD
   with clear upload steps. Do not assume automated push.
6. Style: ELI5, structured, one step at a time. Plan before code.

## Site structure (8 pages, all share one stylesheet)
- `index.html` — Home (includes a "Life at the Club" photo section)
- `about.html` — About the Club
- `join.html` — How to Join
- `news.html` — News & Events (Club Notices only now — draws moved to Members)
- `tournaments.html` — Tournaments (Waitangi Pairs entry page; form is a visual mock-up)
- `members.html` — Members (live Draws + Inter Club + Club Championship sections)
- `contact.html` — Contact (mailto, no backend)
- `links.html` — Useful Links (Bowls NZ, Bowls Canterbury, Facebook)
- `styles.css` — shared design system, all pages import this
Nav order: Home · About · How to Join · News & Events · Tournaments · Members ·
Contact · Useful Links.

## Folders
- `images/` — club photos (club-team.jpg, club-greens.jpg, club-life.jpg), web-resized.
  Home page "Life at the Club" shows these; they're DRAFT-only pending sign-off from
  the people shown before going live/public.
- `files/` — downloadable sample documents linked on the Members page:
  - `Club-Championship-Entry-Form-DRAFT.docx` — printable championship entry form
  - `Inter_Club_Player_Unavailability.xlsx` — blank unavailability template
  - `Bowls-Hornby-Draw-DRAFT.xlsx` — draws transcribed from clubhouse whiteboards
    (DRAFT — names/fixtures need checking vs board; uncertain cells flagged amber)

## Design system (do not deviate without asking)
- Deep turf green `#1E4630` — header/footer
- Mid green `#3F6B4A` — accents (TWO greens, not one)
- Warm parchment `#F2EFE6` — page background
- Clubhouse maroon `#8A2E35` — buttons/CTAs, section header bands
- Brass gold `#C99A2E` — dividers, highlights, card top-borders
- Fonts: Fraunces (headings), Public Sans (body), Space Mono (small labels)
- Signature motif: thin horizontal "rink lines" hero
- Components: `card` (gold top-border), `callout` (maroon left-border),
  `grid grid-2` / `grid grid-3`, `btn` / `btn-primary`

## Live data — Google Sheets (already working, do not rebuild)
Draws and Notices pull live from published Google Sheets via client-side fetch + CSV
parsing (no backend, no API keys):
- **Draws** now render on `members.html` (moved from news). 4 columns: Date, Event, Rink, Time.
- **Notices** render on `news.html`. 1 column: free text.
Committee edits the sheets directly; the site updates itself.
**Never re-hardcode draws/notices into HTML.** CSV URLs already live in the pages'
`<script>` blocks — don't ask for them again.

### Whiteboard → spreadsheet workflow (assisted, not automatic)
For draws written on the clubhouse whiteboard / a paper team sheet:
photograph it → Claude reads and returns rows in the draws format → Stephen checks for
misreads (esp. surnames + opponents) → pastes into the draws Google Sheet → site updates.
A printable on-brand Team Sheet template exists (Date/Event/Rink/Time/Players) to make
handwriting cleaner and reading more accurate. Never publish by hardcoding into HTML.

## Domain / DNS (already configured, working)
- Domain `bowlshornby.org.nz` via domains.co.nz
- DNS: 4 A records at root (@) → GitHub Pages IPs (185.199.108/109/110/111.153),
  1 CNAME (www → bennym4.github.io); HTTPS enforced.

## Club facts (use these, don't invent others)
- Address: 521 Main South Road (Hornby Domain), Hornby, Christchurch 8042
- Email: hornbydbc@gmail.com (also the club account for all third-party services)
- Coach: Dave Vincent — 021 070 1862
- TWO full-size greens
- New players welcome any time of season, no experience/equipment needed

## Members-only login (main outstanding job)
Plan lives in `MEMBERS-LOGIN-PLAN.md`; worker code is in `members-worker/`
(worker.js, wrangler.toml, README, .gitignore) and is merged into the draft repo.
Approach: ONE shared club password (NOT Cloudflare Access) → HMAC-signed session cookie
→ Worker serves the private members page (never a public static file). Remaining steps are
all Cloudflare-side (dashboard + Wrangler CLI + Node.js):
- Free Cloudflare account under the CLUB Gmail; add zone bowlshornby.org.nz.
- `wrangler secret put CLUB_PASSWORD` (strong passphrase) + `SESSION_SECRET`
  (`openssl rand -hex 32`); `wrangler deploy`.
- Add DRAFT route first (`bowlshornby.org.nz/bh-preview-m4/members*`), test, then LIVE route.
- Watch-items: worker.js hardcodes CSS URL to the DRAFT path (change on go-live);
  cookie Path=/members (check first if sessions don't stick); no rate-limiting (password must
  be strong); shared password = casual protection only — keep genuinely private data out.
Never put the password or any secret in this repo.

## Other still-to-do
- **Google Forms** (build under club Gmail): Club Championship entry + Waitangi Pairs entry;
  responses → Google Sheet; then add a styled "Enter" button on the page (button preferred
  over iframe). Ready-to-paste form content has been drafted in chat.
- Tournaments page: fill in contact person + phone (currently TBC).
- Check the draft draw spreadsheet against the whiteboards (amber "Check?" cells).
- Real photos sign-off; membership-fees content (join.html has a placeholder note).
- Deferred: possible Cloudflare Pages migration to fully decouple the repos.

## House style for any new copy
Warm, community-club tone. Not corporate. Short sentences. Volunteer-run small NZ club —
write like it.
