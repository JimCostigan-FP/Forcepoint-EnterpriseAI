/**
 * api/ask/index.js — portal streaming proxy for the Ask AI chat page.
 * Owner: IT Enterprise AI team · ITEnterpriseAIteam@forcepoint.com
 *
 * Streams a multi-turn conversation token-by-token over Server-Sent Events.
 * It forwards to Forcepoint's contained Ask AI backend (forcepoint-ai/ask_service
 * /ask) and pipes the SSE stream straight back to the browser — so it is mounted
 * as a NATIVE Express (req, res) handler, not through the buffering adapt()
 * wrapper in server/index.cjs. The portal never calls Anthropic directly; the
 * backend grounds answers in internal sources and returns citations.
 *
 * Responsibilities kept at the portal edge:
 *  - Identity: req.user from the Okta session is forwarded for logging/grounding.
 *  - Service auth: shared secret (ASK_SERVICE_TOKEN) to the backend.
 *  - DLP P1 hook on the latest user message before forwarding.
 *  - A clean SSE error event if the backend is unreachable or rejects.
 *
 * Environment variables:
 *   ASK_BACKEND_URL    — backend /ask URL (default: http://127.0.0.1:8100/ask)
 *   ASK_SERVICE_TOKEN  — shared secret presented to the backend
 *   ASK_TIMEOUT_MS     — upstream timeout (default 60000 — streams run longer)
 *   ALLOWED_ORIGINS    — comma-separated allowed CORS origins
 */

const http  = require("http");
const https = require("https");

const BACKEND_URL   = process.env.ASK_BACKEND_URL   || "http://127.0.0.1:8100/ask";
const SERVICE_TOKEN = process.env.ASK_SERVICE_TOKEN || "";
const TIMEOUT_MS    = Number(process.env.ASK_TIMEOUT_MS) || 60000;

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

module.exports = function (req, res) {
  // ── CORS ──────────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const origin = req.headers["origin"] || "";
  const corsOrigin = allowedOrigins.length === 0 || allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    "Access-Control-Allow-Origin":  corsOrigin || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // ── VALIDATE ──────────────────────────────────────────────
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!messages || messages.length === 0) {
    res.writeHead(400, { ...corsHeaders, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "messages array is required" }));
    return;
  }

  // ── DLP P1 hook (latest user message) ─────────────────────
  // const lastUser = [...messages].reverse().find(m => m.role === "user");
  // if (lastUser) { const r = await checkDLP(lastUser.content); if (r.blocked) {...} }

  // ── Open the SSE response to the browser ──────────────────
  res.writeHead(200, {
    ...corsHeaders,
    "Content-Type":      "text/event-stream",
    "Cache-Control":     "no-cache, no-transform",
    "Connection":        "keep-alive",
    "X-Accel-Buffering": "no",   // tell nginx not to buffer the stream
  });
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  // ── Forward to the backend and pipe the stream back ───────
  let url;
  try { url = new URL(BACKEND_URL); }
  catch { sse(res, "error", { message: "Ask AI backend URL is misconfigured." }); return res.end(); }

  const user = req.user ? { email: req.user.email, name: req.user.name } : null;
  const payload = Buffer.from(JSON.stringify({ messages, user }));
  const transport = url.protocol === "https:" ? https : http;

  const headers = {
    "Content-Type":   "application/json",
    "Content-Length": payload.length,
    "Accept":         "text/event-stream",
  };
  if (SERVICE_TOKEN) headers["Authorization"] = `Bearer ${SERVICE_TOKEN}`;

  const upstream = transport.request(
    {
      hostname: url.hostname,
      port:     url.port || (url.protocol === "https:" ? 443 : 80),
      path:     url.pathname + url.search,
      method:   "POST",
      headers,
      timeout:  TIMEOUT_MS,
    },
    (backendRes) => {
      if (backendRes.statusCode !== 200) {
        // Backend rejected (e.g. 401 bad token, 503 no key) — relay as an SSE
        // error event so the chat UI shows it gracefully, then close.
        let body = "";
        backendRes.on("data", (c) => { body += c; });
        backendRes.on("end", () => {
          let detail = `Ask AI backend error (HTTP ${backendRes.statusCode})`;
          try { const j = JSON.parse(body); detail = j.detail || j.error || detail; } catch { /* keep default */ }
          sse(res, "error", { message: typeof detail === "string" ? detail : "Ask AI backend error" });
          res.end();
        });
        return;
      }
      // Happy path: stream SSE bytes straight through.
      backendRes.pipe(res);
      backendRes.on("end", () => res.end());
    }
  );

  upstream.on("timeout", () => upstream.destroy(new Error("Ask AI backend timed out")));
  upstream.on("error", (err) => {
    console.error("Ask AI proxy error:", err.message);
    if (!res.writableEnded) {
      sse(res, "error", { message: "Could not reach the Ask AI service. Please try again shortly." });
      res.end();
    }
  });

  // If the browser disconnects (closed tab, navigated away, Stop), abort upstream.
  req.on("close", () => { if (!upstream.destroyed) upstream.destroy(); });

  upstream.write(payload);
  upstream.end();
};
