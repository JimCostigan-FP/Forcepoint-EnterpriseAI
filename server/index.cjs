const express = require("express");
const askFn = require("../api/ask/index.js");

const app = express();
app.use(express.json({ limit: "1mb" }));

function adapt(azureFn) {
  return async (req, res) => {
    const context = {
      log: Object.assign((...a) => console.log(...a), {
        info:  (...a) => console.log(...a),
        warn:  (...a) => console.warn(...a),
        error: (...a) => console.error(...a),
      }),
      res: null,
    };
    const azureReq = { method: req.method, headers: req.headers, body: req.body };
    try {
      await azureFn(context, azureReq);
    } catch (err) {
      console.error("Adapter error:", err);
      if (!context.res) context.res = { status: 500, headers: {}, body: JSON.stringify({ error: "Internal error" }) };
    }
    const out = context.res || { status: 500, headers: {}, body: "" };
    for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
    res.status(out.status || 200).send(out.body);
  };
}

app.post("/api/ask",    adapt(askFn));
app.options("/api/ask", adapt(askFn));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "127.0.0.1", () => console.log(`api listening on 127.0.0.1:${PORT}`));
