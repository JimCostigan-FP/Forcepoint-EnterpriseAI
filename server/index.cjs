/**
 * FIP portal API server — mounts the Okta SAML routes, express-session,
 * and the application endpoints (/api/ask, /api/fip-intake, /api/health).
 *
 * Target deployment: Forcepoint internal Linux box at 10.23.80.28, fronted
 * by nginx. For local dev, omit the SAML env vars and the server enables
 * /auth/dev-login as the sign-in path — see auth/okta.cjs.
 */

const express = require("express");
const session = require("express-session");
const path    = require("path");
const fs      = require("fs");

const askFn       = require("../api/ask/index.js");
const fipIntakeFn = require("../api/fip-intake/index.js");
const okta        = require("../auth/okta.cjs");

const app = express();

// Trust the front-end proxy (nginx / Forcepoint ZTNA) so X-Forwarded-Proto
// reaches Express — necessary the day TLS lands in front of the box and
// `secure` cookies start being required.
app.set("trust proxy", 1);

// FIP zip uploads ship as base64 JSON — raise the limit accordingly (the
// handler also enforces a 25 MB payload cap).
app.use(express.json({ limit: "35mb" }));

// ── Session (Okta SAML state lives here) ───────────────────────────────
// SESSION_SECRET must be set in production. The fallback rotates each boot,
// invalidating all sessions on restart — fine for first run, not for prod.
const SESSION_SECRET = process.env.SESSION_SECRET || `fip-dev-${Date.now()}`;

// Cookie security tracks the *deployment scheme*, not NODE_ENV. On the
// current HTTP-only box (http://10.23.80.28), `secure: true` would silently
// drop login cookies. Override with COOKIE_SECURE=1/0 if you need to force
// either side (e.g., behind a TLS-terminating proxy that doesn't set
// X-Forwarded-Proto correctly).
const portalIsHttps = (process.env.PORTAL_BASE_URL || "").startsWith("https://");
const cookieSecure  = process.env.COOKIE_SECURE === "1" ? true
                    : process.env.COOKIE_SECURE === "0" ? false
                    : portalIsHttps;

app.use(session({
  name:    "fip.sid",
  secret:  SESSION_SECRET,
  resave:  false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   cookieSecure,
    sameSite: "lax",
    maxAge:   8 * 60 * 60 * 1000,               // 8 hours
  },
}));

// ── Okta SAML routes (/auth/login, /auth/saml/acs, /auth/logout, /api/auth/me)
okta.mountAuthRoutes(app);

// ── Adapter: lets the (context, req) handlers in api/ run under Express,
// with the resolved Okta identity attached to req.user. The calling
// convention is kept portable so handlers can move to other runtimes later.
function adapt(handlerFn) {
  return async (req, res) => {
    const context = {
      log: Object.assign((...a) => console.log(...a), {
        info:  (...a) => console.log(...a),
        warn:  (...a) => console.warn(...a),
        error: (...a) => console.error(...a),
      }),
      res: null,
    };
    const handlerReq = {
      method:  req.method,
      headers: req.headers,
      body:    req.body,
      user:    okta.resolveIdentity(req),
    };
    try {
      await handlerFn(context, handlerReq);
    } catch (err) {
      console.error("Adapter error:", err);
      if (!context.res) context.res = { status: 500, headers: {}, body: JSON.stringify({ error: "Internal error" }) };
    }
    const out = context.res || { status: 500, headers: {}, body: "" };
    for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
    res.status(out.status || 200).send(out.body);
  };
}

// ── Authenticated API endpoints ────────────────────────────────────────
app.post("/api/ask",    okta.requireAuth, adapt(askFn));
app.options("/api/ask",                   adapt(askFn));

app.post("/api/fip-intake",    okta.requireAuth, adapt(fipIntakeFn));
app.options("/api/fip-intake",                   adapt(fipIntakeFn));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ── Static React bundle (production) ───────────────────────────────────
// On 10.23.80.28 we serve the built bundle from this same process so the
// box is a single `node server/index.cjs` deploy. In dev, vite serves the
// React app on :5173 and proxies /api + /auth back to this process.
const distDir = path.resolve(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));
  // SPA fallback — any non-/api, non-/auth path returns index.html.
  app.get(/^\/(?!api|auth|\.).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// ── Listen ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT  || 3000;
const HOST = process.env.HOST  || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`FIP API listening on ${HOST}:${PORT}`);
  if (!okta.samlConfigured) {
    console.warn("⚠  Okta SAML is not yet configured (SAML_IDP_CERT missing).");
    console.warn("   Dev login is enabled — sign in via /auth/dev-login.");
  }
});
