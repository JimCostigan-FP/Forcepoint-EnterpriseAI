/**
 * LoginPage — sign-in surface for the Iris portal.
 * Jira: AI-468 (SSO/Okta Login Integration) · AI-476 (Okta app build)
 *
 * Two paths:
 *   1. "Continue with Forcepoint SSO" → /auth/login → Okta SAML 2.0 SSO.
 *      Always clickable so operators see what happens when the IdP cert
 *      isn't installed (a server-rendered diagnostic page).
 *   2. "Continue with dev login"      → POST /auth/dev-login → impersonation
 *      session, useful for testing the portal before the real Okta app is
 *      assigned. Hidden when devLoginEnabled is false.
 *
 * After either flow completes, the page returns the user to `returnTo`
 * (defaults to /).
 */

import { useState } from 'react'
import { LockIcon, ShieldIcon, ArrowRight, WrenchIcon } from '../ui/icons.jsx'
import { LOGIN_URL } from '../../lib/auth.js'
import './login.css'

export default function LoginPage({ features, onDevLogin, returnTo = '/' }) {
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState(null)

  const safeReturn = (typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//'))
    ? returnTo : '/'

  const oktaHref     = `${LOGIN_URL}?returnTo=${encodeURIComponent(safeReturn)}`
  const oktaReady    = !!features?.oktaConfigured
  const devEnabled   = !!features?.devLoginEnabled

  const handleDevClick = async () => {
    setBusy(true); setError(null)
    try {
      await onDevLogin()
    } catch (e) {
      setError(e.message || 'Dev login failed.')
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img className="login-brand-icon" src="/fp-icon.png" alt="Forcepoint" />
          <div className="login-brand-text">
            <div className="login-brand-title">Forcepoint Enterprise AI</div>
            <div className="login-brand-sub">Iris Skills Portal · sign in to continue</div>
          </div>
        </div>

        <h1 className="login-headline">Sign in</h1>
        <p className="login-body">
          Iris uses Forcepoint single sign-on (Okta). Pick the path that fits
          how you're using the portal today.
        </p>

        <div className="login-options">
          {/* ── Real Okta SSO ─────────────────────────────────────────────
              Always clickable so operators can see exactly what /auth/login
              returns when the SAML cert isn't installed (a diagnostic HTML
              page from the backend). Once the IdP cert lands, the same
              click POSTs a real SAMLRequest to Okta. */}
          <a className="login-option login-option-primary" href={oktaHref}>
            <div className="login-option-icon"><ShieldIcon size={20} /></div>
            <div className="login-option-text">
              <div className="login-option-title">
                Continue with Forcepoint SSO
                {!oktaReady && <span className="login-option-pill login-option-pill-pending">pending wiring</span>}
              </div>
              <div className="login-option-sub">
                {oktaReady
                  ? 'Sign in with your Forcepoint Okta account.'
                  : 'Okta SAML cert is not yet on this server — clicking shows the diagnostic page.'}
              </div>
            </div>
            <ArrowRight size={16} className="login-option-arrow" />
          </a>

          {/* ── Dev login (testing only) ──────────────────────────────── */}
          {devEnabled && (
            <button
              type="button"
              className="login-option login-option-secondary"
              onClick={handleDevClick}
              disabled={busy}
            >
              <div className="login-option-icon login-option-icon-amber"><WrenchIcon size={20} /></div>
              <div className="login-option-text">
                <div className="login-option-title">
                  Continue with dev login
                  <span className="login-option-pill">testing</span>
                </div>
                <div className="login-option-sub">
                  Skip Okta and sign in as the impersonation user. Useful
                  while we wait on the Okta app credentials.
                </div>
              </div>
              <ArrowRight size={16} className="login-option-arrow" />
            </button>
          )}

          {!oktaReady && !devEnabled && (
            <div className="login-locked">
              <LockIcon size={16} />
              <span>
                No sign-in method is currently enabled on this server. Ask
                the platform team to populate <code>SAML_IDP_CERT</code> or
                set <code>IRIS_ALLOW_DEV_LOGIN=1</code>.
              </span>
            </div>
          )}
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="login-footnote">
          By signing in you accept the Forcepoint AI Policy (FP-IS-AI). Issues?
          Email <a href="mailto:ITEnterpriseAIteam@forcepoint.com">ITEnterpriseAIteam@forcepoint.com</a>.
        </div>
      </div>
    </div>
  )
}
