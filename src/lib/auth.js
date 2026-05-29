/**
 * useCurrentUser — reads the active Okta SSO session from the portal API.
 * Jira: AI-468 — SSO/Okta Login Integration for the Skills Portal
 *
 * Calls /api/auth/me, which is served by the Node API on the box and reads
 * the express-session populated by the Okta SAML ACS handler (or by the
 * /auth/dev-login shortcut when dev login is enabled). See auth/okta.cjs.
 *
 * The response also carries `features` (oktaConfigured, devLoginEnabled,
 * authMode) so the LoginPage can render the right set of sign-in buttons.
 */

import { useCallback, useEffect, useState } from 'react'
import { useIdentity } from './identity.js'

const ME_ENDPOINT        = '/api/auth/me'
const DEV_LOGIN_ENDPOINT = '/auth/dev-login'

export const LOGIN_URL  = '/auth/login'
export const LOGOUT_URL = '/auth/logout'

// Local-dev escape hatch. Set VITE_AUTH_BYPASS=true in .env.local to skip
// the SSO LoginPage and render as the placeholder identity. Only active in
// dev builds — Vite strips it from production bundles when the flag is
// unset at build time. Branch: local-dev.
const BYPASS_AUTH = import.meta.env.VITE_AUTH_BYPASS === 'true'

export function useCurrentUser() {
  const identity = useIdentity()

  // Hooks must run in the same order every render, so the bypass folds into
  // the initial state + skips side effects rather than early-returning.
  const [state, setState] = useState(() => (
    BYPASS_AUTH
      ? {
          status:   'authenticated',
          user:     { name: identity.name, email: identity.email, provider: 'bypass' },
          features: { oktaConfigured: false, devLoginEnabled: false, authMode: 'bypass' },
          error:    null,
        }
      : {
          status:   'loading',  // 'loading' | 'authenticated' | 'anonymous' | 'error'
          user:     null,
          features: { oktaConfigured: false, devLoginEnabled: false },
          error:    null,
        }
  ))

  const refresh = useCallback(async () => {
    if (BYPASS_AUTH) return
    try {
      const res = await fetch(ME_ENDPOINT, { credentials: 'include' })
      const payload = await res.json().catch(() => ({}))
      const features = payload.features || { oktaConfigured: false, devLoginEnabled: false }
      if (res.status === 401 || !payload.authenticated) {
        setState({ status: 'anonymous', user: null, features, error: null })
        return
      }
      if (!res.ok) {
        setState({ status: 'error', user: null, features, error: `HTTP ${res.status}` })
        return
      }
      setState({ status: 'authenticated', user: payload, features, error: null })
    } catch (err) {
      setState(s => ({ ...s, status: 'error', error: err.message }))
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const signInAsDev = useCallback(async () => {
    if (BYPASS_AUTH) return
    const res = await fetch(DEV_LOGIN_ENDPOINT, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Dev login failed (HTTP ${res.status}).`)
    }
    await refresh()
  }, [refresh])

  return { ...state, refresh, signInAsDev }
}
