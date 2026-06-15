/**
 * Okta SAML 2.0 SSO — runs on the Forcepoint Intelligence Platform server.
 *
 * IdP-side values come from the Okta SAML app (sso URL, issuer, X.509 cert).
 * SP-side values we publish back:
 *   - ACS / Single sign-on URL : ${PORTAL_BASE_URL}/auth/saml/acs
 *   - Audience URI (SP Entity ID): ${PORTAL_BASE_URL}/fip
 *     (live deploys can override via SAML_SP_ENTITY_ID — match what's
 *     registered as Audience URI on the Okta SAML app, or login fails)
 *   - RelayState: blank (driven by /auth/login)
 *
 * Flow:
 *   GET  /auth/login        → redirect to Okta with a SAMLRequest
 *   POST /auth/saml/acs     → validate SAMLResponse, mint session, redirect home
 *   GET  /auth/logout       → destroy session, redirect home
 *   GET  /api/auth/me       → identity for the React client + feature flags
 *   POST /auth/dev-login    → bypass (gated by FIP_ALLOW_DEV_LOGIN)
 *
 * Until the X.509 cert lands, samlConfigured stays false and devLoginEnabled
 * is on automatically, so the portal is still usable via /auth/dev-login.
 */

const { SAML } = require('@node-saml/node-saml')
const fs        = require('fs')

// ── Config (env-driven; defaults match the live box on 10.23.80.28) ────
const PORTAL_BASE_URL    = process.env.PORTAL_BASE_URL    || 'http://10.23.80.28'

const SAML_IDP_SSO_URL   = process.env.SAML_IDP_SSO_URL   || 'https://fp.okta.com/app/fp_forcepointenterpriseaiportalpending_1/exk23lnhuwbxNQ8YI1d8/sso/saml'
const SAML_IDP_ENTITY_ID = process.env.SAML_IDP_ENTITY_ID || 'http://www.okta.com/exk23lnhuwbxNQ8YI1d8'

// Load the IdP X.509 cert. Three accepted shapes, checked in order — the
// FILE form is preferred because systemd's EnvironmentFile silently strips
// backslashes from unquoted values (so a literal `\n` in the env value
// becomes just `n` and corrupts the PEM block, which is the bug we hit
// during the first live test). Operators should drop the cert at
// /etc/ai-portal/saml-idp.pem and set SAML_IDP_CERT_FILE to that path.
function loadIdpCert() {
  const filePath = process.env.SAML_IDP_CERT_FILE
  if (filePath) {
    try { return fs.readFileSync(filePath, 'utf8').trim() }
    catch (err) {
      console.error(`Cannot read SAML_IDP_CERT_FILE=${filePath}:`, err.message)
      return ''
    }
  }
  const raw = process.env.SAML_IDP_CERT || ''
  if (!raw) return ''
  // PEM already with real newlines (env value was quoted in api.env) — use as-is.
  if (raw.includes('\n')) return raw.trim()
  // Single-line PEM with literal \n separators that systemd has not stripped
  // (rare — only if someone double-escaped). Restore the newlines.
  if (raw.includes('\\n')) return raw.replace(/\\n/g, '\n').trim()
  // Base64-wrapped PEM (recommended workaround if a file isn't an option).
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8')
    if (decoded.includes('BEGIN')) return decoded.trim()
  } catch { /* fall through */ }
  return raw.trim()
}
const SAML_IDP_CERT = loadIdpCert()

const SAML_SP_ACS_URL    = process.env.SAML_SP_ACS_URL    || `${PORTAL_BASE_URL}/auth/saml/acs`
const SAML_SP_ENTITY_ID  = process.env.SAML_SP_ENTITY_ID  || `${PORTAL_BASE_URL}/fip`

const DEV_USER_EMAIL = process.env.FIP_DEV_USER_EMAIL || 'dev.user@forcepoint.com'
const DEV_USER_NAME  = process.env.FIP_DEV_USER_NAME  || 'Dev User'

const samlConfigured  = Boolean(SAML_IDP_CERT && SAML_IDP_SSO_URL && SAML_IDP_ENTITY_ID)
// Dev login is strictly opt-in via FIP_ALLOW_DEV_LOGIN=1. We deliberately do
// NOT auto-enable it when SAML is unconfigured: on the live box a transient
// cert read failure (e.g. wrong file group) would otherwise expose the dev
// bypass to anyone hitting the LoginPage, which is exactly the leak we want
// to prevent in production.
const devLoginEnabled = process.env.FIP_ALLOW_DEV_LOGIN === '1'

// ── Lazy SAML client ───────────────────────────────────────────────────
let _saml
function getSaml() {
  if (!samlConfigured) {
    throw new Error('SAML not configured (SAML_IDP_CERT missing or SAML_IDP_* incomplete).')
  }
  if (_saml) return _saml
  _saml = new SAML({
    entryPoint:              SAML_IDP_SSO_URL,
    issuer:                  SAML_SP_ENTITY_ID,
    callbackUrl:             SAML_SP_ACS_URL,
    idpIssuer:               SAML_IDP_ENTITY_ID,
    audience:                SAML_SP_ENTITY_ID,
    idpCert:                 SAML_IDP_CERT,
    identifierFormat:        'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    signatureAlgorithm:      'sha256',
    digestAlgorithm:         'sha256',
    wantAssertionsSigned:    true,
    wantAuthnResponseSigned: false,  // Okta signs the assertion; response signing is optional
    disableRequestedAuthnContext: true,
  })
  return _saml
}

// ── Identity helpers ───────────────────────────────────────────────────
function devIdentity() {
  const firstName = (DEV_USER_NAME || '').trim().split(/\s+/)[0]
                 || (DEV_USER_EMAIL || '').split('@')[0].replace(/[._-]+/g, ' ').split(' ')[0]
                 || 'User'
  return {
    authenticated: true,
    provider:      'dev',
    userId:        'dev-user',
    name:          DEV_USER_NAME,
    firstName,
    lastName:      null,
    email:         DEV_USER_EMAIL,
    roles:         ['authenticated'],
    issuer:        SAML_IDP_ENTITY_ID,
  }
}

function identityFromSamlProfile(profile) {
  // Okta SAML attributes vary by app config. Cover the common claim names.
  const get = (...keys) => {
    for (const k of keys) {
      if (profile[k] != null && profile[k] !== '') return profile[k]
    }
    return null
  }
  const email = get('email', 'Email', 'mail', 'urn:oid:0.9.2342.19200300.100.1.3') || profile.nameID
  const first = get('firstName', 'givenName', 'urn:oid:2.5.4.42')
  const last  = get('lastName', 'surname', 'familyName', 'urn:oid:2.5.4.4')
  const display = get('displayName', 'name', 'cn')

  // Derive a first name reliably. Corporate directories often emit
  // displayName="Last, First" (e.g. "Costigan, Jim"), so a naive split-on-
  // whitespace yields the LAST name. Handle the "Last, First" form first,
  // then "First Last", then fall back to the email local part.
  const firstFromAny = (s) => {
    if (!s) return null
    const t = String(s).trim()
    if (!t) return null
    if (t.includes(',')) {
      const after = t.slice(t.indexOf(',') + 1).trim()
      if (after) return after.split(/\s+/)[0]
    }
    return t.split(/\s+/)[0]
  }
  const firstName =
    first ||
    firstFromAny(display) ||
    firstFromAny((email || '').split('@')[0].replace(/[._-]+/g, ' '))

  // Full display name. Prefer "First Last" assembly when both claims exist,
  // since some directories ship displayName="Last, First" which reads oddly.
  // Fall back to whatever the directory sent.
  const name =
    (first && last ? `${first} ${last}` : null) ||
    display ||
    [first, last].filter(Boolean).join(' ').trim() ||
    email

  return {
    authenticated: true,
    provider:      'okta',
    userId:        profile.nameID || email,
    name,
    firstName,
    lastName:      last || null,
    email,
    roles:         Array.isArray(profile.groups) ? profile.groups : ['authenticated'],
    issuer:        SAML_IDP_ENTITY_ID,
  }
}

function resolveIdentity(req) {
  if (req?.session?.user) return req.session.user
  return null
}

// ── Diagnostic page (rendered when /auth/login can't proceed) ──────────
function renderSamlUnavailable(res, status, summary, hint) {
  res.status(status).type('text/html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Okta SAML sign-in unavailable</title>
  <style>
    body { margin: 0; min-height: 100vh; display:flex; align-items:center; justify-content:center;
           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           background: #f7f9fc; color: #0f172a; padding: 32px; }
    .card { max-width: 560px; background: #fff; border: 1px solid #e3e7ee; border-radius: 14px;
            padding: 28px 28px 22px; box-shadow: 0 16px 36px -22px rgba(15,23,42,.25); }
    h1 { margin: 0 0 8px; font-size: 18px; }
    p  { margin: 0 0 12px; font-size: 13.5px; color: #475569; line-height: 1.55; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
           background: #f1f5f9; padding: 1px 6px; border-radius: 4px; }
    a { color: #0d9b78; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Okta SAML sign-in is not yet available</h1>
    <p>${summary}</p>
    <p>${hint}</p>
    <p><a href="/">← Back to the portal</a></p>
  </div>
</body>
</html>`)
}

// ── Express routes ─────────────────────────────────────────────────────
function mountAuthRoutes(app, deps = {}) {
  const expressLib = deps.express || require('express')

  // GET /auth/login — initiate SP-initiated SSO
  app.get('/auth/login', async (req, res) => {
    if (!samlConfigured) {
      const missing = SAML_IDP_CERT ? '' : ' (<code>SAML_IDP_CERT</code> is empty)'
      return renderSamlUnavailable(res, 503,
        `The Okta SAML app is not yet fully configured on this server${missing}.`,
        'The Okta SAML app is being provisioned. Once the X.509 ' +
        'signing certificate lands in <code>/etc/ai-portal/api.env</code> as ' +
        '<code>SAML_IDP_CERT</code> and the service is restarted, this button will ' +
        'redirect to <code>' + SAML_IDP_SSO_URL + '</code>.')
    }
    try {
      const saml = getSaml()
      const relayState = safeReturnTo(req.query.returnTo) || '/'
      const url = await saml.getAuthorizeUrlAsync(relayState, undefined, {})
      res.redirect(url)
    } catch (err) {
      console.error('SAML /auth/login failed:', err)
      return renderSamlUnavailable(res, 500,
        'SAML AuthnRequest could not be built: ' + (err.message || 'unknown error'),
        'Confirm <code>SAML_IDP_CERT</code> is a valid PEM block and that ' +
        '<code>SAML_IDP_SSO_URL</code> is reachable from the box.')
    }
  })

  // POST /auth/saml/acs — Okta posts the SAMLResponse here
  app.post('/auth/saml/acs',
    expressLib.urlencoded({ extended: false, limit: '2mb' }),
    async (req, res) => {
      if (!samlConfigured) {
        return res.status(503).type('text/plain').send('SAML is not configured on this server.')
      }
      try {
        const saml = getSaml()
        const { profile, loggedOut } = await saml.validatePostResponseAsync(req.body)
        if (loggedOut || !profile) return res.redirect('/')
        req.session.user = identityFromSamlProfile(profile)
        const returnTo = safeReturnTo(req.body.RelayState) || '/'
        res.redirect(returnTo)
      } catch (err) {
        console.error('SAML ACS failed:', err)
        res.status(401).type('text/plain').send('SAML sign-in failed: ' + (err.message || 'unknown error'))
      }
    }
  )

  // POST /auth/dev-login — testing bypass
  app.post('/auth/dev-login', (req, res) => {
    if (!devLoginEnabled) {
      return res.status(403).json({ ok: false, error: 'Dev login is disabled.' })
    }
    req.session.user = devIdentity()
    res.json({ ok: true, user: req.session.user })
  })

  // GET /auth/logout — local session destroy (no SP-initiated SLO yet)
  app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('fip.sid')
      res.redirect('/')
    })
  })

  // GET /api/auth/me — identity + feature flags for the React client.
  // `oktaConfigured` reflects whether the SAML app is fully wired (cert +
  // IdP URLs all set); the LoginPage uses it to hide the "pending wiring"
  // pill on the SSO button.
  app.get('/api/auth/me', (req, res) => {
    res.set('Cache-Control', 'no-store')
    const identity = resolveIdentity(req)
    const features = {
      oktaConfigured:  samlConfigured,
      devLoginEnabled,
      authMode:        'saml',
    }
    if (!identity) return res.status(401).json({ authenticated: false, features })
    res.json({ ...identity, features })
  })
}

function requireAuth(req, res, next) {
  const identity = resolveIdentity(req)
  if (!identity) return res.status(401).json({ ok: false, error: 'Not authenticated' })
  req.user = identity
  next()
}

function safeReturnTo(input) {
  if (typeof input !== 'string') return '/'
  if (!input.startsWith('/') || input.startsWith('//')) return '/'
  return input
}

module.exports = {
  SAML_IDP_ENTITY_ID,
  SAML_IDP_SSO_URL,
  SAML_SP_ACS_URL,
  SAML_SP_ENTITY_ID,
  samlConfigured,
  resolveIdentity,
  devIdentity,
  mountAuthRoutes,
  requireAuth,
}
