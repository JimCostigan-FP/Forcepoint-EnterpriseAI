/**
 * Theme — day/night toggle for the portal.
 *
 * The dark palette is already defined under [data-theme="dark"] in
 * styles/tokens.css; this module just decides when to set that attribute
 * on <html> and persists the user's pick in localStorage.
 *
 * Resolution order:
 *   1. localStorage `iris.theme`  ('light' | 'dark')
 *   2. window.matchMedia('(prefers-color-scheme: dark)')
 *   3. light (fallback)
 *
 * The initial paint runs before React mounts (see main.jsx) so the page
 * doesn't flash the wrong palette during JS bootstrap.
 */

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'iris.theme'

export function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* private mode etc. */ }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
  // Keep the browser chrome (address bar tint, etc.) consistent with the
  // active palette on mobile/Safari.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A0E14' : '#042C53')
}

export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light'
  )

  const setTheme = useCallback((next) => {
    const value = next === 'dark' ? 'dark' : 'light'
    setThemeState(value)
    applyTheme(value)
    try { window.localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // If no explicit pick is stored, follow the OS preference as it changes.
  useEffect(() => {
    const stored = (() => {
      try { return window.localStorage.getItem(STORAGE_KEY) } catch { return null }
    })()
    if (stored === 'light' || stored === 'dark') return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [setTheme])

  return { theme, setTheme, toggle }
}
