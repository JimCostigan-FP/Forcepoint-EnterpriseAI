/**
 * useCurrentUser — reads the active Okta SSO session from the portal API.
 *
 * Calls /api/auth/me, which is served by the Node API on the box and reads
 * the express-session populated by the Okta SAML ACS handler (or by the
 * /auth/dev-login shortcut when dev login is enabled). See auth/okta.cjs.
 *
 * The response also carries `features` (oktaConfigured, devLoginEnabled,
 * authMode) so the LoginPage can render the right set of sign-in buttons.
 */

import { useCallback, useEffect, useState } from 'react'

const ME_ENDPOINT        = '/api/auth/me'
const DEV_LOGIN_ENDPOINT = '/auth/dev-login'

export const LOGIN_URL  = '/auth/login'
export const LOGOUT_URL = '/auth/logout'

export function useCurrentUser() {
  const [state, setState] = useState({
    status:   'loading',  // 'loading' | 'authenticated' | 'anonymous' | 'error'
    user:     null,
    features: { oktaConfigured: false, devLoginEnabled: false },
    error:    null,
  })

  const refresh = useCallback(async () => {
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
