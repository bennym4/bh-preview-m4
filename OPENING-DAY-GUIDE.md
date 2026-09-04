# Opening Day — Live Edits Guide (Bowls Hornby)

A simple, keep-it-beside-you guide for making live website changes with Claude Code
while members watch and suggest edits. Draft repo only: **bh-preview-m4**.

---

## Before you start (do this once, at the beginning of the session)

1. Open **https://claude.ai/code** in your browser.
2. Click **+ New**.
3. Check the tags above the message box say **bh-preview-m4** and **main**.
4. **Paste this instruction first, before anything else:**

> You are helping me make live edits to the Bowls Hornby website during opening day.
> Commit directly to the `main` branch — do NOT create side branches or pull requests.
> After each change: edit, commit to main, and push. Keep each change small and show me
> a one-line summary of what you did. This is the draft repo `bh-preview-m4`; changes
> appear on the preview site about a minute after pushing.

That one paste sets Claude Code up to work the fast way for the whole session.

---

## The flow for each member suggestion

1. A member suggests a change.
2. Tell Claude Code in plain English, e.g.
   *"Change the Home tagline to say ‘…’."* or *"On the About page, add a line under the fees table saying ‘…’."*
3. Claude Code edits → commits → pushes. It'll give you a one-line summary.
4. **Wait about 1 minute** for the preview site to rebuild.
5. Refresh the preview with **Ctrl + Shift + R** (Windows) / **Cmd + Shift + R** (Mac).
6. The change is now live on the preview for everyone to see.

**Preview site link:** https://bennym4.github.io/bh-preview-m4/

Tip: while a change is building, take the next suggestion so there's no dead air.

---

## Handy phrasings to give Claude Code

- "Change the wording ‘OLD TEXT’ to ‘NEW TEXT’ on the [page] page."
- "Add a new bullet/line to the [section] saying ‘…’."
- "That looks wrong — undo the last change."
- "Show me the change before you commit." (use if you want a pause on a bigger edit)

Keep each request to **one small change**. Small changes are fast, easy to see, and easy to undo.

---

## Quick changes vs big changes (important)

Not all changes are equal. Handle them differently.

### Quick changes — safe to do live in front of the crowd
Small text edits: wording, a new line, fixing a typo, swapping a caption.
These are fast, easy to see, and easy to undo. Just describe them and let Claude Code
commit straight to main as normal.

### Big changes — DON'T rush these live
New pages, colour changes, new sections, adding photos, moving things around.
These touch more of the site and are easy to get slightly wrong on the first try —
stressful to fix with people watching.

**For any big change, add this to the end of your request:**

> ...Show me before committing — don't push yet.

That gives you a pause to check it before it goes live.

**Better still:** collect big requests as a **list** on the day ("new events page",
"make it more maroon") and build them properly afterwards, calmly, with previews.
Keep the live session to quick text tweaks.

### Prompts for big changes (use "show me before committing")

**New page:**
> Create a new page called `events.html` in the same style as the existing pages
> (same header, nav, footer, styles.css). Hero titled "…", one section saying "…".
> Add an "Events" link to the nav on every page after "News & Events".
> Show me before committing — don't push yet.

**Whole-site colour change:**
> In styles.css, change the hero background from maroon to [colour]. Show me the exact
> rule you're changing and let me see it before committing — don't push yet.

**One element's colour:**
> Make the primary buttons [colour] instead of maroon. Show me before committing.

**Add a section to a page:**
> On the [page] page, add a new section after [location] with heading "…" and this text:
> "…". Match the existing section styling. Show me before committing.

**Add a photo:**
> On the [page] page, replace the "[placeholder label]" placeholder with the image at
> images/[filename].jpg, keeping the same caption style. Show me before committing.

---

## If something goes wrong — undo / roll back

**Quick undo (last change):** just say to Claude Code:
> Undo the last change and push, so the preview goes back to how it was.

**Bigger roll back (to an earlier version):** every change is saved in GitHub's history.
1. Go to **https://github.com/bennym4/bh-preview-m4/commits/main**
2. Find the version from before things went wrong.
3. Click it, then use the **"Revert"** option (or ask in a normal Claude chat and I'll walk you through it).

Nothing is ever truly lost — GitHub keeps every past version.

---

## Safety notes (reassuring facts)

- Claude Code **can edit and push**, but **cannot delete** branches or files in this setup — a built-in guardrail.
- All edits go to the **draft** repo (`bh-preview-m4`), **never** the live site — members see the preview URL only.
- The preview has no login, so **don't add anything private** (member names, phone numbers not already public, etc.) during a live session.

---

## Before the day — checklist

- [ ] Test the clubrooms Wi-Fi. Patchy? Bring a **phone hotspot** as backup.
- [ ] Have this guide open (laptop, phone, or printed).
- [ ] Have the preview link bookmarked: https://bennym4.github.io/bh-preview-m4/
- [ ] Do one practice edit the day before, so the flow feels familiar.

---

*Keep this file. Reuse it every time you run a live-edit session.*
