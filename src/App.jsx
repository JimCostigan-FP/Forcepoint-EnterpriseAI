import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Footer from './components/Footer.jsx'
import AskAIFloat from './components/AskAIFloat.jsx'
import HomeSection from './components/sections/HomeSection.jsx'
import HowtosSection from './components/sections/HowtosSection.jsx'
import NewsSection from './components/sections/NewsSection.jsx'
import SkillsSection from './components/sections/SkillsSection.jsx'
import PromptsSection from './components/sections/PromptsSection.jsx'
import EventsSection from './components/sections/EventsSection.jsx'
import AmbassadorSection from './components/sections/AmbassadorSection.jsx'
import ArchitectureSection from './components/sections/ArchitectureSection.jsx'
import SignalSection from './components/sections/SignalSection.jsx'

const TABS = [
  { id: 'home',         label: 'Overview' },
  { id: 'skills',       label: 'Skills library' },
  { id: 'prompts',      label: 'Prompt showcase' },
  { id: 'howtos',       label: 'How-tos & tips' },
  { id: 'events',       label: 'Events' },
  { id: 'news',         label: 'Latest news' },
  { id: 'ambassador',   label: 'AI Ambassador' },
  { id: 'architecture', label: 'Architecture & IT' },
  { id: 'signal',       label: 'The Signal' },
]

const MOBILE_QUERY = '(max-width: 720px)'

function readInitialTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') || 'light'
}

// One unified flag. On desktop: open=expanded, closed=icon-only.
// On mobile: open=drawer visible, closed=drawer hidden (default).
function readInitialSidebarOpen() {
  if (typeof window === 'undefined') return true
  const isMobile = window.matchMedia(MOBILE_QUERY).matches
  if (isMobile) return false
  try { return localStorage.getItem('fp-sidebar') !== 'collapsed' } catch { return true }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [theme, setTheme]                 = useState(readInitialTheme)
  const [sidebarOpen, setSidebarOpen]     = useState(readInitialSidebarOpen)
  const [globalQuery, setGlobalQuery]     = useState('')
  const [toast, setToast]                 = useState(null)

  const activeLabel = useMemo(
    () => TABS.find(t => t.id === activeSection)?.label ?? 'Overview',
    [activeSection],
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('fp-theme', theme) } catch {}
  }, [theme])

  // Sync sidebar state to root data-attr synchronously to avoid flicker.
  // Persist desktop preference; mobile drawer state is ephemeral.
  useLayoutEffect(() => {
    const root = document.getElementById('root')
    if (root) root.dataset.sidebarOpen = sidebarOpen ? 'true' : 'false'
    if (!window.matchMedia(MOBILE_QUERY).matches) {
      try { localStorage.setItem('fp-sidebar', sidebarOpen ? 'expanded' : 'collapsed') } catch {}
    }
  }, [sidebarOpen])

  // Body scroll lock while mobile drawer open
  useLayoutEffect(() => {
    const isMobile = window.matchMedia(MOBILE_QUERY).matches
    document.body.style.overflow = (isMobile && sidebarOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  // ⌘K / Ctrl+K focuses search; ESC closes mobile drawer
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const el = document.querySelector('.topbar-search-input')
        if (el) { el.focus(); el.select?.() }
      }
      if (e.key === 'Escape' && window.matchMedia(MOBILE_QUERY).matches && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  // Reconcile state on viewport changes (e.g., rotate device).
  // Mobile breakpoint changes default to "closed", desktop default to last preference.
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    function onChange(e) {
      if (e.matches) setSidebarOpen(false)
      else {
        try { setSidebarOpen(localStorage.getItem('fp-sidebar') !== 'collapsed') } catch { setSidebarOpen(true) }
      }
    }
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  function showSection(id) {
    setActiveSection(id)
    if (window.matchMedia(MOBILE_QUERY).matches) setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onSearchSubmit() {
    if (globalQuery.trim()) showSection('skills')
  }

  function notify(label) {
    setToast(label)
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setToast(null), 2200)
  }
  function askQuick(/* question */) { notify('AI assistant — coming soon') }
  function askAI()                  { notify('AI assistant — coming soon') }

  function toggleTheme()   { setTheme(t => t === 'dark' ? 'light' : 'dark') }
  function toggleSidebar() { setSidebarOpen(o => !o) }

  const isMobile = typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches

  return (
    <>
      <Topbar
        activeLabel={activeLabel}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchValue={globalQuery}
        onSearch={setGlobalQuery}
        onSearchSubmit={onSearchSubmit}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar
        tabs={TABS}
        activeSection={activeSection}
        onShowSection={showSection}
      />

      {/* Mobile backdrop — only renders when drawer is open AND on mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="main" id="main-content">
        <div className="main-inner">
          <HomeSection         active={activeSection === 'home'}         onShowSection={showSection} onAskQuick={askQuick} />
          <HowtosSection       active={activeSection === 'howtos'}       onAskQuick={askQuick} />
          <NewsSection         active={activeSection === 'news'} />
          <SkillsSection
            active={activeSection === 'skills'}
            onAskQuick={askQuick}
            query={globalQuery}
            onQueryChange={setGlobalQuery}
          />
          <PromptsSection      active={activeSection === 'prompts'}      onAskQuick={askQuick} />
          <EventsSection       active={activeSection === 'events'}       onAskQuick={askQuick} />
          <AmbassadorSection   active={activeSection === 'ambassador'}   onAskQuick={askQuick} />
          <ArchitectureSection active={activeSection === 'architecture'} onAskQuick={askQuick} />
          <SignalSection       active={activeSection === 'signal'} />

          <Footer />
        </div>
      </main>

      <AskAIFloat onClick={askAI} />

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  )
}
