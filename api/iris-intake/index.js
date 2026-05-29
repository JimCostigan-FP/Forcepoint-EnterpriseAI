/**
 * api/iris-intake — drops a submitted zip into the Forcepoint Enterprise AI
 * skills repository under a triage folder for Jim Costigan to promote.
 *
 * Jira: AI-471 (Iris Skills Portal MVP — Low-Friction Skill Intake to GitHub)
 *
 * MVP contract per Mathew Steele's May 27 sync: name + zip is the only
 * required input from the submitter. Everything else is optional and stays
 * out of the validation path. Identity is taken from the Okta SSO session
 * (AI-468) so the form ships the user a tracking reference and a confirmation,
 * with the upload happening server-side using a service token (GitHub auth
 * for end-user PATs is the larger AI-453 question).
 *
 * Request body (JSON):
 *   {
 *     name:        string  required  // submitter display name
 *     zipBase64:   string  required  // base64-encoded zip file
 *     zipFilename: string  required  // original filename
 *     description: string  optional
 *     tier:        string  optional
 *     useCase:     string  optional
 *     owner:       string  optional
 *   }
 *
 * Response:
 *   { ok: true, ref, path, branch, commitUrl }
 *   { ok: false, error }
 */

const https = require("https");
const { URL } = require("url");

const GITHUB_HOST    = process.env.GITHUB_HOST    || "https://github.cicd.cloud.fpdev.io";
const GITHUB_API     = process.env.GITHUB_API     || "https://github.cicd.cloud.fpdev.io/api/v3";
const GITHUB_OWNER   = process.env.GITHUB_OWNER   || "BTS";
const GITHUB_REPO    = process.env.GITHUB_REPO    || "EAI-claude-skills";
const GITHUB_BRANCH  = process.env.GITHUB_TRIAGE_BRANCH || "main";
const GITHUB_PATH    = process.env.GITHUB_TRIAGE_PATH   || "triage/incoming";
const HOPPER_TOKEN   = process.env.GITHUB_HOPPER_TOKEN  || "";

const MAX_ZIP_BYTES = 25 * 1024 * 1024; // 25 MB hard cap on the intake payload

function newReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IRIS-${ts}-${rand}`;
}

function sanitiseFilename(input) {
  if (!input) return "submission.zip";
  const base = input.replace(/[\\/]/g, "").trim() || "submission.zip";
  const safe = base.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
  return safe.toLowerCase().endsWith(".zip") ? safe : `${safe}.zip`;
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
      "Authorization":         `Bearer ${HOPPER_TOKEN}`,
      "Accept":                "application/vnd.github+json",
      "X-GitHub-Api-Version":  "2022-11-28",
      "User-Agent":            "Iris-Intake/1.0",
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
  // resolved Okta identity onto req.user before the adapter runs. If we got
  // here without one, treat it as anonymous.
  const identity = req.user;
  if (!identity) {
    context.res = { status: 401, headers, body: JSON.stringify({ ok: false, error: "Not authenticated" }) };
    return;
  }

  // ── Validate body ─────────────────────────────────────────────────────
  const { name, zipBase64, zipFilename, description, tier, useCase, owner } = req.body || {};
  if (!name || !String(name).trim()) {
    context.res = { status: 400, headers, body: JSON.stringify({ ok: false, error: "Submitter name is required." }) };
    return;
  }
  if (!zipBase64 || !zipFilename) {
    context.res = { status: 400, headers, body: JSON.stringify({ ok: false, error: "A zip file is required." }) };
    return;
  }
  if (zipBase64.length * 0.75 > MAX_ZIP_BYTES) {
    context.res = { status: 413, headers, body: JSON.stringify({ ok: false, error: `Zip exceeds ${MAX_ZIP_BYTES / 1024 / 1024} MB.` }) };
    return;
  }
  if (!HOPPER_TOKEN) {
    context.log.error("GITHUB_HOPPER_TOKEN not configured");
    context.res = { status: 500, headers, body: JSON.stringify({ ok: false, error: "Hopper credentials not configured on the server." }) };
    return;
  }

  const ref      = newReference();
  const filename = sanitiseFilename(zipFilename);
  const safePath = `${GITHUB_PATH.replace(/\/+$/, "")}/${ref}/${filename}`;
  const metaPath = `${GITHUB_PATH.replace(/\/+$/, "")}/${ref}/submission.json`;

  const submitter = String(name).trim();
  const submittedAt = new Date().toISOString();
  const metadata = {
    ref,
    submittedAt,
    submitter:    { name: submitter, email: identity.email, ssoProvider: identity.provider },
    optional:     {
      description: description ? String(description).trim() : null,
      tier:        tier        ? String(tier).trim()        : null,
      useCase:     useCase     ? String(useCase).trim()     : null,
      owner:       owner       ? String(owner).trim()       : null,
    },
    sourceFilename: zipFilename,
  };

  // ── Commit the zip (binary path) ──────────────────────────────────────
  const zipCommit = await ghRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(safePath)}`,
    {
      method: "PUT",
      body: {
        message: `iris: skill submission ${ref} (${submitter})`,
        branch:  GITHUB_BRANCH,
        content: String(zipBase64).replace(/\s+/g, ""),
      },
    }
  );
  if (zipCommit.status >= 300) {
    context.log.error("Hopper zip commit failed:", zipCommit.status, zipCommit.raw);
    context.res = {
      status: 502, headers,
      body: JSON.stringify({ ok: false, error: `GitHub upload failed (HTTP ${zipCommit.status}).` }),
    };
    return;
  }

  // ── Commit the submission.json alongside ──────────────────────────────
  const metaContent = Buffer.from(JSON.stringify(metadata, null, 2), "utf8").toString("base64");
  const metaCommit = await ghRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(metaPath)}`,
    {
      method: "PUT",
      body: {
        message: `iris: metadata for ${ref}`,
        branch:  GITHUB_BRANCH,
        content: metaContent,
      },
    }
  );
  // Metadata write is best-effort — a missing sidecar should not fail the user's submission.
  if (metaCommit.status >= 300) {
    context.log.warn("Hopper metadata sidecar failed:", metaCommit.status, metaCommit.raw);
  }

  context.res = {
    status: 201,
    headers,
    body: JSON.stringify({
      ok:        true,
      ref,
      path:      safePath,
      branch:    GITHUB_BRANCH,
      commitUrl: zipCommit.body?.content?.html_url || `${GITHUB_HOST}/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${safePath}`,
      submitter: { name: submitter, email: identity.email },
      submittedAt,
    }),
  };
};
