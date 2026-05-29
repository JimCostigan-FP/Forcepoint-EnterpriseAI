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
import { LockIcon, ShieldIcon, ArrowRight, WrenchIcon, SunIcon, MoonIcon } from '../ui/icons.jsx'
import { LOGIN_URL } from '../../lib/auth.js'
import { useTheme } from '../../lib/theme.js'
import './login.css'

export default function LoginPage({ features, onDevLogin, returnTo = '/' }) {
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState(null)
  const { theme, toggle: toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

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
      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${nextTheme} mode`}
        title={`Switch to ${nextTheme} mode`}
      >
        {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </button>

      <div className="login-card">
        <div className="login-brand">
          <img className="login-brand-icon" src="/fp-icon.png" alt="Forcepoint" />
          <div className="login-brand-title">Forcepoint Enterprise AI</div>
        </div>

        <h1 className="login-headline">Sign in</h1>

        <div className="login-options">
          {/* Always clickable. With a real SAML cert installed, this kicks
              off the Okta OIDC redirect. Without, the backend renders a
              diagnostic page explaining what's missing. */}
          <a className="login-option login-option-primary" href={oktaHref}>
            <div className="login-option-icon"><ShieldIcon size={20} /></div>
            <div className="login-option-text">
              <div className="login-option-title">
                Continue with Forcepoint SSO
                {!oktaReady && <span className="login-option-pill login-option-pill-pending">pending wiring</span>}
              </div>
            </div>
            <ArrowRight size={16} className="login-option-arrow" />
          </a>

          {/* Dev login is hidden in production (IRIS_ALLOW_DEV_LOGIN=0). */}
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
              </div>
              <ArrowRight size={16} className="login-option-arrow" />
            </button>
          )}

          {!oktaReady && !devEnabled && (
            <div className="login-locked">
              <LockIcon size={16} />
              <span>No sign-in method is currently enabled on this server.</span>
            </div>
          )}
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="login-footnote">
          Forcepoint AI Policy (FP-IS-AI) applies. Need help? <a href="mailto:ITEnterpriseAIteam@forcepoint.com">Contact IT Enterprise AI</a>
        </div>
      </div>
    </div>
  )
}
