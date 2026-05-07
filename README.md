# Forcepoint AI Enablement Portal

The Forcepoint AI Enablement Portal is an internal web application that centralizes AI guidance, governance, and adoption workflows for Forcepoint teams. It combines curated enablement content with secure assistant access and skill lifecycle tooling in one authenticated experience.

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
│   ├── main.jsx                         # React bootstrap
│   ├── App.jsx                          # Navigation + section routing
│   ├── data.js                          # Content model for portal sections
│   ├── api.js                           # Browser API client (direct/proxy modes)
│   ├── portal.css                       # Global portal styles
│   └── components/
│       ├── Header.jsx / Footer.jsx      # Shared layout
│       ├── SkillBuilder.jsx             # SKILL.md ZIP tooling
│       ├── SkillSubmit.jsx              # GitHub submission + PR flow
│       ├── GoSacBuilder.jsx             # Additional builder workflow
│       └── sections/                    # Home/Howtos/News/etc. section components
├── api/
│   └── ask/index.js                     # Azure Function Anthropic proxy
├── public/                              # Static assets
├── staticwebapp.config.json             # Auth, headers, routing, API runtime
├── index.html                           # Vite HTML entry
├── package.json                         # Scripts and dependencies
├── css/                                 # Legacy static assets (older implementation)
├── js/                                  # Legacy static assets (older implementation)
└── signal/                              # Additional project content/assets
```

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
- Content rendering from `src/data.js`
- No console errors in the browser

### 3) Validate assistant mode before testing

In `src/api.js`, decide how assistant calls should run:

- `USE_PROXY: false` for temporary local direct testing
- `USE_PROXY: true` for proxy-based behavior aligned to production

### 4) Make and verify content/app changes

- Update content in `src/data.js` and/or section components in `src/components/sections/`
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

`src/api.js` defines client-side behavior:

- `USE_PROXY`: whether requests go through `/api/ask`
- `PROXY_URL`: proxy endpoint path (default `/api/ask`)
- `API_KEY`: direct Anthropic key (local testing only)
- `MODEL`: Anthropic model id
- `MAX_TOKENS`: token limit per request

Recommended practice:

- Local experiments: direct mode can be used temporarily
- Shared/production: use proxy mode and keep keys server-side only

### Skill submission integration

`src/components/SkillSubmit.jsx` uses:

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

## Security and Governance Notes

- Never commit API keys, PATs, or client secrets.
- `api/ask/index.js` contains explicit DLP insertion points:
  - P1: pre-prompt forwarding
  - P3: pre-response return
- All portal routes and API routes require authentication.
- Assistant system instructions are designed to reinforce Forcepoint AI policy and safe-response behavior.

## Content Management

Most editorial content is centralized in `src/data.js`, including:

- How-tos
- News
- Skills catalog cards
- Prompt examples
- Event listings
- Ambassador program content
- Architecture responsibilities and references

To update portal content, edit `src/data.js`, then rebuild and redeploy.

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
