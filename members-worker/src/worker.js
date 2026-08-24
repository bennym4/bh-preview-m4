/**
 * Bowls Hornby — Members Area Worker
 *
 * Acts as a locked door in front of /members. One shared club password
 * (env.CLUB_PASSWORD), never Cloudflare Access. On success it sets a
 * signed session cookie (signed with env.SESSION_SECRET, not the password
 * itself) and serves the private members page — which lives only in this
 * Worker, never as a static file on the public GitHub Pages site.
 *
 * Routes:
 *   GET  /members         -> login form, or members page if session is valid
 *   POST /members/login   -> checks password, sets cookie, redirects
 *   GET  /members/logout  -> clears cookie, redirects to /members
 */

const COOKIE_NAME = 'bh_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SITE_CSS_URL = 'https://bowlshornby.org.nz/bh-preview-m4/styles.css';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      if (path === '/members' && request.method === 'GET') {
        return handleMembersGet(request, env);
      }
      if (path === '/members/login' && request.method === 'POST') {
        return handleLoginPost(request, env);
      }
      if (path === '/members/logout' && request.method === 'GET') {
        return handleLogout();
      }
      return new Response('Not found', { status: 404 });
    } catch (err) {
      return new Response('Something went wrong. Please try again.', { status: 500 });
    }
  },
};

async function handleMembersGet(request, env) {
  const cookie = getCookie(request, COOKIE_NAME);
  if (cookie && (await verifySession(cookie, env.SESSION_SECRET))) {
    return htmlResponse(renderMembersPage());
  }
  return htmlResponse(renderLoginPage());
}

async function handleLoginPost(request, env) {
  const formData = await request.formData();
  const submitted = String(formData.get('password') || '');

  const ok = await constantTimeEqual(submitted, env.CLUB_PASSWORD || '');

  if (!ok) {
    return htmlResponse(
      renderLoginPage({
        error:
          "Hmm, that password didn't work. Give it another go, or check with the committee if you're stuck — hornbydbc@gmail.com.",
      }),
      { status: 401 }
    );
  }

  const sessionValue = await createSession(env.SESSION_SECRET);
  const headers = new Headers({ Location: '/members' });
  headers.append('Set-Cookie', buildCookie(sessionValue, SESSION_MAX_AGE_SECONDS));
  return new Response(null, { status: 303, headers });
}

function handleLogout() {
  const headers = new Headers({ Location: '/members' });
  headers.append('Set-Cookie', buildCookie('', 0));
  return new Response(null, { status: 303, headers });
}

/* ---------------------------------------------------------------------
 * Session cookie: HMAC-signed "<expiry>.<signature>" token.
 * Never contains the password. Verified fresh on every request.
 * ------------------------------------------------------------------- */

async function createSession(secret) {
  const expiry = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const signature = await hmacSign(String(expiry), secret);
  return `${expiry}.${signature}`;
}

async function verifySession(cookieValue, secret) {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [expiryStr, signature] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expectedSignature = await hmacSign(expiryStr, secret);
  return timingSafeStringEqual(signature, expectedSignature);
}

async function hmacSign(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret || ''),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bufferToHex(signatureBuffer);
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ---------------------------------------------------------------------
 * Constant-time comparisons — password and cookie signature checks
 * should not leak timing information about how much of the input matched.
 * ------------------------------------------------------------------- */

function timingSafeStringEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function constantTimeEqual(submitted, actual) {
  // Hash both sides first so comparison length doesn't leak the real
  // password's length, then compare the fixed-length digests in constant time.
  const [submittedHash, actualHash] = await Promise.all([
    sha256Hex(submitted),
    sha256Hex(actual),
  ]);
  return timingSafeStringEqual(submittedHash, actualHash);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bufferToHex(digest);
}

/* ---------------------------------------------------------------------
 * Cookies
 * ------------------------------------------------------------------- */

function getCookie(request, name) {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildCookie(value, maxAgeSeconds) {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/members',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
  ];
  return attrs.join('; ');
}

/* ---------------------------------------------------------------------
 * Responses / templates
 * ------------------------------------------------------------------- */

function htmlResponse(body, init = {}) {
  return new Response(body, {
    ...init,
    headers: { 'Content-Type': 'text/html; charset=UTF-8', ...(init.headers || {}) },
  });
}

function pageShell({ title, activeNav, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Bowls Hornby</title>
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="${SITE_CSS_URL}">
</head>
<body>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="https://bowlshornby.org.nz/bh-preview-m4/index.html">
      <span class="brand-mark">EST. HORNBY</span>
      <span class="brand-name">Bowls Hornby</span>
    </a>
    <nav class="main-nav" aria-label="Main">
      <a href="https://bowlshornby.org.nz/bh-preview-m4/index.html">Home</a>
      <a href="https://bowlshornby.org.nz/bh-preview-m4/about.html">About the Club</a>
      <a href="https://bowlshornby.org.nz/bh-preview-m4/join.html">How to Join</a>
      <a href="https://bowlshornby.org.nz/bh-preview-m4/news.html">News &amp; Events</a>
      <a href="/members" class="${activeNav === 'members' ? 'active' : ''}">Members</a>
      <a href="https://bowlshornby.org.nz/bh-preview-m4/contact.html">Contact</a>
    </nav>
  </div>
</header>

${bodyHtml}

<footer class="site-footer">
  <div class="wrap">
    <span>&copy; 2026 Bowls Hornby</span>
    <span>521 Main South Road, Hornby, Christchurch 8042 &middot; <a href="mailto:hornbydbc@gmail.com">hornbydbc@gmail.com</a></span>
  </div>
</footer>

</body>
</html>`;
}

function renderLoginPage({ error } = {}) {
  const errorHtml = error
    ? `<p role="alert" style="color: var(--maroon-dark); font-weight: 600; margin-top: 0;">${escapeHtml(error)}</p>`
    : '';

  const bodyHtml = `
<section class="hero rink-lines">
  <div class="wrap hero-inner">
    <span class="eyebrow">Members Area</span>
    <h1>Members Area</h1>
    <p class="lede">Welcome back! This part of the site is just for Bowls Hornby members. Pop in the club password below to see committee notices, contact details and other members-only bits.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="holding-panel" style="max-width: 420px; margin: 0 auto; text-align: left;">
      ${errorHtml}
      <form method="POST" action="/members/login">
        <div style="margin-bottom: 18px;">
          <label for="password">Club password</label>
          <input type="password" id="password" name="password" required autofocus>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Enter</button>
      </form>
      <p style="font-size: 13px; margin-top: 18px; text-align: center;">
        Don't have the password? It's shared with current members — email
        <a href="mailto:hornbydbc@gmail.com">hornbydbc@gmail.com</a> and we'll sort you out.
      </p>
    </div>
  </div>
</section>`;

  return pageShell({ title: 'Members Area', activeNav: 'members', bodyHtml });
}

function renderMembersPage() {
  const bodyHtml = `
<section class="hero rink-lines">
  <div class="wrap hero-inner">
    <span class="eyebrow">Members Area</span>
    <h1>Members Area</h1>
    <p class="lede">Great to have you here. Below you'll find the latest committee notices and handy contacts. If something's out of date, flick us a note at hornbydbc@gmail.com.</p>
  </div>
</section>

<section>
  <div class="wrap grid grid-2">
    <div>
      <span class="section-label">Committee Notices</span>
      <h2>Notices</h2>
      <p>Committee to add notices here, or link to a shared doc.</p>
    </div>

    <div>
      <span class="section-label">Key Contacts</span>
      <h2>Contacts</h2>
      <dl class="info-list">
        <dt>Club email</dt>
        <dd><a href="mailto:hornbydbc@gmail.com">hornbydbc@gmail.com</a></dd>
        <dt>Coach</dt>
        <dd>Dave Vincent &mdash; 021 070 1862</dd>
      </dl>
    </div>
  </div>

  <div class="wrap">
    <span class="section-label">Documents</span>
    <h2>Documents</h2>
    <p>Links to private docs &mdash; e.g. meeting minutes, club rules. Add as needed.</p>
  </div>

  <div class="wrap" style="margin-top: 32px;">
    <a href="/members/logout" class="btn btn-ghost" style="color: var(--maroon); border-color: var(--maroon);">Log out</a>
  </div>
</section>`;

  return pageShell({ title: 'Members Area', activeNav: 'members', bodyHtml });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
