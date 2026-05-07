import { useEffect, useMemo, useState } from 'react'
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

function readInitialTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') || 'light'
}

function readInitialCollapsed() {
  if (typeof window === 'undefined') return false
  try { return localStorage.getItem('fp-sidebar') === 'collapsed' } catch { return false }
}

export default function App() {
  const [activeSection, setActiveSection]   = useState('home')
  const [theme, setTheme]                   = useState(readInitialTheme)
  const [sidebarCollapsed, setCollapsed]    = useState(readInitialCollapsed)
  const [globalQuery, setGlobalQuery]       = useState('')

  const activeLabel = useMemo(
    () => TABS.find(t => t.id === activeSection)?.label ?? 'Overview',
    [activeSection],
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('fp-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('fp-sidebar', sidebarCollapsed ? 'collapsed' : 'expanded') } catch {}
  }, [sidebarCollapsed])

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const el = document.querySelector('.topbar-search-input')
        if (el) { el.focus(); el.select?.() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function showSection(id) {
    setActiveSection(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // askQuick/askAI stubbed pending Copilot integration
  function askQuick(/* question */) {}
  function askAI() {}
  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark') }

  return (
    <>
      <Sidebar
        tabs={TABS}
        activeSection={activeSection}
        onShowSection={showSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      <Topbar
        activeLabel={activeLabel}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAskAI={askAI}
        searchValue={globalQuery}
        onSearch={setGlobalQuery}
      />

      <main className="main" id="main-content">
        <div className="main-inner">
          <HomeSection         active={activeSection === 'home'}         onShowSection={showSection} onAskQuick={askQuick} />
          <HowtosSection       active={activeSection === 'howtos'}       onAskQuick={askQuick} />
          <NewsSection         active={activeSection === 'news'} />
          <SkillsSection       active={activeSection === 'skills'}       onAskQuick={askQuick} initialQuery={globalQuery} />
          <PromptsSection      active={activeSection === 'prompts'}      onAskQuick={askQuick} />
          <EventsSection       active={activeSection === 'events'}       onAskQuick={askQuick} />
          <AmbassadorSection   active={activeSection === 'ambassador'}   onAskQuick={askQuick} />
          <ArchitectureSection active={activeSection === 'architecture'} onAskQuick={askQuick} />
          <SignalSection       active={activeSection === 'signal'} />

          <Footer />
        </div>
      </main>

      <AskAIFloat onClick={askAI} />

      <RootDataAttr collapsed={sidebarCollapsed} />
    </>
  )
}

// React renders into #root; we just sync attributes on it for layout state.
function RootDataAttr({ collapsed }) {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    root.dataset.sidebar = collapsed ? 'collapsed' : 'expanded'
  }, [collapsed])
  return null
}
