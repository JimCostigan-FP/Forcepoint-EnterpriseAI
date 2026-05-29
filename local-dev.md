# local-dev branch

A branch-local SSO bypass so you can iterate on the UI with just
`npm run dev` — no need to stand up the Node API server (`npm run dev:api`)
alongside Vite just to get past the LoginPage.

This branch is **never merged to `main`**. It rides on top of `main` and is
rebased forward whenever upstream advances.

## Onboarding (one-time)

```bash
git fetch origin
git checkout local-dev
cp .env.local.example .env.local      # gitignored
npm install
npm run dev                            # http://localhost:5173/
```

That's it. Open the URL and you'll land on the Overview page rendered as
the placeholder identity in [`src/lib/identity.js`](src/lib/identity.js) —
no LoginPage, no SSO round-trip.

## How the bypass works

Two things make it active:

1. **`.env.local`** sets `VITE_AUTH_BYPASS=true`. Vite picks it up at dev
   server start. The file is gitignored so it stays branch-local.
2. **[`src/lib/auth.js`](src/lib/auth.js)** short-circuits `useCurrentUser`
   when the flag is on: returns an `authenticated` state populated from
   `useIdentity()`, skips the `/api/auth/me` fetch, and no-ops `refresh`
   and `signInAsDev`. The user object is tagged `provider: 'bypass'` so
   any UI that surfaces the provider field shows "Dev session" rather
   than "Okta SSO".

## Production safety

The bypass cannot reach production builds. The guard is:

```js
const BYPASS_AUTH =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true'
```

Vite replaces `import.meta.env.DEV` with a literal `false` during
`npm run build`, which short-circuits the `&&` and lets dead-code
elimination remove the entire bypass branch from `dist/`. Verified by
building with `VITE_AUTH_BYPASS=true` set in the env and grepping the
output — zero bypass strings in the bundle.

In other words: even if `local-dev` were accidentally built and shipped
to the production server, the bypass would not activate. The branch is
still **not intended** for production deploys — `main` is the deployment
source of truth.

## What still requires the API server

The bypass fakes the **client** auth state only. The Express server's
`okta.requireAuth` middleware still checks the session on every API
request. That means:

| Endpoint | Behavior with bypass only |
|---|---|
| `/api/auth/me` | Never called (client skips it) |
| `/api/ask` | Returns 401 if hit — needs real session |
| `/api/iris-intake` | Returns 401 if hit — needs real session |
| GitHub PR submission in [`SkillSubmit`](src/components/skills/SkillSubmit.jsx) | Works — talks to GitHub directly with the PAT the user pastes in |

For pure UI iteration (skill creator, navigation, layouts, copy, theming)
the bypass alone is enough. If you need the AI assistant or the Iris
intake endpoint, also run `npm run dev:api` in a second terminal.

## Staying current with main

When `main` advances and you want the latest upstream work locally:

```bash
git checkout local-dev
git fetch origin
git rebase origin/main
git push --force-with-lease           # if you'd previously pushed
```

`--force-with-lease` (not `--force`) refuses to overwrite if someone else
has pushed to `local-dev` in the meantime — protects against quietly
stomping a teammate's work.

The only file the rebase typically touches is [`src/lib/auth.js`](src/lib/auth.js).
If `useCurrentUser` is refactored upstream, redo the short-circuit at the
new entry point — the pattern is well-commented in the file.

## Do not

- **Do not merge `local-dev` into `main`.** The bypass is supposed to live
  only on this branch. Production safety relies on the DEV guard, but
  defense-in-depth means keeping the bypass code out of the deployed
  source tree.
- **Do not commit your `.env.local`.** It's gitignored — keep it that way.
  If you ever see it in `git status`, check the `.gitignore` before
  doing anything else.
- **Do not deploy this branch to `10.23.80.28`.** The deploy runbook
  builds from `main`. See the main `README.md` for the deploy procedure.
