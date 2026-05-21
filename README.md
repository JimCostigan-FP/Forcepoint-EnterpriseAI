# Forcepoint Enterprise AI Portal

The Forcepoint Enterprise AI Portal is an internal web application that centralizes AI guidance, governance, and adoption workflows for Forcepoint teams. It combines curated enablement content with secure assistant access and skill lifecycle tooling in one authenticated experience.

## Project Purpose

This project exists to provide a single trusted destination for:

- Practical AI onboarding content (how-tos, prompts, events, and news)
- Departmental AI ambassador program support
- Skill lifecycle support (drafting, packaging, and submission)
- Secure enterprise AI assistance aligned to Forcepoint policy
- Architecture and ownership clarity between IT and business teams

## Key Capabilities

- React single-page portal with section-based navigation
- Auth-protected access through Azure Static Web Apps + Microsoft Entra ID
- Server-side proxy endpoint for Anthropic API calls at `/api/ask`
- Content-driven UI powered by versioned source data
- Skill tooling:
  - Skill package builder (`SKILL.md` ZIP generation)
  - Skill submission flow with GitHub file/PR automation
  - Guided metadata and documentation generation support

## Portal Sections

- Overview
- How-tos & tips
- Latest news
- Skills library
- Prompt showcase
- Events
- AI Ambassador
- Architecture & IT
- The Signal

## Technical Architecture

### Frontend

- Framework: React 18
- Build tool: Vite 5
- Entry point: `src/main.jsx`
- App shell and section orchestration: `src/App.jsx`

### API

- Runtime: Azure Functions (Node.js 20)
- Endpoint: `api/ask/index.js`
- Purpose:
  - Keep Anthropic API credentials server-side
  - Enable centralized policy controls (DLP, logging, throttling)
  - Return model responses to authenticated portal clients

### Platform and Security

- Hosting target: Azure Static Web Apps
- Auth model: Entra ID via Static Web Apps EasyAuth
- Route protection: authenticated access required for `/*` and `/api/*`
- Security headers and SPA fallback configured in `staticwebapp.config.json`

## Repository Structure

```text
Forcepoint-EnterpriseAI/
├── src/
│   ├── main.jsx                         # React bootstrap (also primes layout state pre-paint)
│   ├── App.jsx                          # Shell: sidebar + topbar + section routing + theme
│   │
│   ├── styles/
│   │   └── portal.css                   # Single design-system stylesheet (tokens + components)
│   │
│   ├── data/
│   │   └── portal.js                    # Content model for all sections (PORTAL_DATA)
│   │
│   ├── lib/
│   │   └── date.js                      # Shared date/time helpers (parse, format, today)
│   │
│   ├── content/
│   │   └── signal/                      # Newsletter HTML imported as ?raw by SignalSection
│   │
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.jsx              # Grouped vertical nav
│       │   ├── Topbar.jsx               # Brand + breadcrumb + search + actions + profile
│       │   ├── Footer.jsx               # Site footer
│       │   └── AskAIFloat.jsx           # Floating AI launcher (sole AI entry)
│       │
│       ├── ui/
│       │   └── icons.jsx                # SVG icon set (single source for all icons)
│       │
│       ├── skills/
│       │   ├── SkillBuilder.jsx         # In-browser SKILL.md ZIP authoring tool
│       │   ├── SkillSubmit.jsx          # Governance pipeline + GitHub PR flow
│       │   └── GoSacBuilder.jsx         # Bonus live-data skill walkthrough
│       │
│       └── sections/
│           ├── HomeSection.jsx          # Dashboard: hero + stats + pinned + activity + insight
│           ├── SkillsSection.jsx
│           ├── PromptsSection.jsx
│           ├── HowtosSection.jsx
│           ├── EventsSection.jsx        # Calendar + filter chips + grouped event cards
│           ├── NewsSection.jsx
│           ├── AmbassadorSection.jsx
│           ├── ArchitectureSection.jsx
│           └── SignalSection.jsx
│
├── api/
│   └── ask/index.js                     # Azure Function — Anthropic proxy
├── index.html                           # Vite HTML entry (preconnect + theme bootstrap)
├── staticwebapp.config.json             # Auth, headers, routing, API runtime
├── vite.config.js                       # Vite + React plugin config
├── package.json                         # Scripts and dependencies
├── .env / .env.example                  # VITE_GITHUB_PAT for SkillSubmit (local dev)
└── README.md
```

Conventions:

- **Tokens** (colors, spacing, typography, radii, shadows, motion) live only in `src/styles/portal.css` `:root` and `[data-theme="dark"]`. Never hard-code colors in component rules or JSX inline styles.
- **Reusable primitives** (`.btn`, `.icon-btn`, `.badge`, `.card`, `.input`, `.field`, `.list-items`, etc.) are defined once in `portal.css` and referenced by every component.
- **Naming**: `.component-name`, `.component-name-element`, `.component-name.is-state`, `.component-name.tone-x`. Keep flat selectors, max 2 levels of nesting.
- **No legacy static assets**: the React app is the single implementation. Old `css/` and `js/` directories were removed.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 9 or later

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Default dev URL: [http://localhost:5173](http://localhost:5173)

### Build and preview production output

```bash
npm run build
npm run preview
```

### Troubleshooting

#### `npm install` fails with an OpenSSL version mismatch

If `npm install` errors with a message about `libssl` / OpenSSL symbol versions (for
example `version 'OPENSSL_3.4.0' not found`), the system-installed Node.js was compiled
against a newer OpenSSL than what's available on the server. This is common on older
Oracle/RHEL hosts.

Check the system OpenSSL version:

```bash
openssl version
```

The fix is to install Node.js through **nvm**, which ships its own bundled OpenSSL and
avoids the system library conflict:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install a compatible Node.js version
nvm install 20
nvm use 20

# Verify
node --version
npm --version
```

Then re-run `npm install`. Node.js 20 is the supported runtime for this project and
avoids the OpenSSL 3.4 dependency that ships with Node.js 22.

## Run Process (Step-by-Step)

Use this process for day-to-day development and release preparation.

### 1) Sync and install

```bash
git pull
npm install
```

### 2) Start local development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and verify:

- Navigation between all portal sections
- Content rendering from `src/data/portal.js`
- No console errors in the browser

### 3) Validate assistant mode before testing

In `src/App.jsx`, decide how the assistant calls should run when wiring up `askAI`/`askQuick`:

- `USE_PROXY: false` for temporary local direct testing
- `USE_PROXY: true` for proxy-based behavior aligned to production

### 4) Make and verify content/app changes

- Update content in `src/data/portal.js` and/or section components in `src/components/sections/`
- Re-check impacted pages
- Validate any skill tooling flow if touched (`SkillBuilder`, `SkillSubmit`)

### 5) Build before commit/deploy

```bash
npm run build
```

Confirm the build succeeds without errors.

### 6) Deploy process (high level)

1. Merge approved changes to the deployment branch.
2. Ensure Static Web App app settings/secrets are present.
3. Let GitHub Actions deploy to Azure Static Web Apps.
4. Run post-deploy smoke checks:
   - Auth redirect and sign-in
   - Portal page load and section navigation
   - `/api/ask` proxy response path
   - Security headers and protected routes

## Configuration

### Frontend assistant configuration

The AI assistant is currently a UI stub — `askAI` and `askQuick` in `src/App.jsx` surface a toast.
To wire a real backend, replace the bodies of those handlers with a call to your endpoint
(e.g. `POST /api/ask`). The Azure Function at `api/ask/index.js` is already provisioned with
DLP hooks and an Anthropic proxy implementation; it just needs the client side to call it.

Suggested signature:

```js
async function askAI(question) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  // render the response in your assistant surface
}
```

### Skill submission integration

`src/components/skills/SkillSubmit.jsx` uses:

- `VITE_GITHUB_PAT`

This token is consumed in-browser for GitHub content + PR operations. Keep scope minimal, treat as sensitive, and prefer moving this flow server-side for long-term hardening.

### Proxy environment variables

Configure in Azure Function / Static Web Apps settings (prefer Key Vault references):

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (for example `claude-sonnet-4-20250514`)
- `ALLOWED_ORIGINS` (comma-separated CORS allowlist)

## Deployment Overview (Azure Static Web Apps)

1. Provision a Static Web App (Standard SKU recommended for enterprise auth scenarios).
2. Configure Entra ID:
   - Replace `YOUR_TENANT_ID` in `staticwebapp.config.json` (`openIdIssuer`)
   - Set `AZURE_CLIENT_ID` and `AZURE_CLIENT_SECRET` app settings
3. Configure proxy secrets/settings (`ANTHROPIC_*`, `ALLOWED_ORIGINS`).
4. Deploy via connected GitHub Actions CI/CD (recommended) or upload workflow.

## Self-Hosted Deployment (Linux + nginx, VPN-only)

For internal previews on a VPN-restricted Oracle Linux / RHEL host (e.g. `http://10.23.80.28/`),
the app can be served by nginx with the Azure Function adapted to a local Node service.

> **Security note:** This setup has **no Entra ID authentication** — the VPN is the perimeter.
> EasyAuth (`staticwebapp.config.json`) is bypassed in self-host. Only use on networks where
> every reachable client is already trusted.

### Architecture

```text
            ┌────────────────────────────────────────────────┐
 VPN client │  nginx :80                                     │
 ──────────▶│   ├── /            → /var/www/ai-portal (dist) │
            │   └── /api/*       → 127.0.0.1:3000            │
            │                          │                     │
            │                          ▼                     │
            │                ai-portal-api.service           │
            │            (node server/index.cjs, loads       │
            │             api/ask/index.js as a function)    │
            └────────────────────────────────────────────────┘
```

Key files added for self-hosting:

- `server/index.cjs` — Express adapter that exposes `api/ask/index.js` over HTTP
- `api/package.json` — scopes the Function code as CommonJS (project root uses ESM)
- `/etc/ai-portal/api.env` — env file consumed by the systemd unit (mode `0600`, `root:root`)
- `/etc/systemd/system/ai-portal-api.service` — systemd unit for the Node API
- `/etc/nginx/conf.d/ai-portal.conf` — nginx site (static + `/api/` reverse proxy + SPA fallback)

### One-time setup

1. **Install nginx and Node 20 (via nvm).** See the OpenSSL troubleshooting note above if the
   system `node` is broken.

   ```bash
   sudo dnf install -y nginx
   sudo systemctl enable --now nginx
   ```

2. **Build the frontend and deploy `dist/` to a path nginx can read.**

   ```bash
   export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
   npm install
   npm run build
   sudo mkdir -p /var/www/ai-portal
   sudo rsync -a --delete dist/ /var/www/ai-portal/
   sudo chown -R nginx:nginx /var/www/ai-portal
   ```

   `~/` is typically mode `700`, so nginx (running as `nginx`) cannot traverse into a user
   home — always deploy the built site to `/var/www/`.

3. **Create the API env file** (fill `ANTHROPIC_API_KEY` later if you don't have it yet):

   ```bash
   sudo install -d -m 0755 /etc/ai-portal
   sudo tee /etc/ai-portal/api.env >/dev/null <<'EOF'
   ANTHROPIC_API_KEY=
   ANTHROPIC_MODEL=claude-sonnet-4-20250514
   ALLOWED_ORIGINS=http://10.23.80.28
   PORT=3000
   EOF
   sudo chmod 600 /etc/ai-portal/api.env
   sudo chown root:root /etc/ai-portal/api.env
   ```

4. **Install the systemd unit** (adjust `User=` and the `node` path for your host):

   ```ini
   # /etc/systemd/system/ai-portal-api.service
   [Unit]
   Description=AI Portal /api/ask (Express adapter for Azure Function)
   After=network-online.target
   Wants=network-online.target

   [Service]
   Type=simple
   User=mcontreras
   Group=mcontreras
   WorkingDirectory=/home/mcontreras/Forcepoint/Forcepoint-EnterpriseAI
   EnvironmentFile=/etc/ai-portal/api.env
   ExecStart=/home/mcontreras/.nvm/versions/node/v20.20.2/bin/node server/index.cjs
   Restart=on-failure
   RestartSec=3

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now ai-portal-api
   curl -s http://127.0.0.1:3000/api/health    # → {"ok":true}
   ```

5. **Install the nginx site** (replace the shipped welcome page):

   ```nginx
   # /etc/nginx/conf.d/ai-portal.conf
   server {
       listen       80 default_server;
       listen       [::]:80 default_server;
       server_name  _;

       root  /var/www/ai-portal;
       index index.html;

       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options        "SAMEORIGIN" always;
       add_header X-XSS-Protection       "1; mode=block" always;
       add_header Referrer-Policy        "strict-origin-when-cross-origin" always;
       add_header Permissions-Policy     "geolocation=(), microphone=(), camera=()" always;

       location /api/ {
           proxy_pass         http://127.0.0.1:3000/api/;
           proxy_http_version 1.1;
           proxy_set_header   Host              $host;
           proxy_set_header   X-Real-IP         $remote_addr;
           proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
           proxy_set_header   X-Forwarded-Proto $scheme;
           proxy_read_timeout 120s;
       }

       location /assets/ {
           try_files $uri =404;
           access_log off;
           expires 30d;
           add_header Cache-Control "public, immutable";
       }

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   Comment out the default `server { ... }` block inside `/etc/nginx/nginx.conf` (the Oracle
   welcome page) so this site becomes the only listener on port 80, then:

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. **Open port 80 in firewalld:**

   ```bash
   sudo firewall-cmd --add-port=80/tcp --permanent
   sudo firewall-cmd --reload
   ```

7. **Smoke-test from another VPN client:**

   ```bash
   curl -sI http://10.23.80.28/                       # 200 OK, text/html
   curl -s  http://10.23.80.28/api/health             # {"ok":true}
   curl -s  -X POST http://10.23.80.28/api/ask \
        -H 'Content-Type: application/json' \
        -d '{"message":"hi"}'                         # requires ANTHROPIC_API_KEY
   ```

### Day-to-day operations

**Redeploy after frontend changes:**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
npm run build
sudo rsync -a --delete dist/ /var/www/ai-portal/
```

No nginx reload needed for content-only changes.

**Restart the API (after editing `/etc/ai-portal/api.env` or `server/index.cjs`):**

```bash
sudo systemctl restart ai-portal-api
sudo journalctl -u ai-portal-api -f       # tail logs
```

**Set the Anthropic key:**

```bash
sudo nano /etc/ai-portal/api.env          # set ANTHROPIC_API_KEY=...
sudo systemctl restart ai-portal-api
```

### Caveats

- HTTP only. For TLS, add a `listen 443 ssl` block with a cert from your internal CA.
- No Entra auth; rely on VPN. If you need auth, prefer Azure SWA over self-host.
- The DLP `TODO` hooks in `api/ask/index.js` apply identically in self-host — wire them
  before any wider rollout.

## Security and Governance Notes

- Never commit API keys, PATs, or client secrets.
- `api/ask/index.js` contains explicit DLP insertion points:
  - P1: pre-prompt forwarding
  - P3: pre-response return
- All portal routes and API routes require authentication.
- Assistant system instructions are designed to reinforce Forcepoint AI policy and safe-response behavior.

## Content Management

Most editorial content is centralized in `src/data/portal.js`, including:

- How-tos
- News
- Skills catalog cards
- Prompt examples
- Event listings
- Ambassador program content
- Architecture responsibilities and references

To update portal content, edit `src/data/portal.js`, then rebuild and redeploy.

## Ownership and References

- Owner: IT Enterprise AI Team (`ITEnterpriseAIteam@forcepoint.com`)
- Program manager: Jim Costigan (`jim.costigan@forcepoint.com`)
- Jira: [AI-110 — Build Dedicated AI Enablement Portal for Forcepoint](https://forcepoint.atlassian.net/browse/AI-110)
- Confluence: [AI Enablement Portal](https://forcepoint.atlassian.net/wiki/spaces/AI/pages/5009637449)
- Architecture reference: [Deployment Architecture](https://forcepoint.atlassian.net/wiki/spaces/AI/pages/5011832833)

## Recommended Next Hardening Steps

- Add lint/test scripts and CI quality gates.
- Move browser-based GitHub submission actions to a backend service.
- Complete DLP inspection implementation in `api/ask/index.js` before wider rollout.

## Future Implementation Roadmap

The following items are recommended for the next delivery phases.

### Phase 1: Engineering quality baseline

- Add ESLint + Prettier and enforce in CI.
- Add unit tests for key React sections and helper logic.
- Add API contract tests for `api/ask`.

### Phase 2: Security and compliance controls

- Implement DLP checks at P1 and P3 in `api/ask/index.js`.
- Add centralized audit logging for assistant requests/responses (metadata only).
- Apply API throttling/rate limits and abuse monitoring.

### Phase 3: Submission workflow hardening

- Move GitHub write/PR operations from browser to backend API.
- Replace `VITE_GITHUB_PAT` usage with managed identity or secure service credentials.
- Add approval/validation gates for skill metadata before PR creation.

### Phase 4: Operations and observability

- Instrument frontend and API telemetry (errors, latency, adoption).
- Add dashboards for section usage and assistant interaction health.
- Define SLOs and alerting for API availability and response time.

### Phase 5: Product evolution

- Replace stubbed `askQuick`/`askHero` integration with full assistant UX flow.
- Add role-aware content targeting by audience/team.
- Expand skills lifecycle with review status tracking and governance checkpoints.
