import { useEffect, useRef, useState } from 'react'
import { LOGOUT_URL } from '../../lib/auth.js'
import { useTheme } from '../../lib/theme.js'
import { SunIcon, MoonIcon } from '../ui/icons.jsx'
import './Header.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className="site-theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  )
}

function initialsOf(nameOrEmail) {
  if (!nameOrEmail) return '?'
  const base = String(nameOrEmail).split('@')[0].replace(/[._-]+/g, ' ').trim()
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Fallback derivation when the server didn't supply `user.firstName`.
// Handles the "Last, First" display-name shape Okta/AD often emits
// alongside the more familiar "First Last" and email forms.
function firstNameOf(nameOrEmail) {
  if (!nameOrEmail) return ''
  const raw = String(nameOrEmail).trim()
  if (!raw) return ''
  // Email — drop the domain, normalize separators.
  const local = raw.includes('@')
    ? raw.split('@')[0].replace(/[._-]+/g, ' ').trim()
    : raw
  // "Last, First" → take the token after the comma.
  const candidate = local.includes(',')
    ? local.slice(local.indexOf(',') + 1).trim().split(/\s+/)[0]
    : local.split(/\s+/)[0]
  return candidate ? candidate.charAt(0).toUpperCase() + candidate.slice(1) : ''
}

// Prefer the server-derived first name; fall back to parsing.
function pickFirstName(user) {
  if (user?.firstName) return user.firstName
  return firstNameOf(user?.name || user?.email)
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const name     = user?.name || user?.email || 'User'
  const email    = user?.email || ''
  const provider = user?.provider === 'okta' ? 'Okta SSO' : 'Dev session'

  return (
    <div className="site-user" ref={wrapRef}>
      <button
        type="button"
        className={`site-user-trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="site-user-avatar" aria-hidden="true">{initialsOf(user?.name || user?.email)}</span>
        <span className="site-user-name">{pickFirstName(user) || name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className={`site-user-chev${open ? ' is-open' : ''}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="site-user-menu" role="menu">
          <div className="site-user-menu-head">
            <div className="site-user-menu-name">{name}</div>
            {email && <div className="site-user-menu-email">{email}</div>}
            <div className="site-user-menu-provider">{provider}</div>
          </div>
          <a className="site-user-menu-item" href={LOGOUT_URL} role="menuitem">
            Sign out
          </a>
        </div>
      )}
    </div>
  )
}

export default function Header({ activeSection, tabs, onShowSection, onAskQuick, auth }) {
  // App-level gate guarantees auth.status === 'authenticated' here; the
  // user prop is always present.
  const user = auth?.user
  const firstName = pickFirstName(user)

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="site-logo">
          <img className="site-logo-wordmark" src="/fp-logo-white.svg" alt="Forcepoint" />
          <div className="site-logo-text">
            <span className="site-logo-title">Enterprise AI</span>
            <span className="site-logo-sub">IT Enterprise AI team · CIO Organization</span>
          </div>
        </div>
        <nav className="header-nav" aria-label="Quick links">
          <a href="#" onClick={e => { e.preventDefault(); onAskQuick('What AI tools are approved for use at Forcepoint?') }}>Tools</a>
          <a href="#" onClick={e => { e.preventDefault(); onAskQuick('How do I get started with the AI Ambassador program?') }}>Ambassador</a>
          <a href="#" onClick={e => { e.preventDefault(); onAskQuick('What is the Forcepoint AI governance policy?') }}>Policy</a>

          <ThemeToggle />
          <UserMenu user={user} />
        </nav>
      </div>

      <div className="site-hero">
        <div className="site-hero-eyebrow">
          {firstName ? `Welcome back, ${firstName}` : 'Your AI guide, built for Forcepoint'}
        </div>
        <h1 className="site-hero-headline">Know more.<br />Work smarter.<br />Stay secure.</h1>
        <p className="site-hero-body">Everything you need to use AI confidently at Forcepoint — tools, skills, prompts, events and expert guidance, in one place.</p>
        <div className="site-hero-actions">
          <button className="site-hero-cta" onClick={() => onShowSection('ask')}>Ask AI ✨</button>
          <button className="site-hero-cta site-hero-cta-ghost" onClick={() => onShowSection('skills')}>Browse skills</button>
          <button className="site-hero-cta site-hero-cta-ghost" onClick={() => onShowSection('howtos')}>How-tos &amp; tips</button>
        </div>
      </div>

      <nav className="tab-nav" aria-label="Section navigation">
        {/* Inner wrapper shares the page container's max-width and padding
            so the tab strip aligns with the hero and section content above
            and below it. The dark strip itself (.tab-nav) still spans the
            full viewport width. */}
        <div className="tab-nav-inner">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab${activeSection === tab.id ? ' active' : ''}`}
              onClick={() => onShowSection(tab.id)}
            >
              {tab.label}
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
