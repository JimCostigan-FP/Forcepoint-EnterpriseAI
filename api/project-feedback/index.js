/**
 * api/project-feedback — captures "what would you want here?" feedback from the
 * in-development Project tab and commits it to the Forcepoint Enterprise AI
 * skills repository for review.
 *
 * The Project area is still under construction, so this form asks visitors three
 * open questions (what they expected to find, what they wish was here, and any
 * ideas) to steer what gets built. Identity is taken from the Okta SSO session
 * (AI-468) — the submitter only fills in the free-text prompts.
 *
 * Request body (JSON):
 *   {
 *     expected: string  // "what did you expect to find here?"
 *     wish:     string  // "what do you wish was here?"
 *     ideas:    string  // "what are your ideas for here?"
 *   }
 *   At least one field must be non-empty.
 *
 * Response:
 *   { ok: true, ref, commitUrl }
 *   { ok: false, error }
 */

const https = require("https");
const { URL } = require("url");

const GITHUB_HOST   = process.env.GITHUB_HOST   || "https://github.cicd.cloud.fpdev.io";
const GITHUB_API    = process.env.GITHUB_API    || "https://github.cicd.cloud.fpdev.io/api/v3";
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || "BTS";
const GITHUB_REPO   = process.env.GITHUB_REPO   || "EAI-claude-skills";
const GITHUB_BRANCH = process.env.GITHUB_TRIAGE_BRANCH         || "main";
const GITHUB_PATH   = process.env.GITHUB_PROJECT_FEEDBACK_PATH || "project-feedback";
const HOPPER_TOKEN  = process.env.GITHUB_HOPPER_TOKEN          || "";

const MAX_FIELD_CHARS = 4000; // generous cap per free-text answer

function newReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PROJ-${ts}-${rand}`;
}

function clean(input) {
  if (!input) return "";
  return String(input).trim().slice(0, MAX_FIELD_CHARS);
}

function ghRequest(path, { method = "GET", body = null } = {}) {
  const url = new URL(`${GITHUB_API}${path}`);
  const payload = body ? Buffer.from(JSON.stringify(body)) : null;
  const options = {
    method,
    hostname: url.hostname,
    port:     url.port || 443,
    path:     `${url.pathname}${url.search}`,
    headers: {
      "Authorization":        `Bearer ${HOPPER_TOKEN}`,
      "Accept":               "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent":           "Project-Feedback/1.0",
      ...(payload ? {
        "Content-Type":   "application/json",
        "Content-Length": payload.length,
      } : {}),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        const parsed = data ? safeParse(data) : null;
        resolve({ status: res.statusCode, body: parsed, raw: data });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

module.exports = async function (context, req) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers, body: "" };
    return;
  }
  if (req.method !== "POST") {
    context.res = { status: 405, headers, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
    return;
  }

  // ── Identity ──────────────────────────────────────────────────────────
  // server/index.cjs gates this route with okta.requireAuth and stamps the
  // resolved Okta identity onto req.user before the adapter runs.
  const identity = req.user;
  if (!identity) {
    context.res = { status: 401, headers, body: JSON.stringify({ ok: false, error: "Not authenticated" }) };
    return;
  }

  // ── Validate body ─────────────────────────────────────────────────────
  const expected = clean(req.body?.expected);
  const wish     = clean(req.body?.wish);
  const ideas    = clean(req.body?.ideas);
  if (!expected && !wish && !ideas) {
    context.res = { status: 400, headers, body: JSON.stringify({ ok: false, error: "Please answer at least one prompt." }) };
    return;
  }
  if (!HOPPER_TOKEN) {
    context.log.error("GITHUB_HOPPER_TOKEN not configured");
    context.res = { status: 500, headers, body: JSON.stringify({ ok: false, error: "Hopper credentials not configured on the server." }) };
    return;
  }

  const ref         = newReference();
  const submittedAt = new Date().toISOString();
  const safePath    = `${GITHUB_PATH.replace(/\/+$/, "")}/${ref}.json`;

  // When the submitter opts out, we record nothing that identifies them — not
  // even their email in the commit message. Auth is still required to reach
  // this endpoint, but the stored record stays anonymous.
  const anonymous = req.body?.anonymous === true;
  const submitter = anonymous
    ? { anonymous: true }
    : { name: identity.name || null, email: identity.email || null, ssoProvider: identity.provider || null };

  const record = {
    ref,
    submittedAt,
    submitter,
    expected,
    wish,
    ideas,
  };

  const content = Buffer.from(JSON.stringify(record, null, 2), "utf8").toString("base64");
  const commit = await ghRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(safePath)}`,
    {
      method: "PUT",
      body: {
        message: `project-feedback: ${ref} (${anonymous ? "anonymous" : (identity.email || "unknown")})`,
        branch:  GITHUB_BRANCH,
        content,
      },
    }
  );
  if (commit.status >= 300) {
    context.log.error("Hopper feedback commit failed:", commit.status, commit.raw);
    context.res = {
      status: 502, headers,
      body: JSON.stringify({ ok: false, error: `GitHub upload failed (HTTP ${commit.status}).` }),
    };
    return;
  }

  context.res = {
    status: 201,
    headers,
    body: JSON.stringify({
      ok:        true,
      ref,
      commitUrl: commit.body?.content?.html_url || `${GITHUB_HOST}/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${safePath}`,
      submittedAt,
    }),
  };
};
